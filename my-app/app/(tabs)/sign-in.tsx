import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {Link, useRouter} from 'expo-router';
import { saveAs } from 'file-saver';
const LOCAL_IP = '10.0.2.2';
const LAN_FALLBACK = 'http://localhost:5000';
const BACKEND_URL = Platform.select({
    android: `http://${LOCAL_IP}:5000`,
    ios: LAN_FALLBACK,
    default: LAN_FALLBACK,
  });


export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    
    const data = await res.json();
    if (res.status === 200) {
      router.replace('/');
    } else {
      setError(data.error || 'Login failed.');
    }} catch(err) {
      setError('Could not connect to the Server');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Nature Notebook</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={COLORS.walnut}
          value={username}
          onChangeText={setUsername}
        />

<View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Password"
    placeholderTextColor={COLORS.walnut}
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={setPassword}
  />
  <TouchableOpacity
    style={styles.toggleButton}
    onPress={() => setShowPassword(prev => !prev)}
  >
    <Text style={styles.toggleButtonText}>
      {showPassword ? 'Hide' : 'Show'}
    </Text>
  </TouchableOpacity>
</View>


        {error ? <Text style={styles.error}>{error}</Text> : null}


        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
        <Link href="/sign-up" style={styles.linkButton}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </Link>

      </TouchableOpacity>

      </KeyboardAvoidingView>
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
  subtitle: {
    fontSize: 16,
    color: COLORS.walnut,
    marginBottom: 30,
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
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.walnut,
    fontSize: 14,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  }, 
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: COLORS.darkBrown,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderLeftWidth: 1,
    borderColor: COLORS.walnut,
  },
  toggleButtonText: {
    color: COLORS.darkBrown,
    fontWeight: '600',
  },   
});
