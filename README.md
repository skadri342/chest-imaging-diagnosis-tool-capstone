# AI-Powered Medical Chest X-Ray Analysis Tool

This project provides an AI-powered tool for analyzing chest X-ray images to assist medical professionals in diagnosis.

## Pre-requisites

1. Install node.js/npm based on OS:
   - Windows: Download from https://nodejs.org/en/download/prebuilt-installer
   - Linux: `sudo apt-get install nodejs npm`
   - Recommended: Node.js v16.x for best compatibility
2. Install Python 3.12.3 or later (don't go below 3.12.3 otherwise errors might occur)
3. Have bash command line installed if using Windows

### Important Node.js Version Note

This application uses the `--openssl-legacy-provider` flag to support older OpenSSL implementations. If you encounter crypto-related errors like `[digital envelope routines] unsupported`, make sure you're using the scripts provided in package.json which have this flag enabled.

## Frontend Setup

1. Go into the frontend directory in the terminal:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Backend Setup

Using Python 3.12.3 or later:

1. Go into the backend directory in the terminal:
   ```
   cd backend
   ```
2. Run the install script:
   ```
   chmod +x install.sh
   ./install.sh
   ```
3. Set the interpreter to python:
   - Click on the python version on the bottom right
   - In the dropdown that opens, click "Enter interpreter path", then click "Find..."
   - In the window that opens, navigate to chest-imaging-diagnosis-tool-capstone\backend\.venv\Scripts
   - Select the file called "python"
4. Open a new terminal, it should now say (.venv) above the input line
5. Start the backend server:
   ```
   python app.py
   ```

## Troubleshooting Common Issues

### Network/CORS Issues

If you're experiencing issues with API requests (login/signup/image analysis not working):

1. Make sure both frontend and backend servers are running
2. Update the API URL in the frontend `.env` file to match your backend server's IP address:
   ```
   # Important: Use your actual machine IP instead of localhost
   VITE_API_URL=http://192.168.2.132:8000
   ```
   You can find your IP address using:
   - Windows: `ipconfig` in Command Prompt
   - Linux/Mac: `ifconfig` or `ip addr` in Terminal
3. Check the API status indicator on the login page to see if the API is reachable
4. If requests are timing out, verify your network connection
5. Clear browser cache and cookies if you're experiencing persistent issues

### Authentication Issues

If login or signup is not working:

1. Check browser console for error messages (F12 in most browsers)
2. Make sure MongoDB is properly set up and running
3. The default test account is test@gmail.com / test123
4. **Emergency Authentication Endpoints**: The app uses emergency endpoints that bypass JWT/crypto libraries:
   - **Direct Login**: http://192.168.2.132:8000/api/auth/direct-login
   - **Direct Register**: http://192.168.2.132:8000/api/auth/direct-register
   - You can visit these URLs directly in your browser to test if the backend is working
   - These endpoints support both regular user accounts and the test account (test@gmail.com / test123)

#### Crypto Error: "digital envelope routines unsupported"

If you encounter this error:
1. The application has been completely refactored to avoid using crypto dependencies:
   - Backend: Uses simple UUID-based tokens instead of JWT
   - Frontend: Uses XMLHttpRequest instead of fetch/axios for API calls

2. Additional workarounds if issues persist:
   ```
   # For frontend (run in the frontend directory)
   export NODE_OPTIONS=--openssl-legacy-provider
   npm run dev
   
   # For backend (run in a new terminal for installing Python packages)
   pip uninstall -y PyJWT pycrypto pycryptodome cryptography
   pip install cryptography==36.0.0
   ```
   
3. If neither solution works, try using an older version of Node.js (v16.x)

### Image Analysis Issues

If image analysis is not working:

1. Make sure you're logged in (JWT token is required)
2. Check that the image is in a supported format (JPEG, PNG)
3. Ensure the image size is reasonable (under 10MB)
4. **Emergency Analysis**: If regular image analysis fails, the app will automatically use the emergency analysis endpoint:
   - This special endpoint is at: http://192.168.2.132:8000/api/ml/emergency-analyze
   - You can test it directly in your browser by visiting the URL
   - In emergency mode, the analysis results are simulated and don't require actual model processing

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Flask, TensorFlow, MongoDB
- **Authentication**: JWT-based token system