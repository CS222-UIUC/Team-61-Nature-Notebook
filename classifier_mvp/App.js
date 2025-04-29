import React from 'react';
import { Button } from 'react-native';
export default function App() {
  const testPATH = 'C:\\Users\\kshar\\nature_notebook\\data\\005.Crested_Auklet\\Crested_Auklet_0018_1817.jpg';
  const handlePredict = async () => {
    const formData = new FormData();
    formData.append('file', {
      uri: testPATH,
      name: 'test.jpg',
      type: 'image/jpeg',
    });
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const data = await response.json();
      console.log('Prediction:', data);
    } catch (error) {
      console.error('Error while predicting:', error);
    }
  };

  return (
    <Button title="Send Image to /predict" onPress={handlePredict} />
  );
}
