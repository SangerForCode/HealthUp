import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { handleError, showNotification } from '@/utils/notifications';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, SegmentedButtons, TextInput } from 'react-native-paper';

interface FormErrors {
  phone?: string;
  password?: string;
  fullName?: string;
  age?: string;
  height?: string;
  weight?: string;
}

export default function SignUpScreen() {
  const { signUp, isLoading } = useAuth();
  const [userType, setUserType] = useState('normal');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Full name validation
    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    // Age validation
    const ageNum = parseInt(age);
    if (!age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      newErrors.age = 'Please enter a valid age between 18 and 120';
    }

    // Height validation
    const heightNum = parseInt(height);
    if (!height) {
      newErrors.height = 'Height is required';
    } else if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      newErrors.height = 'Please enter a valid height in cm (100-250)';
    }

    // Weight validation
    const weightNum = parseInt(weight);
    if (!weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      newErrors.weight = 'Please enter a valid weight in kg (30-300)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      showNotification('Please fix the errors before continuing', 'error');
      return;
    }

    try {
      await signUp({
        phone,
        password,
        fullName,
        userType: userType as 'normal' | 'primary',
        age: parseInt(age),
        height: parseInt(height),
        weight: parseInt(weight),
        gender,
        medicalHistory: medicalHistory || undefined,
      });
      showNotification('Account created successfully!', 'success');
      router.replace('/(tabs)');
    } catch (error) {
      handleError(error, 'Failed to create account');
    }
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>

        <SegmentedButtons
          value={userType}
          onValueChange={setUserType}
          buttons={[
            { value: 'normal', label: 'Normal User' },
            { value: 'primary', label: 'Primary User' },
          ]}
          style={styles.segment}
          disabled={isLoading}
        />
        
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
          error={!!errors.phone}
          placeholder="+1234567890"
        />
        <HelperText type="error" visible={!!errors.phone}>
          {errors.phone}
        </HelperText>

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
          error={!!errors.password}
        />
        <HelperText type="error" visible={!!errors.password}>
          {errors.password}
        </HelperText>

        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
          error={!!errors.fullName}
        />
        <HelperText type="error" visible={!!errors.fullName}>
          {errors.fullName}
        </HelperText>

        <TextInput
          label="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
          error={!!errors.age}
        />
        <HelperText type="error" visible={!!errors.age}>
          {errors.age}
        </HelperText>

        <TextInput
          label="Height (cm)"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
          error={!!errors.height}
        />
        <HelperText type="error" visible={!!errors.height}>
          {errors.height}
        </HelperText>

        <TextInput
          label="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
          error={!!errors.weight}
        />
        <HelperText type="error" visible={!!errors.weight}>
          {errors.weight}
        </HelperText>

        <SegmentedButtons
          value={gender}
          onValueChange={setGender}
          buttons={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
          style={styles.segment}
          disabled={isLoading}
        />

        <TextInput
          label="Medical History (Optional)"
          value={medicalHistory}
          onChangeText={setMedicalHistory}
          multiline
          numberOfLines={4}
          style={styles.input}
          mode="outlined"
          disabled={isLoading}
        />

        <Button 
          mode="contained" 
          onPress={handleSignUp} 
          style={styles.button}
          loading={isLoading}
          disabled={isLoading || !phone || !password || !fullName || !age || !height || !weight}
        >
          Create Account
        </Button>

        <Button 
          mode="text" 
          onPress={() => router.back()} 
          style={styles.button}
          disabled={isLoading}
        >
          Back to Login
        </Button>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    marginBottom: 4,
  },
  segment: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});