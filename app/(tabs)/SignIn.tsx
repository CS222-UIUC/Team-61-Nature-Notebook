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

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // FINISH THIS -- LOGIC FOR SIGNING IN
    console.log('Signing in with:', { username, password });
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

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.walnut}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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
});
