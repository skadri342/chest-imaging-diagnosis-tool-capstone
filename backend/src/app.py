from flask import Flask, jsonify, make_response
from flask_cors import CORS
from routes.ml_routes import ml_bp

app = Flask(__name__)

# Configure CORS more explicitly
CORS(app, resources={
    r"/*": {
        "origins": ["file://*", "http://localhost:*", "http://127.0.0.1:*", "null"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

@app.route('/test', methods=['GET'])
def test():
    response = make_response(jsonify({'message': 'Basic test route working!'}))
    # Explicitly set CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/', methods=['GET'])
def home():
    response = make_response(jsonify({'message': 'Welcome to the API!'}))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# Register blueprints
app.register_blueprint(ml_bp, url_prefix='/api/ml')

if __name__ == '__main__':
    print("Server starting...")
    print("hi shams")
    app.run(debug=True, port=7000, host='0.0.0.0')