#!/bin/bash

# Check if a virtual environment already exists
if [ -d "venv" ]; then
    echo "Virtual environment 'venv' already exists."
else
    # Create a virtual environment
    echo "Creating virtual environment..."
    python3 -m venv .venv

    echo "Virtual environment created."
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies from requirements.txt if it exists
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "No requirements.txt file found. Skipping dependency installation."
fi

# Ensure the .vscode folder exists and set the interpreter
echo "Setting Python interpreter in VS Code settings..."
mkdir -p .vscode
# Create or update the settings.json file in .vscode folder
echo '{
    "python.pythonPath": "'$(pwd)'/.venv/bin/python"
}' > .vscode/settings.json
echo "Interpreter set to virtual environment in VS Code."

echo "Setup complete."