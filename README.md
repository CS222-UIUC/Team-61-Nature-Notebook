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
### Windows
First, ensure that you have [NodeJS with NPM](https://nodejs.org/en/download) installed on your machine.  
Further, ensure that you have Python 3.10.0 installed. The download for this can be found at [this link](https://www.python.org/downloads/) by scrolling down to the "Looking for a specific release?" section.  
Ensure that both localhost:8081 and localhost:1109 have no running processes before continuing.
Now navigate to an empty source folder for the project and run in terminal, in this order, 

- ```git clone https://github.com/CS222-UIUC/Team-61-Nature-Notebook.git .```
- ```py -3.10 -m venv nature-notebook-env```
- ```./nature-notebook-env/Scripts/Activate.ps1```
- ```pip install -r requirements.txt```
Now, go to [this link](https://drive.google.com/file/d/139eSaMLDMwS3RVzOINbfq_7M4RjMD_cs/view?usp=sharing) and download the nature_classifier_updated.keras model, and verify that the downloaded file has this name (otherwise, rename it). Then, run:
- ```explorer .```
And drag and drop the nature_classifier_updated.keras file into the "/model" folder shown in the file explorer. Then, run:
- ```cd my-app```
- ```npm install```
- ```npm run web```
Finally, open a new terminal and navigate to the source folder again. Now, run
- ```./nature-notebook-env/Scripts/Activate.ps1```
- ```python src/camera_photo_detection.py``` (May take a while to load; wait for terminal output)

You will now see that, at localhost:8081, the project is loaded and you can interact with the project as necessary. Enjoy!

### MacOS
First, install NodeJS with NPM and Python 3.10 (crucial it is 3.10) on your machine, if not already present. If you don't have [Brew](https://brew.sh/), download it.
- ```brew install node```
- ```brew install python@3.10``` (If other version of Python is installed, run ```brew reinstall python@3.10```)

Ensure that both localhost:8081 and localhost:1109 have no running processes before continuing. If they do, kill the process as such:
-```lsof -i :<port>```. Note the PID from the output (If no output, no process is running and we're safe)

-```kill -9 <PID>```

Now navigate to an **empty** folder for the project where you want to save it in the terminal and run, in this order, 

- ```git clone https://github.com/CS222-UIUC/Team-61-Nature-Notebook.git .```
- ```/opt/homebrew/bin/python3.10 -m venv nature-notebook-env``` (Change path if Python 3.10 is installed elsewhere)
- ```source nature-notebook-env/bin/activate```
- ```pip install -r requirements.txt```
Now, go to [this link](https://drive.google.com/file/d/139eSaMLDMwS3RVzOINbfq_7M4RjMD_cs/view?usp=sharing) and download the nature_classifier_updated.keras model, and verify that the downloaded file has this name (otherwise, rename it). Then, run:
- ```explorer .```
And drag and drop the nature_classifier_updated.keras file into the "/model" folder shown in the file explorer. Then, run:
- ```cd my-app```
- ```npm install```
- ```npm run web```
Finally, open a new terminal and navigate to the source folder again. Now, run
- ```source nature-notebook-env/bin/activate```
- ```python3 src/camera_photo_detection.py``` (May take a while to load; wait for terminal output)

You will now see that, at localhost:8081, the project is loaded and you can interact with the project as necessary. Enjoy!
## Group members
**Nihar Kalode:** Built backend and database to store bird data, as well as sign in functionalities using Firebase  
**Kartikey Sharma:** Created machine learning classifiers using Tensorflow and led integration between backend and frontend  
**Ishaan Gupta:** Created frontend with React Native
