"""
Flask backend

- Handles user auth (OAuth + custom sign-up)
- Classifies uploaded nature images using TensorFlow model
- Stores and retrieves user + bird data from Firebase
- Tracks species found per user
"""


# Imports
from authlib.integrations.flask_client import OAuth
import firebase_admin
from db_funcs import add_species_found, get_bird_info, get_species_found_list
from flask import Flask, request, jsonify, redirect, session, url_for
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from firebase_admin import credentials
from auth import oauth_blueprint, init_oauth
from functools import wraps
from dotenv import load_dotenv
from signup_semantics import signup_bp

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:8081", "http://localhost:1109", "localhost:8081", "localhost:5000", "http://localhost:8081/sign-up"])
app.secret_key = os.getenv("SECRET_KEY", "airtag2")

# Initialize OAuth and register authentication blueprints
init_oauth(app)
app.register_blueprint(oauth_blueprint)
app.register_blueprint(signup_bp)

# Load pre-trained TensorFlow model for image classification
mpath = os.path.join(os.path.dirname(__file__), '..', 'model', 'nature_classifier_updated.keras')
model = tf.keras.models.load_model(mpath)


# Connect to FireBase DB
cred = credentials.Certificate('src/credentials.json')

if not firebase_admin._apps:
    cred = credentials.Certificate('credentials.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://nature-notebook-db-default-rtdb.firebaseio.com/'
    })

# Decorator to protect routes that require login
def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return jsonify({"error" : "Unauthorized"}), 401
        return func(*args, **kwargs)
    return wrapper

# Preprocess uploaded image to fit model input requirements
def preprocess(image):
    image = image.resize((224,224))
    image = np.array(image)/255
    image = np.expand_dims(image, axis=0)
    return image

# Route to get the user's notebook (list of species they identified)
@app.route("/notebook", methods=['GET'])
@login_required
def get_notebook():
    username = session['user']['username']
    found_ids = get_species_found_list(username) 
    species_info = []

    # Retrieve info for each species the user has found
    for species_id in found_ids:
        try:
            info = get_bird_info(species_id)
            if info:
                species_info.append({
                    "id": species_id,
                    "name": info.get("name", "Unknown"),
                    "description": info.get("description", ""),
                })
        except IndexError:
            continue
    return jsonify(species_info)

# Route to classify uploaded image and optionally log the observation
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read()))

    processed_image = preprocess(image)
    predictions = model.predict(processed_image)
    predicted_class = np.argmax(predictions)
    species_info = get_bird_info(predicted_class+1) # Bird IDs are 1-indexed

    # If user is logged in, record the found species
    if 'user' in session:
        username = session['user']['username']
        add_species_found(username, predicted_class+1)

    print("Predicted:", predicted_class+1)
    print("Bird info:", species_info)

    return jsonify({
        "id" : int(predicted_class+1),
        "name": species_info.get("name"),
        "description": species_info.get("description", "")
    })

# Route to return current user's basic info (if logged in)
@app.route('/me', methods=['GET'])
def get_current_user():
    user = session.get('user')
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify({"email": user['email'], "username" : user['username']})

# Start the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=1109, debug=True)
