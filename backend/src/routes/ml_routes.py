from flask import Blueprint, jsonify, request

ml_bp = Blueprint('ml', __name__)

@ml_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'ML API is working!'})

@ml_bp.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.get_json()
        
        # Here we'll eventually add our ML model prediction
        # For now, we'll just echo back the received data
        result = {
            'status': 'success',
            'received_data': data,
            'mock_prediction': 'This is a mock prediction'
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500