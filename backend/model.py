import matplotlib.pyplot as plt
import numpy as np
import time
import os
import tensorflow as tf
import pathlib
import json
import cv2
from tensorflow.keras.models import load_model
from sklearn.metrics import roc_curve, auc, confusion_matrix, precision_score, recall_score, f1_score
import pandas as pd
from glob import glob
from itertools import chain
from sklearn.model_selection import train_test_split
import seaborn as sns

# Default Tensorflow to use GPU instead of CPU
physical_devices = tf.config.list_physical_devices('GPU')
if physical_devices:
    try:
        # Allow memory growth
        for device in physical_devices:
            tf.config.experimental.set_memory_growth(device, True)
            
        # Set the visible devices
        tf.config.set_visible_devices(physical_devices[0], 'GPU')
    except RuntimeError as e:
        print(e)

def create_model_architecture(input_shape=(224, 224, 3), num_classes=14):
    """
    Creates a model with the same architecture as the one used in training.
    This function avoids the need to save/load model architecture using JSON.
    
    Args:
        input_shape: Shape of input images (default: 224x224x3)
        num_classes: Number of classes for the output layer (default: 14)
        
    Returns:
        A compiled Keras model
    """
    # Load the pre-trained EfficientNetB4 model without the top classification layer
    base_model = tf.keras.applications.EfficientNetB4(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape
    )
    
    # Freeze the base model for transfer learning
    base_model.trainable = False
    
    # Build the new model on top of the pre-trained base
    inputs = tf.keras.Input(shape=input_shape)
    # Pass the inputs through the base model
    x = base_model(inputs, training=False)
    # Global pooling to reduce dimensions
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    # Add dropout for regularization
    x = tf.keras.layers.Dropout(0.2)(x)
    # Final dense layer with sigmoid activation for multi-label output
    outputs = tf.keras.layers.Dense(num_classes, activation='sigmoid')(x)
    
    model = tf.keras.Model(inputs, outputs)
    
    # Compile the model
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
        loss='binary_crossentropy',
        metrics=['binary_accuracy', 'mae']
    )
    
    return model

def tensor_to_python(obj):
    """
    Recursively convert TensorFlow tensors to Python native types.
    Works with nested structures (lists, tuples, dicts).
    """
    if hasattr(obj, 'numpy'):
        # Convert TensorFlow tensor to numpy array
        numpy_val = obj.numpy()
        # Convert numpy array to a Python native type
        if numpy_val.size == 1:  # Single value
            return float(numpy_val)
        else:  # Array
            return numpy_val.tolist()
    elif isinstance(obj, (list, tuple)):
        # Recursively convert elements in lists or tuples
        return [tensor_to_python(item) for item in obj]
    elif isinstance(obj, dict):
        # Recursively convert values in dictionaries
        return {key: tensor_to_python(value) for key, value in obj.items()}
    elif isinstance(obj, np.ndarray):
        # Handle numpy arrays directly
        if obj.size == 1:
            return float(obj)
        else:
            return obj.tolist()
    # Return other types unchanged
    return obj

# CRITICAL: Custom Keras History callback to avoid serialization issues
class CustomHistory(tf.keras.callbacks.Callback):
    def __init__(self):
        super(CustomHistory, self).__init__()
        self.history = {}  # Dictionary to store metrics
        
    def on_epoch_end(self, epoch, logs=None):
        # Store metrics as native Python types, not TensorFlow tensors
        logs = logs or {}
        for metric, value in logs.items():
            if metric not in self.history:
                self.history[metric] = []
            # Convert TensorFlow tensors to Python native types
            value = tensor_to_python(value)
            self.history[metric].append(value)

# Completely custom model checkpoint implementation to avoid any TensorFlow serialization issues
class CompletelyCustomModelCheckpoint(tf.keras.callbacks.Callback):
    def __init__(self, filepath, monitor='val_loss', verbose=0, save_best_only=False, mode='auto'):
        super(CompletelyCustomModelCheckpoint, self).__init__()
        self.filepath = filepath
        self.monitor = monitor
        self.verbose = verbose
        self.save_best_only = save_best_only
        
        # Set the mode and the monitor_op
        if mode == 'min' or (mode == 'auto' and 'loss' in monitor):
            self.monitor_op = np.less
            self.best = float('inf')
        else:
            self.monitor_op = np.greater
            self.best = float('-inf')
    
    def on_epoch_end(self, epoch, logs=None):
        # Ensure logs is a dictionary with Python native types
        logs = logs or {}
        logs_safe = {}
        for key, value in logs.items():
            if hasattr(value, 'numpy'):
                logs_safe[key] = float(value.numpy())
            elif isinstance(value, np.ndarray):
                logs_safe[key] = float(value) if value.size == 1 else value.tolist()
            else:
                logs_safe[key] = float(value) if isinstance(value, (int, float)) else value
        
        # Get the current metric value
        current = logs_safe.get(self.monitor)
        
        if current is None:
            if self.verbose > 0:
                print(f'Can\'t save model: {self.monitor} not available in logs')
            return
        
        # Decide whether to save the model
        if self.save_best_only:
            if self.monitor_op(current, self.best):
                if self.verbose > 0:
                    print(f'\nEpoch {epoch+1}: {self.monitor} improved from {self.best:.5f} to {current:.5f}, saving model to {self.filepath}')
                self.best = current
                
                # Safely save the model using save_weights instead of save
                try:
                    # Save only weights
                    self.model.save_weights(self.filepath)
                except Exception as e:
                    print(f"Error saving model weights: {str(e)}")
            else:
                if self.verbose > 0:
                    print(f'\nEpoch {epoch+1}: {self.monitor} did not improve from {self.best:.5f}')
        else:
            if self.verbose > 0:
                print(f'\nEpoch {epoch+1}: saving model to {self.filepath}')
            try:
                # Save only weights
                self.model.save_weights(self.filepath)
            except Exception as e:
                print(f"Error saving model weights: {str(e)}")

# Custom Early Stopping to avoid tensor serialization issues
class CustomEarlyStopping(tf.keras.callbacks.Callback):
    def __init__(self, monitor='val_loss', min_delta=0, patience=0, verbose=0, restore_best_weights=False, mode='auto'):
        super(CustomEarlyStopping, self).__init__()
        self.monitor = monitor
        self.patience = patience
        self.verbose = verbose
        self.min_delta = min_delta
        self.wait = 0
        self.stopped_epoch = 0
        self.restore_best_weights = restore_best_weights
        self.best_weights = None
        
        if mode == 'min' or (mode == 'auto' and 'loss' in monitor):
            self.monitor_op = np.less
            self.min_delta *= -1
        else:
            self.monitor_op = np.greater
            self.min_delta *= 1
            
        self.best = np.Inf if self.monitor_op == np.less else -np.Inf
    
    def on_train_begin(self, logs=None):
        # Initialize the best as infinity if the monitor op is np.less, otherwise -infinity
        self.best = np.Inf if self.monitor_op == np.less else -np.Inf
        self.wait = 0
        self.stopped_epoch = 0
    
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        current = logs.get(self.monitor)
        
        if current is None:
            return
            
        # Convert to Python native type if needed
        if hasattr(current, 'numpy'):
            current = float(current.numpy())
        elif isinstance(current, np.ndarray):
            current = float(current) if current.size == 1 else current.tolist()
            
        if self.restore_best_weights and self.best_weights is None:
            # Save the weights in the first iteration
            self.best_weights = self.model.get_weights()
            
        if self.monitor_op(current - self.min_delta, self.best):
            self.best = current
            self.wait = 0
            if self.restore_best_weights:
                self.best_weights = self.model.get_weights()
        else:
            self.wait += 1
            if self.wait >= self.patience:
                self.stopped_epoch = epoch
                self.model.stop_training = True
                if self.restore_best_weights and self.best_weights is not None:
                    if self.verbose > 0:
                        print('Restoring model weights from the end of the best epoch')
                    self.model.set_weights(self.best_weights)
    
    def on_train_end(self, logs=None):
        if self.stopped_epoch > 0 and self.verbose > 0:
            print(f'Epoch {self.stopped_epoch + 1}: early stopping')

# Custom ReduceLROnPlateau to avoid tensor serialization issues
class CustomReduceLROnPlateau(tf.keras.callbacks.Callback):
    def __init__(self, monitor='val_loss', factor=0.1, patience=10, verbose=0, mode='auto', min_delta=1e-4, cooldown=0, min_lr=0):
        super(CustomReduceLROnPlateau, self).__init__()
        self.monitor = monitor
        self.factor = factor
        self.min_lr = min_lr
        self.min_delta = min_delta
        self.patience = patience
        self.verbose = verbose
        self.cooldown = cooldown
        self.cooldown_counter = 0
        self.wait = 0
        self.best = 0
        
        if mode == 'min' or (mode == 'auto' and 'loss' in monitor):
            self.monitor_op = np.less
            self.min_delta *= -1
        else:
            self.monitor_op = np.greater
            self.min_delta *= 1
    
    def on_train_begin(self, logs=None):
        self.best = np.Inf if self.monitor_op == np.less else -np.Inf
        self.cooldown_counter = 0
        self.wait = 0
    
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        current = logs.get(self.monitor)
        
        if current is None:
            return
            
        # Convert to Python native type if needed
        if hasattr(current, 'numpy'):
            current = float(current.numpy())
        elif isinstance(current, np.ndarray):
            current = float(current) if current.size == 1 else current.tolist()
            
        if self.cooldown_counter > 0:
            self.cooldown_counter -= 1
            self.wait = 0
            
        if self.monitor_op(current - self.min_delta, self.best):
            self.best = current
            self.wait = 0
        elif self.cooldown_counter <= 0:
            self.wait += 1
            if self.wait >= self.patience:
                old_lr = float(tf.keras.backend.get_value(self.model.optimizer.lr))
                if old_lr > self.min_lr:
                    new_lr = old_lr * self.factor
                    new_lr = max(new_lr, self.min_lr)
                    tf.keras.backend.set_value(self.model.optimizer.lr, new_lr)
                    if self.verbose > 0:
                        print(f'\nEpoch {epoch + 1}: reducing learning rate to {new_lr}.')
                    self.cooldown_counter = self.cooldown
                    self.wait = 0

def create_and_train_model():
    """
    Creates and trains a chest X-ray classification model using EfficientNetB4
    with efficient data pipelining.
    Returns the training history.
    """
    # Load the CSV file
    csv_path = './dataset/Data_Entry_2017.csv'
    all_xray_df = pd.read_csv(csv_path)

    all_image_paths = {os.path.basename(x): x for x in glob(os.path.join('./dataset', 'images*', '*', '*.png'))}
    print('Scans found:', len(all_image_paths), ', Total Headers', all_xray_df.shape[0])
    all_xray_df['path'] = all_xray_df['Image Index'].map(all_image_paths.get)
    
    # Filter out 'No Finding' entries and drop rows with missing paths
    all_xray_df = all_xray_df[~all_xray_df['Finding Labels'].str.contains('No Finding')]
    all_xray_df = all_xray_df.dropna(subset=['path'])
    
    # Get unique labels from the filtered data
    all_unique_labels = sorted(set(label for labels in all_xray_df['Finding Labels']
                                  for label in labels.split('|')))
    print("Unique labels:", all_unique_labels)
    
    # Create a mapping from label to index
    label_to_index = {label: idx for idx, label in enumerate(all_unique_labels)}
    
    # Save class names for later use
    os.makedirs('saved_model', exist_ok=True)
    with open('saved_model/class_names.json', 'w') as f:
        json.dump(all_unique_labels, f)
    print("Class names saved to 'saved_model/class_names.json'")
    
    # Function to convert label string to multi-hot encoded vector
    def multi_hot_encode(label_str, label_to_index):
        labels = label_str.split('|')
        vector = np.zeros(len(label_to_index), dtype=np.float32)
        for label in labels:
            vector[label_to_index[label]] = 1.0
        return vector
    
    # Apply multi-hot encoding to the DataFrame
    all_xray_df['multi_hot'] = all_xray_df['Finding Labels'].apply(
        lambda x: multi_hot_encode(x, label_to_index)
    )
    
    # Resampling with weights (as in data_pipelining.py)
    sample_weights = all_xray_df['Finding Labels'].map(
        lambda x: len(x.split('|')) if len(x) > 0 else 0
    ).values + 4e-2
    sample_weights /= sample_weights.sum()
    all_xray_df = all_xray_df.sample(min(40000, len(all_xray_df)), weights=sample_weights, random_state=42)
    
    # Split into train and validation sets
    train_df, valid_df = train_test_split(all_xray_df, test_size=0.2, random_state=42)
    
    print("Train samples:", len(train_df))
    print("Validation samples:", len(valid_df))
    
    # Define image processing parameters
    img_size = 224  # Using a smaller size to reduce memory usage
    batch_size = 32
    
    # Function to load and preprocess images for TF Dataset
    def load_and_preprocess_image(file_path, label):
        # Read the image from disk
        image_string = tf.io.read_file(file_path)
        # Decode the image (using 3 channels)
        image = tf.image.decode_png(image_string, channels=3)
        # Convert image to float32 in [0,1]
        image = tf.image.convert_image_dtype(image, tf.float32)
        # Resize the image
        image = tf.image.resize(image, [img_size, img_size])
        return image, label
    
    # Create dataset function
    def create_dataset(df, batch_size=32, shuffle=False):
        # Extract file paths and multi-hot labels
        paths = df['path'].tolist()
        labels = np.stack(df['multi_hot'].values)
        
        # Create dataset from tensors
        dataset = tf.data.Dataset.from_tensor_slices((paths, labels))
        dataset = dataset.map(load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
        
        if shuffle:
            dataset = dataset.shuffle(buffer_size=1000)
        
        # Batch and prefetch
        dataset = dataset.batch(batch_size)
        dataset = dataset.prefetch(tf.data.AUTOTUNE)
        return dataset
    
    # Create datasets
    train_dataset = create_dataset(train_df, batch_size=batch_size, shuffle=True)
    valid_dataset = create_dataset(valid_df, batch_size=batch_size)
    
    # Number of classes
    num_classes = len(all_unique_labels)
    
    # Create the model using our architecture function
    model = create_model_architecture(input_shape=(img_size, img_size, 3), num_classes=num_classes)
    
    # Display model summary
    model.summary()
    
    # Use our custom history callback instead of relying on model.fit's history
    custom_history = CustomHistory()
    
    # Define other completely custom callbacks
    callbacks = [
        custom_history,  # Our custom history tracker
        CustomEarlyStopping(
            monitor='val_loss',
            patience=4,
            verbose=1,
            restore_best_weights=True
        ),
        CompletelyCustomModelCheckpoint(
            'saved_model/xray_classifier_weights.h5',
            monitor='val_loss',
            save_best_only=True,
            verbose=1
        ),
        CustomReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            verbose=1
        )
    ]
    
    # Train the model - using our custom history callback
    print("Training the model...")
    epochs = 1  # Increased to 10 epochs for better performance
    
    # Using the regular fit method but with our custom history callback
    model.fit(
        train_dataset,
        epochs=epochs,
        validation_data=valid_dataset,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save model weights only (avoid any JSON serialization)
    try:
        print("Saving model weights...")
        # Save just the weights
        model.save_weights('saved_model/xray_classifier_weights.h5')
        print("Model weights saved successfully to 'saved_model/xray_classifier_weights.h5'")
        
        # Save model architecture note (just a text marker file)
        with open('saved_model/model_architecture_info.txt', 'w') as f:
            f.write(f"Model: EfficientNetB4 with {num_classes} classes\n")
            f.write(f"Input shape: {img_size}x{img_size}x3\n")
            f.write("Use create_model_architecture() function to recreate this model")
        
        print("No need to save architecture - it will be recreated from code")
    except Exception as e:
        print(f"Error during model saving: {str(e)}")
    
    # Save history as CSV instead of JSON to avoid serialization issues
    try:
        history_df = pd.DataFrame(custom_history.history)
        history_df.to_csv('saved_model/training_history.csv', index=False)
        print("Training history saved to 'saved_model/training_history.csv'")
    except Exception as e:
        print(f"Error saving history as CSV: {str(e)}")
        
        # Backup option: Save raw values
        try:
            with open('saved_model/training_history.txt', 'w') as f:
                for key, values in custom_history.history.items():
                    f.write(f"{key}: {','.join(str(v) for v in values)}\n")
            print("Training history saved as text file (fallback)")
        except Exception as e2:
            print(f"Error saving history as text: {str(e2)}")
    
    # Plot training history
    plt.figure(figsize=(12, 5))
    
    # Plot accuracy
    plt.subplot(1, 2, 1)
    if 'binary_accuracy' in custom_history.history:
        plt.plot(custom_history.history['binary_accuracy'], label='Train')
    if 'val_binary_accuracy' in custom_history.history:
        plt.plot(custom_history.history['val_binary_accuracy'], label='Validation')
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend()
    
    # Plot loss
    plt.subplot(1, 2, 2)
    if 'loss' in custom_history.history:
        plt.plot(custom_history.history['loss'], label='Train')
    if 'val_loss' in custom_history.history:
        plt.plot(custom_history.history['val_loss'], label='Validation')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('saved_model/training_plot.png')
    plt.close()
    
    # For visualization, collect a small sample of predictions
    print("Collecting a small sample of predictions for visualization...")
    
    # Create a small test dataset
    test_df = valid_df.sample(min(500, len(valid_df)))
    test_dataset = create_dataset(test_df, batch_size=32)
    
    # Collect predictions
    y_true_list, y_pred_list = [], []
    
    for x_batch, y_batch in test_dataset.take(5):  # Only take a few batches
        y_true_list.append(y_batch.numpy())
        y_pred_list.append(model.predict(x_batch, verbose=0))
    
    # Concatenate results
    if y_true_list and y_pred_list:
        y_true = np.concatenate(y_true_list, axis=0)
        y_pred = np.concatenate(y_pred_list, axis=0)
    else:
        y_true = np.array([])
        y_pred = np.array([])
    
    return all_unique_labels, y_true, y_pred

def test_prediction(image_path=None):
    """
    Test the model's prediction on a single image.
    """
    try:
        # Load the saved model and class names
        model, class_names = load_saved_model()
        if model is None or class_names is None:
            return
        
        if image_path is None:
            # Use a random image if no path provided
            data_dir = pathlib.Path("./dataset")
            all_images = list(data_dir.glob('images*/*/*.png'))
            image_path = str(np.random.choice(all_images))
            print(f"Using random image: {image_path}")
        
        # Read and preprocess the image
        image = cv2.imread(str(image_path))
        if image is None:
            print(f"Error: Could not load image from {image_path}")
            return
            
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image_resized = cv2.resize(image, (224, 224))
        image_array = image_resized.astype('float32') / 255.0  # Simple normalization
        image_array = np.expand_dims(image_array, axis=0)
        
        # Make prediction
        pred = model.predict(image_array)
        
        # Plot results
        plt.figure(figsize=(15, 5))
        
        # Display image
        plt.subplot(1, 3, 1)
        plt.imshow(image_resized)
        plt.title('Input Image')
        plt.axis('off')
        
        # Display top predictions
        plt.subplot(1, 3, 2)
        top_k = min(5, len(class_names))
        top_indices = np.argsort(pred[0])[-top_k:][::-1]
        top_predictions = [(class_names[i], pred[0][i]) for i in top_indices]
        
        y_pos = np.arange(top_k)
        plt.barh(y_pos, [p[1] for p in top_predictions])
        plt.yticks(y_pos, [p[0] for p in top_predictions])
        plt.xlabel('Probability')
        plt.title('Top Predictions')
        
        plt.tight_layout()
        plt.show()
        
        # Print results
        print("\nPrediction Results:")
        for label, prob in top_predictions:
            print(f"{label}: {prob*100:.2f}%")
            
    except Exception as e:
        print(f"Error during prediction: {str(e)}")

def load_saved_model():
    """
    Load a saved model and class names using the improved approach.
    
    Returns:
        tuple: (model, class_names) if successful, (None, None) otherwise
    """
    try:
        # Load class names
        with open('saved_model/class_names.json', 'r') as f:
            class_names = json.load(f)
        
        num_classes = len(class_names)
        print(f"Found {num_classes} classes: {class_names}")
        
        # Try loading in different ways - first attempt traditional loading
        try:
            model = tf.keras.models.load_model('saved_model/xray_classifier')
            print("Model loaded successfully using standard method!")
        except Exception as e:
            print(f"Standard model loading failed, using weights-only approach: {str(e)}")
            
            # Create a fresh model with the same architecture
            model = create_model_architecture(input_shape=(224, 224, 3), num_classes=num_classes)
            
            # Load weights
            try:
                model.load_weights('saved_model/xray_classifier_weights.h5')
                print("Model weights loaded successfully!")
            except Exception as e2:
                print(f"Error loading weights: {str(e2)}")
                return None, None
        
        print("Model loaded successfully!")
        print("Available classes:", class_names)

        return model, class_names
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        print("Please train the model first using 'python model.py train'")
        return None, None

def load_and_plot():
    """
    Load and plot the training history from either JSON, CSV, or text file.
    """
    try:
        history = None
        
        # Try loading history from different formats
        # First try JSON
        try:
            with open('saved_model/training_history.json', 'r') as f:
                history = json.load(f)
        except FileNotFoundError:
            pass
        except Exception as e:
            print(f"Error loading JSON history: {str(e)}")
        
        # If JSON failed, try CSV
        if history is None:
            try:
                history_df = pd.read_csv('saved_model/training_history.csv')
                history = history_df.to_dict('list')
                print("Loaded history from CSV file")
            except FileNotFoundError:
                pass
            except Exception as e:
                print(f"Error loading CSV history: {str(e)}")
        
        # If CSV failed, try text file
        if history is None:
            try:
                history = {}
                with open('saved_model/training_history.txt', 'r') as f:
                    for line in f:
                        if ':' in line:
                            key, value_str = line.strip().split(':', 1)
                            history[key.strip()] = [float(v) for v in value_str.strip().split(',')]
                print("Loaded history from text file")
            except FileNotFoundError:
                pass
            except Exception as e:
                print(f"Error loading text history: {str(e)}")
        
        # If we found a history file, plot it
        if history:
            # Create a figure with two subplots
            plt.figure(figsize=(12, 5))
            
            # Plot accuracy
            plt.subplot(1, 2, 1)
            if 'binary_accuracy' in history:
                plt.plot(history['binary_accuracy'], label='Train')
            if 'val_binary_accuracy' in history:
                plt.plot(history['val_binary_accuracy'], label='Validation')
            plt.title('Model Accuracy')
            plt.ylabel('Accuracy')
            plt.xlabel('Epochs')
            plt.legend()

            # Plot loss
            plt.subplot(1, 2, 2)
            if 'loss' in history:
                plt.plot(history['loss'], label='Train')
            if 'val_loss' in history:
                plt.plot(history['val_loss'], label='Validation')
            plt.title('Model Loss')
            plt.ylabel('Loss')
            plt.xlabel('Epochs')
            plt.legend()

            plt.tight_layout()
            plt.show()
        
        # If we still don't have history data, try to just show the saved plot
        elif os.path.exists('saved_model/training_plot.png'):
            img = plt.imread('saved_model/training_plot.png')
            plt.figure(figsize=(12, 5))
            plt.imshow(img)
            plt.axis('off')
            plt.show()
            print("Displaying saved training plot.")
        else:
            raise FileNotFoundError("No training history found")
                
    except Exception as e:
        print(f"Error loading/plotting history: {e}")
        print("Please train the model first using 'python model.py train'")

def visualize_model_performance(class_names, y_true, y_pred):
    """
    Visualize model performance with ROC curves.
    
    Args:
        class_names: List of class names
        y_true: Ground truth labels
        y_pred: Predicted probabilities
    """
    if len(y_true) == 0 or len(y_pred) == 0:
        print("No data available for visualization")
        return
        
    num_classes = len(class_names)
    
    # Compute binary predictions using 0.5 threshold
    y_pred_binary = (y_pred >= 0.5).astype(int)
    
    # Plot ROC curves for the first few classes only
    num_to_plot = min(num_classes, 6)  # Limit to 6 classes
    
    plt.figure(figsize=(15, 10))
    for i in range(num_to_plot):
        # Compute false positive rate, true positive rate, and thresholds
        fpr, tpr, _ = roc_curve(y_true[:, i], y_pred[:, i])
        roc_auc = auc(fpr, tpr)
        
        plt.subplot(2, 3, i + 1)
        plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.2f}')
        plt.plot([0, 1], [0, 1], 'k--')  # Diagonal line
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'{class_names[i]}')
        plt.legend(loc="lower right")
    
    plt.tight_layout()
    plt.savefig('saved_model/roc_curves.png')
    plt.show()
    print("ROC curves saved to 'saved_model/roc_curves.png'")

def test_gpu():
    """
    Test GPU capabilities for TensorFlow.
    """
    print("TensorFlow version:", tf.__version__)
    print("CUDA available:", tf.test.is_built_with_cuda())
    print("GPU devices:", tf.config.list_physical_devices('GPU'))

    # GPU speed test
    def run_gpu_test():
        with tf.device('/GPU:0'):
            # Create large tensors
            matrix_size = 2000
            a = tf.random.normal([matrix_size, matrix_size])
            b = tf.random.normal([matrix_size, matrix_size])
            
            start_time = time.time()
            # Matrix multiplication
            c = tf.matmul(a, b)
            # Force evaluation
            _ = c.numpy()
            end_time = time.time()
            
            return end_time - start_time

    print("\nRunning GPU performance test...")
    try:
        execution_time = run_gpu_test()
        print(f"Large matrix multiplication took: {execution_time:.2f} seconds")
    except Exception as e:
        print(f"GPU test failed: {str(e)}")
        print("GPU may not be available or properly configured.")

if __name__ == "__main__":
    import sys
    
    # Create directories if they don't exist
    os.makedirs('saved_model', exist_ok=True)
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "train":
            print("Training new model...")
            try:
                class_names, y_true, y_pred = create_and_train_model()
                print("\nTraining completed successfully!")
                
                # Visualize model performance if data is available
                if len(y_true) > 0 and len(y_pred) > 0:
                    print("\nVisualizing model performance...")
                    visualize_model_performance(class_names, y_true, y_pred)
            except Exception as e:
                print(f"Error during training: {str(e)}")
                import traceback
                traceback.print_exc()
            
        elif sys.argv[1] == "plot":
            print("Loading and plotting saved training history...")
            load_and_plot()
            
        elif sys.argv[1] == "test-gpu":
            print("Testing GPU capabilities...")
            test_gpu()
            
        elif sys.argv[1] == "predict":
            if len(sys.argv) > 2:
                # If image path is provided
                image_path = sys.argv[2]
                print(f"Testing prediction on image: {image_path}")
                test_prediction(image_path)
            else:
                # If no image path provided, use random image
                print("Testing prediction on random image...")
                test_prediction()
                
        else:
            print("Invalid argument. Use:")
            print("  'train'              - to train new model")
            print("  'plot'               - to show existing results")
            print("  'test-gpu'           - to test GPU capabilities")
            print("  'predict [filepath]' - to test prediction on an image")
    else:
        print("Please specify an argument:")
        print("  'train'              - to train new model")
        print("  'plot'               - to show existing results")
        print("  'test-gpu'           - to test GPU capabilities")
        print("  'predict [filepath]' - to test prediction on an image")