from authlib.integrations.flask_client import OAuth
import firebase_admin
from db_funcs import add_species_found, get_bird_info
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
CORS(app)
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
@login_required
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read()))

    processed_image = preprocess(image)
    predictions = model.predict(processed_image)
    predicted_class = class_labels[np.argmax(predictions)]
    
    if 'user' in session:
        username = session['user']['email']
        add_species_found(username, predicted_class)
    return get_bird_info(predicted_class)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)