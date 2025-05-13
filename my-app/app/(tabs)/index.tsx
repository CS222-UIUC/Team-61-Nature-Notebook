import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Image,
  ScrollView,
  Platform 
} from 'react-native';
import Webcam from 'react-webcam';
import { saveAs } from 'file-saver';
import {useFocusEffect, useRouter} from 'expo-router';
const LOCAL_IP = '10.0.2.2';
const LAN_FALLBACK = 'http://localhost:1109';
const BACKEND_URL = Platform.select({
    android: `http://${LOCAL_IP}:1109`,
    ios: LAN_FALLBACK,
    default: LAN_FALLBACK,
  });


export default function Home() {
  const [showCamera, setShowCamera] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [username, setUsername] = useState('');

  const [notebookData, setNotebookData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [lastSpecies, setLastSpecies] = useState('');
  const [lastSpeciesNum, setLastSpeciesNum] = useState('');
  const fetchNotebook = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/notebook`, {
        method: 'GET',
        credentials: 'include',
      });
      if(res.ok) {
        const data = await res.json();
        setNotebookData(data);
      }
    } catch (err) {
      console.error('Error fetching notebook:', err);
    }
  };

  const router = useRouter();

  const handleLogout = async() => {
    try {
      const res = await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      }); if(res.ok){
        setUsername('');
        router.replace('/sign-in');
      }
    } catch (err){
      console.error('Logout failed:', err);
    }
  };


  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/me`, {
            method: 'GET',
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            setUsername(data.username);
          } else {
            setUsername('');
          }
        } catch (err) {
          console.log('Error fetching user:', err);
        }
      };
  
      fetchUser();
    }, [])
  );

  const webcamRef = useRef(null);

  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result;
      setPhotoUri(base64data);
  
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const res = await fetch(`${BACKEND_URL}/predict`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
  
        const result = await res.json();
        setLastSpecies(result.name);
        setLastSpeciesNum(result.id);
        console.log('Predicted class from file:', result);
      } catch (err) {
        console.error('Upload prediction error:', err);
      }
    };
  
    reader.readAsDataURL(file);
  };
  
  

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
  
    setPhotoUri(imageSrc);
    try {
      
    const res = await fetch(imageSrc);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append('file', blob, `snap_${Date.now()}.jpg`);
  
    const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
  
      const result = await response.json();
      setLastSpecies(result.name);
      setLastSpeciesNum(result.id);
      console.log('Predicted class:', result);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  
    setShowCamera(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Browser-Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={styles.webcam}
          />
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.snapButton} onPress={capture}>
              <Text style={styles.snapText}>SNAP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    
    <View style={styles.header}>
      <Text style={styles.title}>Nature Notebook</Text>
      <Text style={styles.greeting}>
      {username ? `Hi, ${username}` : 'Not Signed In'}
      </Text>
    </View>

      {/* Notebook Modal */}
      <Modal
        visible={showNotebook}
        animationType="slide"
        onRequestClose={() => setShowNotebook(false)}
      >
        <SafeAreaView style={styles.notebookContainer}>
          <Text style={styles.notebookTitle}>My Notebook</Text>
          <ScrollView contentContainerStyle={styles.grid}>
          {notebookData.map((bird, i) => (
            <TouchableOpacity
            key={bird.id}
            style={styles.birdBox}
            onPress={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
          >          
              <Text style={styles.birdName}> (#{bird.id}) {bird.name} </Text>
              {expandedIndex === i && (
                <Text style={styles.birdDescription}>{bird.description}</Text>
              )}
            </TouchableOpacity>
          ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeNotebookFull}
            onPress={() => setShowNotebook(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <SafeAreaView style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <View style={styles.settingsButtons}>
            <TouchableOpacity style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>Change Username</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>Reset Progress</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeNotebook}
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Preview */}
      {photoUri && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>
          Last Photo: {lastSpecies.replace(/[_-]/g, ' ')} </Text>

          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.fixedWidth]}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.buttonText}>Scan Animal</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={[styles.buttonSecondary, styles.fixedWidth]}
  onPress={() => fileInputRef.current?.click()}
>
  <Text style={styles.buttonText}>Upload Image</Text>
</TouchableOpacity>

<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={handleFileUpload}
  style={{ display: 'none' }}
/>
{username && (
        <TouchableOpacity
          style={[styles.buttonSecondary, styles.fixedWidth]}
          onPress={() => {
            fetchNotebook();
            setShowNotebook(true);
          }}
        >
          <Text style={styles.buttonText}>View Notebook</Text>
        </TouchableOpacity>
)}
        {username && (
      <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.fixedWidth]}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
        )}


        {/* IN PROGRESS -- BUTTON NOT AVAILABLE CURRENTLY
        <TouchableOpacity
          style={[styles.buttonSecondary, styles.fixedWidth]}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        */}
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  darkBrown: '#363020',
  walnut: '#605C4E',
  ecru: '#A49966',
  sage: '#C7C7A6',
  nyanza: '#EAFFDA',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.nyanza, padding: 20 },

  header: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 48, fontWeight: 'bold', color: COLORS.darkBrown },

  preview: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 180,
  },
  previewLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: COLORS.darkBrown,
  },
  previewImage: {
    width: 320,
    height: 320,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.darkBrown,
  },

  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
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
  fixedWidth: { width: '80%' },
  buttonText: {
    color: COLORS.darkBrown,
    fontSize: 18,
    fontWeight: '600',
  },

  // Webcam styles
  cameraContainer: {
    flex: 1,
    backgroundColor: COLORS.nyanza,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webcam: {
    width: '100%',
    height: '75%',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  snapButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapText: { fontWeight: 'bold' },
  closeButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { color: COLORS.darkBrown, fontSize: 18 },

  // Notebook styles
  notebookContainer: {
    flex: 1,
    backgroundColor: COLORS.nyanza,
    padding: 20,
  },
  notebookTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkBrown,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  placeholder: {
    width: '28%',
    aspectRatio: 1,
    backgroundColor: COLORS.sage,
    marginBottom: 15,
    borderRadius: 8,
  },
  closeNotebook: {
    backgroundColor: COLORS.ecru,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  closeNotebookFull: {
    backgroundColor: COLORS.ecru,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  

  // Settings styles
  settingsContainer: {
    flex: 1,
    backgroundColor: COLORS.nyanza,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkBrown,
    textAlign: 'center',
    marginBottom: 20,
  },
  settingsButtons: {
    width: '80%',
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: COLORS.sage,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  
  settingsButtonText: {
    fontSize: 18,
    color: COLORS.darkBrown,
    fontWeight: '600',
  },
  greeting: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 16,
    color: COLORS.darkBrown,
    fontWeight: '600',
  },  
  logoutButton: {
    backgroundColor: COLORS.walnut,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  birdBox: {
    width: '45%',
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  birdName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkBrown,
    textAlign: 'center',
  },
  birdDescription: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.darkBrown,
    textAlign: 'center',
  },  
});