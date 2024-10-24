import requests

def test_endpoints():
    # Test base URL
    response = requests.get('http://127.0.0.1:6000/')
    print("Base URL response:", response.json())

    # Test /test endpoint
    response = requests.get('http://127.0.0.1:6000/test')
    print("Test endpoint response:", response.json())

    # Test /api/ml/test endpoint
    response = requests.get('http://127.0.0.1:6000/api/ml/test')
    print("ML test endpoint response:", response.json())

if __name__ == "__main__":
    test_endpoints()