import React, {useState} from 'react';
import {Platform, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView} from 'react-native';
import {useRouter} from 'expo-router';

const LOCAL_IP = '10.0.2.2';
const LAN_FALLBACK = 'http://localhost:5000';
const BACKEND_URL = Platform.select({
    android: `http://${LOCAL_IP}:5000`,
    ios: LAN_FALLBACK,
    default: LAN_FALLBACK,
  });  

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const handleSignUp = async () => {
        setError('');
        if(!email || !username || !password){
            setError('All fields are required.');
            return;
        }if(!validateEmail(email)){
            setError('Invalid Email Format.');
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/complete-signup`, {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify({email, username, password}),
                credentials: 'include'
            });

            const data = await res.json();
            if(res.status===200){
                router.replace('/');
            } else {
                setError(data.error || 'Signup failed.');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        }
    }
    return(
<SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.toggleButtonText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
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
    container: {
        flex: 1,
        backgroundColor: COLORS.nyanza,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.darkBrown,
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        backgroundColor: COLORS.sage,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        color: COLORS.darkBrown,
    },
      passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.sage,
        borderRadius: 10,
        marginBottom: 16,
      },
      passwordInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: COLORS.darkBrown,
      },
      toggleButton: {
        padding: 15,
        borderLeftWidth: 1,
        borderColor: COLORS.walnut,
      },
      toggleButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.walnut,
      },  
    button: {
    backgroundColor: COLORS.ecru,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    },  
    buttonText: {
        color: COLORS.darkBrown,
        fontSize: 18,
        fontWeight: '600',
    },
      error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 12,
      },
    });