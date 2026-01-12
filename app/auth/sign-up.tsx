import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/useAuth';
import Toast from 'react-native-toast-message';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGitHub, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(email, password);
      
      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: 'Welcome to Hanway',
      });
      
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: error.message || 'Could not create account',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsSubmitting(true);
      const result = await signInWithGoogle();
      
      // Only navigate if we got a valid session
      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: 'Successfully signed up with Google',
        });
        
        router.replace('/(tabs)');
      } else {
        // OAuth was cancelled or no session returned
        setIsSubmitting(false);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: error.message || 'Could not sign up with Google',
      });
      setIsSubmitting(false);
    }
  };

  const handleGitHubSignUp = async () => {
    try {
      setIsSubmitting(true);
      const result = await signInWithGitHub();
      
      // Only navigate if we got a valid session
      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: 'Successfully signed up with GitHub',
        });
        
        router.replace('/(tabs)');
      } else {
        // OAuth was cancelled or no session returned
        setIsSubmitting(false);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: error.message || 'Could not sign up with GitHub',
      });
      setIsSubmitting(false);
    }
  };

  const navigateToSignIn = () => {
    router.push('/auth/sign-in');
  };

  const skipToApp = () => {
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>汉道 Hanway</Text>
        <Text style={styles.subtitle}>Create an account to sync your progress</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isSubmitting}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isSubmitting}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!isSubmitting}
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleEmailSignUp}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.oauthButton]}
          onPress={handleGoogleSignUp}
          disabled={isSubmitting}
        >
          <Text style={styles.oauthButtonText}>🔍 Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.oauthButton]}
          onPress={handleGitHubSignUp}
          disabled={isSubmitting}
        >
          <Text style={styles.oauthButtonText}>💻 GitHub</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={navigateToSignIn} disabled={isSubmitting}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipToApp}
          disabled={isSubmitting}
        >
          <Text style={styles.skipText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  oauthButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  oauthButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#999',
    fontSize: 14,
  },
});
