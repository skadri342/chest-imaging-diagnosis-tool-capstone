#!/bin/bash

# Function to create a virtual environment
create_venv() {
    if command -v python3 &> /dev/null; then
        echo "Creating virtual environment using 'python3'..."
        python3 -m venv .venv
    elif command -v python &> /dev/null; then
        echo "Creating virtual environment using 'python'..."
        python -m venv .venv
    else
        echo "Python is not installed or not available in PATH."
        exit 1
    fi
}

# Check if a virtual environment already exists
if [ -d ".venv" ]; then
    echo "Virtual environment '.venv' already exists."
else
    # Create a virtual environment
    create_venv
    echo "Virtual environment created."
fi

# Detect operating system
OS="$(uname -s)"
case "$OS" in
    (Linux*)     machine=Linux;;
    (Darwin*)    machine=Mac;;
    (CYGWIN*|MINGW*|MSYS_NT*) machine=Windows;;
    (*)          machine="UNKNOWN"
esac

# Activate the virtual environment based on OS
echo "Activating virtual environment..."
if [ "$machine" = "Linux" ] || [ "$machine" = "Mac" ]; then
    source .venv/bin/activate
elif [ "$machine" = "Windows" ]; then
    source .venv/Scripts/activate
else
    echo "Unsupported OS: $machine"
    exit 1
fi

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

# Adjust Python path based on OS
if [ "$machine" = "Linux" ] || [ "$machine" = "Mac" ]; then
    pythonPath="$(pwd)/.venv/bin/python"
elif [ "$machine" = "Windows" ]; then
    pythonPath="$(pwd)/.venv/Scripts/python.exe"
else
    echo "Unsupported OS for setting VS Code interpreter."
    exit 1
fi

# Create or update the settings.json file in .vscode folder
echo '{
    "python.pythonPath": "'"$pythonPath"'"
}' > .vscode/settings.json
echo "Interpreter set to virtual environment in VS Code."

echo "Setup complete."