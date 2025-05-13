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
def get_labels(datapth):
    class_labels = sorted(os.listdir(datapath))
    class_indexed = {class_label :  index for index, class_label in enumerate(class_labels)}
    return class_indexed

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:8081", "http://localhost:5000", "localhost:8081", "localhost:5000", "http://localhost:8081/sign-up"])
app.secret_key = os.getenv("SECRET_KEY", "airtag2")

init_oauth(app)

app.register_blueprint(oauth_blueprint)
app.register_blueprint(signup_bp)

mpath = 'C:\\Users\\kshar\\nature_notebook\\nature_classifier_updated.keras'
model = tf.keras.models.load_model(mpath)
datapath = "C:\\Users\\kshar\\OneDrive\\Desktop\\Birds"
class_ind = get_labels(datapath)
class_labels = list(class_ind.keys())


# Connect to FireBase DB
cred = credentials.Certificate('credentials.json')

if not firebase_admin._apps:
    cred = credentials.Certificate('credentials.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://nature-notebook-db-default-rtdb.firebaseio.com/'
    })

def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return jsonify({"error" : "Unauthorized"}), 401
        return func(*args, **kwargs)
    return wrapper

def preprocess(image):
    image = image.resize((224,224))
    image = np.array(image)/255
    image = np.expand_dims(image, axis=0)
    return image

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read()))

    processed_image = preprocess(image)
    predictions = model.predict(processed_image)
    predicted_class = class_labels[np.argmax(predictions)]
    species_id = predicted_class.split('.')[0]
    species_info = get_bird_info(species_id)

    if 'user' in session:
        username = session['user']['username']
        add_species_found(username, predicted_class)

    print("Predicted:", predicted_class)
    print("Bird info:", species_info)

    return jsonify({
        "name": predicted_class,
        "description": species_info.get("description", "")
    })


@app.route('/me', methods=['GET'])
def get_current_user():
    user = session.get('user')
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify({"email": user['email'], "username" : user['username']})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
