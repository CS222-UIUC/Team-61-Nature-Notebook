"""

This File Handles Backend Logic for User Sign-Up, Login, and Logout Functionality.
Defines Routes for Registering New Users, User Authentication, 
and Session Management through Flask Blueprint 'signup_bp'
Database interactions handled through helper functions from 'db_funcs' file.

@author Kartikey Sharma

"""
from flask import Blueprint, Flask, request, jsonify, session
from db_funcs import add_user, email_exists, get_email, username_exists
from db_funcs import validate_password
signup_bp = Blueprint('signup', __name__) # This Signup Blueprint is X



"""
Handles user registration by validating input and adding a user to the database.
On successful signup, creates session for new user (automatically logs in new user),
and returns a success response. On failure, returns error message describing the cause
of failure.
"""
@signup_bp.route('/complete-signup', methods=['POST'])
def complete_signup():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    if not (email and username and password):
        return jsonify({"error": "All fields are required."}), 400
    
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid Email Format."}), 400
    
    if email_exists(email) and username_exists(username):
        return jsonify({"error" : "Account Already Exists."}), 409
    elif username_exists(username):
        return jsonify({"error" : "Username already exists."}), 409
    elif email_exists(email):
        return jsonify({"error" : "Email already exists."}), 409
    
    sanitized_username = username.replace('.', '_').replace('@', '_')
    add_user(sanitized_username, email, password)

    session['user'] = {"email" : get_email(username), "username" : username}
    return jsonify({"status": "success"}), 200

"""
Autenticates user by checking if username exists and password is correct.

If authentication is successful, initializes session with users information.

Returns a success response upon successful sign-in, or errror message X.
"""
@signup_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "All Fields are Required"}), 409
    if not get_email(username):
        return jsonify({"error" : "User Not Found"}), 409
    if not validate_password(username, password):
        return jsonify({"error": "Incorrect Password"}), 409
    
    session['user'] = {"email": get_email(username), "username" : username}
    return jsonify({"status": "success"}), 200

"""
Logs out current user by clearing the current session data.
"""
@signup_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"status": "logged out"}), 200