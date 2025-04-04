# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
import cv2
from werkzeug.utils import secure_filename
import tensorflow as tf
import jwt
import datetime
from functools import wraps
import logging
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.getenv("CORS_ALLOW_ORIGIN", "*")}})

# Configure upload folder
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # Default: 16 MB
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key_change_in_production')

# MongoDB configuration - direct connection instead of Flask-PyMongo
MONGO_URI = os.getenv('MONGODB_URI')
logger.info(f"Connecting to MongoDB: {MONGO_URI}")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["capstone"]  # Use the same database name as in db_init.py

# Email validation regex pattern
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def validate_email(email):
    """Validate email format using regex pattern"""
    return bool(EMAIL_PATTERN.match(email))

def format_user(user):
    """Format user document for API response"""
    if user:
        # Convert ObjectId to string and exclude password
        user_copy = user.copy()
        user_copy['id'] = str(user_copy['_id'])
        user_copy.pop('_id', None)
        user_copy.pop('password', None)
        user_copy.pop('reset_token', None)
        user_copy.pop('reset_token_expiry', None)
        return user_copy
    return None

# User model methods
class UserModel:
    @staticmethod
    def create_user(name, email, password):
        """Create a new user"""
        # Hash the password
        hashed_password = generate_password_hash(password)
        
        # Create user document
        user = {
            'name': name,
            'email': email.lower(),
            'password': hashed_password,
            'created_at': datetime.datetime.utcnow()
        }
        
        # Insert into database
        result = db.users.insert_one(user)
        user['_id'] = result.inserted_id
        
        return format_user(user)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        try:
            user = db.users.find_one({"email": email.lower()})
            return user
        except Exception as e:
            logger.error(f"Error finding user by email: {str(e)}")
            return None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            user = db.users.find_one({"_id": user_id})
            return user
        except Exception as e:
            logger.error(f"Error finding user by ID: {str(e)}")
            return None
    
    @staticmethod
    def verify_password(user, password):
        """Verify password against stored hash"""
        if not user or not password:
            return False
        return check_password_hash(user['password'], password)
    
    @staticmethod
    def create_password_reset_token(email):
        """Create a password reset token for a user"""
        user = UserModel.find_by_email(email)
        if not user:
            return None
            
        # Generate token and expiry
        token = os.urandom(16).hex()
        expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        
        # Update user with token
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"reset_token": token, "reset_token_expiry": expiry}}
        )
        
        return token
    
    @staticmethod
    def find_by_reset_token(token):
        """Find user by reset token"""
        user = db.users.find_one({
            "reset_token": token,
            "reset_token_expiry": {"$gt": datetime.datetime.utcnow()}
        })
        return user
    
    @staticmethod
    def reset_password(token, new_password):
        """Reset password using a token"""
        user = UserModel.find_by_reset_token(token)
        if not user:
            return False
            
        # Hash new password
        hashed_password = generate_password_hash(new_password)
        
        # Update user password and remove token
        result = db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"password": hashed_password},
                "$unset": {"reset_token": "", "reset_token_expiry": ""}
            }
        )
        
        return result.modified_count > 0

# Load the model
def load_model():
    try:
        # Try to load the model using the create_model_architecture function
        from model import create_model_architecture, load_saved_model
        model, class_names = load_saved_model()
        
        if model is None:
            logger.error("Failed to load model using load_saved_model")
            return None, None
            
        return model, class_names
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return None, None

model, class_names = load_model()

# Load class names if not loaded with the model
if class_names is None:
    try:
        with open('saved_model/class_names.json', 'r') as f:
            class_names = json.load(f)
        logger.info(f"Loaded {len(class_names)} class names")
    except Exception as e:
        logger.error(f"Error loading class names: {str(e)}")
        class_names = []

# Token authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from the headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Verify the token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = data.get('user_id')
            
            current_user = UserModel.find_by_id(user_id)
            if current_user is None:
                return jsonify({'message': 'User not found!'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Basic routes
@app.route('/')
def index():
    return jsonify({'message': 'Welcome to MediScan API'})

@app.route('/test')
def test():
    return jsonify({'message': 'API is working!'})

@app.route('/api/db/test')
def db_test():
    """Test the MongoDB connection"""
    try:
        # Check for collections
        collections = db.list_collection_names()
        # Count users
        user_count = db.users.count_documents({})
        
        return jsonify({
            'status': 'success',
            'message': 'Database connection successful',
            'collections': collections,
            'user_count': user_count
        })
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return jsonify({'status': 'error', 'message': f'Database connection failed: {str(e)}'}), 500

@app.route('/api/ml/test')
def ml_test():
    if model is None:
        return jsonify({'status': 'error', 'message': 'Model not loaded'}), 500
    return jsonify({'status': 'success', 'message': 'ML model is loaded', 'classes': class_names})

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if required fields are present
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate email format
    if not validate_email(data['email']):
        return jsonify({'message': 'Invalid email format'}), 400
    
    # Check password length
    if len(data['password']) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
    # Check if user already exists
    if UserModel.find_by_email(data['email']):
        return jsonify({'message': 'User already exists'}), 409
        
    # Create new user
    user = UserModel.create_user(
        name=data['name'],
        email=data['email'],
        password=data['password']
    )
    
    return jsonify({'message': 'User registered successfully', 'user': user}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
        
    # Find user by email
    user = UserModel.find_by_email(data['email'])
    
    # Check if user exists and password is correct
    if not user or not UserModel.verify_password(user, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    # Generate token
    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    # Format user for response
    user_data = {
        'id': str(user['_id']),
        'name': user['name'],
        'email': user['email'],
        'created_at': user['created_at'].isoformat() if 'created_at' in user else None
    }
    
    return jsonify({
        'token': token,
        'user': user_data
    })

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email or not validate_email(email):
        return jsonify({'message': 'Valid email is required'}), 400
    
    # Create password reset token
    token = UserModel.create_password_reset_token(email)
    
    # In a real application, send an email with the reset link
    # For development, we'll return the token directly
    if token:
        # Get frontend URL from environment or use default
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        # Simulate email sending
        logger.info(f"\n====== RESET PASSWORD EMAIL ======")
        logger.info(f"To: {email}")
        logger.info(f"Subject: Reset Your Password")
        logger.info(f"Click the link below to reset your password:")
        logger.info(f"{reset_link}")
        logger.info(f"====================================\n")
        
        # If email configuration is available, send real email
        if os.getenv('MAIL_SERVER'):
            try:
                # Code to send actual email would go here
                pass
            except Exception as e:
                logger.error(f"Failed to send email: {str(e)}")
    
    # For security, don't reveal if the email exists or not
    return jsonify({
        'message': 'If your email is registered, you will receive a password reset link',
        'token': token if os.getenv('FLASK_ENV') == 'development' else None  # Only return token in development
    }), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400
    
    # Reset password using token
    success = UserModel.reset_password(token, new_password)
    
    if not success:
        return jsonify({'message': 'Invalid or expired token'}), 400
    
    return jsonify({'message': 'Password has been reset successfully'}), 200

# ML routes
@app.route('/api/ml/analyze', methods=['POST'])
@token_required
def analyze_image(current_user):
    # Check if model is loaded
    if model is None:
        return jsonify({'status': 'error', 'message': 'Model not loaded'}), 500
        
    # Check if the post request has the file part
    if 'image' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400
        
    file = request.files['image']
    
    # If user does not select file, browser also submits an empty part without filename
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400
        
    if file:
        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Preprocess the image
            img = cv2.imread(filepath)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (224, 224))
            img = img.astype('float32') / 255.0
            img = np.expand_dims(img, axis=0)
            
            # Make prediction
            predictions = model.predict(img)
            
            # Process results
            results = []
            for i, class_name in enumerate(class_names):
                results.append({
                    'label': class_name,
                    'probability': float(predictions[0][i])
                })
                
            # Sort by probability (descending)
            results = sorted(results, key=lambda x: x['probability'], reverse=True)
            
            # Get the top 5 predictions
            top_predictions = results[:5]
            
            # Create a record of this analysis (in a real app, save to database)
            analysis_record = {
                'user_id': str(current_user['_id']),
                'filename': filename,
                'timestamp': datetime.datetime.now().isoformat(),
                'predictions': top_predictions
            }
            
            # Save analysis to database
            db.analyses.insert_one(analysis_record)
            
            # Clean up
            # In production, you might want to keep the files for reference
            # os.remove(filepath)
            
            return jsonify({
                'status': 'success',
                'predictions': top_predictions,
                'analysis_id': str(analysis_record['_id']) if '_id' in analysis_record else None
            })
            
        except Exception as e:
            logger.error(f"Error during image analysis: {str(e)}")
            return jsonify({'status': 'error', 'message': f'Analysis failed: {str(e)}'}), 500

# Get user's analysis history
@app.route('/api/ml/history', methods=['GET'])
@token_required
def get_history(current_user):
    try:
        # Get user's analysis history from database
        analyses = list(db.analyses.find({'user_id': str(current_user['_id'])}).sort('timestamp', -1))
        
        # Format the analyses
        formatted_analyses = []
        for analysis in analyses:
            formatted_analyses.append({
                'id': str(analysis['_id']),
                'timestamp': analysis['timestamp'],
                'filename': analysis.get('filename', ''),
                'predictions': analysis.get('predictions', [])
            })
            
        return jsonify({
            'status': 'success',
            'analyses': formatted_analyses
        })
    except Exception as e:
        logger.error(f"Error getting analysis history: {str(e)}")
        return jsonify({'status': 'error', 'message': f'Failed to get history: {str(e)}'}), 500

@app.teardown_appcontext
def close_mongo_connection(exception):
    """Close MongoDB connection when the application context ends"""
    pass  # Connection will be managed by MongoClient

if __name__ == '__main__':
    # Check if model is loaded
    if model is None:
        logger.warning("Model failed to load. Some features may not work correctly.")
    else:
        logger.info("Model loaded successfully.")
    
    # Test database connection
    try:
        collections = db.list_collection_names()
        logger.info(f"Successfully connected to MongoDB. Collections: {collections}")
        user_count = db.users.count_documents({})
        logger.info(f"Found {user_count} users in the database")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
    
    # Run the app
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    app.run(host='0.0.0.0', port=port, debug=debug)