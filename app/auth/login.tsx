import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { handleError, showNotification } from '@/utils/notifications';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const { signIn, bypassLogin, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validatePhone = (value: string) => {
    setPhone(value);
    if (value && !/^\+?[\d\s-]{10,}$/.test(value)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (phoneError) {
      showNotification('Please fix the errors before continuing', 'error');
      return;
    }

    try {
      await signIn(phone, password, rememberMe);
      router.replace('/(tabs)');
    } catch (error) {
      handleError(error, 'Login failed. Please check your credentials.');
    }
  };

  const handleBypass = async () => {
    try {
      await bypassLogin();
      router.replace('/(tabs)');
    } catch (error) {
      handleError(error, 'Bypass login failed');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={[styles.logo, { opacity: isDark ? 0.9 : 1 }]}
      />
      
      <ThemedText type="title" style={styles.title}>HealthUp</ThemedText>
      <ThemedText style={styles.subtitle}>Monitor your health with precision</ThemedText>
      
      <TextInput
        label="Phone Number"
        value={phone}
        onChangeText={validatePhone}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
        disabled={isLoading}
        error={!!phoneError}
        placeholder="+1234567890"
        theme={{
          colors: {
            primary: Colors[isDark ? 'dark' : 'light'].tint,
          },
        }}
      />
      {phoneError ? (
        <ThemedText style={styles.errorText}>{phoneError}</ThemedText>
      ) : null}
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        disabled={isLoading}
        theme={{
          colors: {
            primary: Colors[isDark ? 'dark' : 'light'].tint,
          },
        }}
      />

      <Pressable 
        onPress={() => setRememberMe(!rememberMe)}
        style={styles.rememberMe}
      >
        <ThemedView 
          style={[
            styles.checkbox, 
            rememberMe && { backgroundColor: Colors[isDark ? 'dark' : 'light'].tint }
          ]}
        >
          {rememberMe && (
            <ThemedText style={styles.checkmark}>✓</ThemedText>
          )}
        </ThemedView>
        <ThemedText>Remember Me</ThemedText>
      </Pressable>

      <Button 
        mode="contained" 
        onPress={handleLogin} 
        style={styles.button}
        loading={isLoading}
        disabled={isLoading || !phone || !password || !!phoneError}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Sign in
      </Button>

      <Button 
        mode="outlined" 
        onPress={handleBypass}
        style={[styles.button, styles.bypassButton]}
        disabled={isLoading}
        contentStyle={styles.buttonContent}
      >
        Quick Demo Access
      </Button>

      <Button 
        mode="text" 
        onPress={() => router.push('/auth/signup')}
        style={styles.createAccount}
        labelStyle={styles.createAccountLabel}
      >
        Create Account
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 8,
    alignSelf: 'flex-start',
    maxWidth: 400,
    width: '100%',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
    maxWidth: 400,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  button: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 12,
    borderRadius: 25,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  bypassButton: {
    borderColor: Colors.light.tint,
  },
  createAccount: {
    marginTop: 12,
  },
  createAccountLabel: {
    fontSize: 16,
  },
});