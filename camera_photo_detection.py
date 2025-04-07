from authlib.integrations.flask_client import OAuth
from flask import Flask, request, jsonify, redirect, session, url_for
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import psycopg2

def get_labels(datapth):
    class_labels = sorted(os.listdir(datapath))
    class_indexed = {class_label :  index for index, class_label in enumerate(class_labels)}
    return class_indexed

app = Flask(__name__)
CORS(app)

app.secret_key = os.getenv("SECRET_KEY", "lentil1025")

oauth = OAuth(app)
google_oauth = oauth.register(
    name='google'
    client_id='YOUR_CLIENT_ID',
    client_secret='YOUR_CLIENT_SECRET',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://oauth2.googleapis.com/token',
    client_kwargs={'scope': 'openid email profile'},
)

@app.route('/login')
def login():
    return google_oauth.authorize_redirect(url_for('authorize', _external = True))
@app.route('/logout')

@app.route('/authorize')

@app.route()

def login_required(func):
    @wraps(func)
    def decorate(*args, **kwargs):
        if 'user' not in session:
            return jsonify({"error" : "Unauthorized"}), 401
        return func(*args, **kwargs)
    return decorate

mpath = 'C:\\Users\\kshar\\nature_notebook\\nature_classifier_updated.keras'
model = tf.keras.models.load_model(mpath)
datapath = "C:\\Users\\kshar\\OneDrive\\Desktop\\Birds"
class_ind = get_labels(datapath)
class_labels = list(class_ind.keys())


DB_NAME = "bird_database"
DB_USER = "team61"
DB_PWD = "cs222"
DB_HOST = "localhost"
DB_PORT = "5432"

def preprocess(image):
    image = image.resize((224,224))
    image = np.array(image)/255
    image = np.expand_dims(image, axis=0)
    return image

def use_predict_db(pred_class):
    connection = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PWD, host=DB_HOST, port=DB_PORT)
    cursor = connection.cursor()
    cursor.execute("SELECT name, description FROM birds WHERE id=%s", (pred_class,))
    result = cursor.fetchone()

    output = result[0] + '\n\n' + result[1]
    output = f"Bird Name: {result[0]}<br><br>Description: {result[1]}<br><br>"
    cursor.close()
    connection.close()
    return jsonify(output)

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

    return use_predict_db(predicted_class)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
