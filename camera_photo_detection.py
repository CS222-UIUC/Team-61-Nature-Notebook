from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

def get_labels(datapth):
    class_labels = sorted(os.listdir(datapath))
    class_indexed = {class_label :  index for index, class_label in enumerate(class_labels)}
    return class_indexed

app = Flask(__name__)

mpath = 'C:\\Users\\kshar\\nature_notebook\\nature_classifier.keras'
model = tf.keras.models.load_model(mpath)
datapath = "C:\\Users\\kshar\\OneDrive\\Desktop\\Birds"
class_ind = get_labels(datapath)
class_labels = list(class_ind.keys())

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

    return jsonify({"class": predicted_class, "confidence": float(np.max(predictions))})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)