import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
// 🔑 Named import of the Camera component:
import { Camera } from 'expo-camera';

export default function Home() {
  const [hasPermission, setHasPermission] = useState(null);
  const [showCamera, setShowCamera]       = useState(false);
  const [photoUri, setPhotoUri]           = useState(null);
  const cameraRef = useRef(null);

  // Ask for camera permissions as soon as the component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setPhotoUri(photo.uri);
    setShowCamera(false);
  };

  // While checking permissions
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Requesting camera permissions…</Text>
      </SafeAreaView>
    );
  }
  // Permission denied
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No access to camera</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ————— Camera Modal ————— */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.snapButton}
              onPress={takePicture}
            >
              <Text style={styles.snapText}>SNAP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </Modal>

      {/* ————— Header ————— */}
      <View style={styles.header}>
        <Text style={styles.title}>Nature Notebook</Text>
      </View>

      {/* ————— Preview ————— */}
      {photoUri && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Last Photo</Text>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        </View>
      )}

      {/* ————— Buttons ————— */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.fixedWidth]}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.buttonText}>Scan Animal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonSecondary, styles.fixedWidth]}>
          <Text style={styles.buttonText}>View Notebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonSecondary, styles.fixedWidth]}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  darkBrown: '#363020',
  walnut:   '#605C4E',
  ecru:     '#A49966',
  sage:     '#C7C7A6',
  nyanza:   '#EAFFDA',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.nyanza,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    justifyContent: 'center',  // truly center vertically
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.darkBrown,
    textAlign: 'center',
  },
  preview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end', // push buttons to bottom
    alignItems: 'center',
    paddingBottom: 60,
  },
  button: {
    backgroundColor: COLORS.ecru,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: COLORS.sage,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  fixedWidth: {
    width: '80%',
  },
  buttonText: {
    color: COLORS.darkBrown,
    fontSize: 18,
    fontWeight: '600',
  },

  // — Camera & Modal styles —
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  snapButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  snapText: {
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
});
