#!/usr/bin/env python
"""
Database initialization script for MediScan
This standalone script initializes the MongoDB database and creates a test user.
"""

import os
import sys
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

def create_test_user():
    """
    Create a test user in the MongoDB database if it doesn't exist.
    """
    # Get MongoDB URI from environment variable or use default
    mongo_uri = os.getenv('MONGODB_URI')
    
    try:
        # Connect to MongoDB
        print(f"Connecting to MongoDB at: {mongo_uri}")
        client = MongoClient(mongo_uri)
        
        # Extract database name from URI
        db_name = "capstone"
        db = client[db_name]
        
        print(f"Connected to database: {db_name}")
        
        # Check if users collection exists, create it if it doesn't
        if 'users' not in db.list_collection_names():
            print("Creating users collection")
            db.create_collection('users')
        
        # Check if test user exists
        test_email = "test@gmail.com"
        test_user = db.users.find_one({"email": test_email})
        
        if not test_user:
            # Create test user
            print(f"Creating test user: {test_email}")
            user = {
                'name': 'Test',
                'email': test_email,
                'password': generate_password_hash('test123'),
                'created_at': datetime.utcnow()
            }
            result = db.users.insert_one(user)
            print(f'Test user created with ID: {result.inserted_id}')
            print('Credentials: test@gmail.com / test123')
        else:
            print(f'Test user already exists: {test_email}')
            
        # Create analyses collection if it doesn't exist
        if 'analyses' not in db.list_collection_names():
            print("Creating analyses collection")
            db.create_collection('analyses')
            
        print("Database initialization complete!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        # Close the connection
        if 'client' in locals():
            client.close()
            print("MongoDB connection closed")

if __name__ == '__main__':
    create_test_user()