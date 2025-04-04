# backend/db_models.py
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import re
import secrets
from bson.objectid import ObjectId

# Initialize PyMongo
mongo = PyMongo()

# Email validation regex pattern
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def validate_email(email):
    """Validate email format using regex pattern"""
    return bool(EMAIL_PATTERN.match(email))

def format_user(user):
    """Format user document for API response"""
    if user:
        # Convert ObjectId to string and exclude password
        user['id'] = str(user['_id'])
        user.pop('_id', None)
        user.pop('password', None)
        user.pop('reset_token', None)
        user.pop('reset_token_expiry', None)
    return user

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
            'created_at': datetime.utcnow()
        }
        
        # Insert into database
        result = mongo.db.users.insert_one(user)
        user['_id'] = result.inserted_id
        
        return format_user(user)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        user = mongo.db.users.find_one({"email": email.lower()})
        return user
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            user = mongo.db.users.find_one({"_id": user_id})
            return user
        except:
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
        token = secrets.token_urlsafe(32)
        expiry = datetime.utcnow() + timedelta(hours=1)
        
        # Update user with token
        mongo.db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"reset_token": token, "reset_token_expiry": expiry}}
        )
        
        return token
    
    @staticmethod
    def find_by_reset_token(token):
        """Find user by reset token"""
        user = mongo.db.users.find_one({
            "reset_token": token,
            "reset_token_expiry": {"$gt": datetime.utcnow()}
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
        result = mongo.db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"password": hashed_password},
                "$unset": {"reset_token": "", "reset_token_expiry": ""}
            }
        )
        
        return result.modified_count > 0
    
    @staticmethod
    def create_test_user():
        """Create a test user if it doesn't exist"""
        test_email = "test@gmail.com"
        # Check if mongo.db is available
        if not hasattr(mongo, 'db') or mongo.db is None:
            print("Warning: MongoDB connection not initialized yet. Test user creation skipped.")
            return False
            
        try:
            test_user = UserModel.find_by_email(test_email)
            
            if not test_user:
                UserModel.create_user(
                    name="Test",
                    email=test_email,
                    password="test123"
                )
                print("Test user created successfully")
                return True
            else:
                print("Test user already exists")
                return True
        except Exception as e:
            print(f"Error creating test user: {str(e)}")
            return False