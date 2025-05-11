from flask import Blueprint, Flask, request, jsonify, session
from db_funcs import add_user, email_exists, get_email, username_exists
from db_funcs import validate_password
signup_bp = Blueprint('signup', __name__)

# This is how you Sign Up WITHOUT OAuth
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
    return jsonify({"status": "success"}), 200

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
    
    session['user'] = {"email": get_email(username)}
    return jsonify({"status": "success"}), 200
