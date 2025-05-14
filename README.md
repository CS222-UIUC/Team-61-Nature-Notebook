# Introduction
## Nature Notebook: An automated Birdwatching Journal
Nature Notebook is an interactive app that enables bird lovers to track their exploration and discovery of birds over time, all while learning more about the birds in their community.
After creating an account and signing in, users can:
- take a photo of any bird they see to have its species detected,
- save discovered birds to their notebook, and
- view descriptions and information on birds they catalog

Previously, many bird lovers were unable to keep track of the species they had seen or could not identify birds in their communities. This motivated the development of this project, and these issues are tackled by Nature Notebook.

## Technical Architecture
![Flowchart CS222](https://github.com/user-attachments/assets/7bab3bc9-e572-4bf8-8349-34c194e9a8d7)

## Installation Instructions
First, ensure that you have [NodeJS with NPM](https://nodejs.org/en/download) installed on your machine.  
Further, ensure that you have Python 3.10.0 installed. The download for this can be found at [This link](https://www.python.org/downloads/) by scrolling down to the "Looking for a specific release?" section.  
Note that this installation guide works for Windows only. Ensure that both localhost:8081 and localhost:1109 have no running processes before continuing.
Now navigate to an empty source folder for the project and run in terminal, in this order, 

- ```git clone https://github.com/CS222-UIUC/Team-61-Nature-Notebook.git .```
- ```py -3.10 -m venv nature-notebook-env```
- ```./nature-notebook-env/Scripts/Activate.ps1```
- ```pip install -r requirements.txt```
Now, go to [this link]() and download the nature_classifier_updated.keras model. Then, run:
- ```explorer .```
And drag and drop the nature_classifier_updated.keras file into the "/model" folder shown in the file explorer. Then, run:
- ```cd my-app```
- ```npm install```
- ```npm run web```
Finally, open a new terminal and navigate to the source folder again. Now, run
- ```python src/camera_photo_detection.py```

You will now see that, at localhost:8081, the project is loaded and you can interact with the project as necessary. Enjoy!

## Group members
**Nihar Kalode:** Built backend and database to store bird data, as well as sign in functionalities using Firebase  
**Kartikey Sharma:** Created machine learning classifiers using Tensorflow and led integration between backend and frontend  
**Ishaan Gupta:** Created frontend with React Native
