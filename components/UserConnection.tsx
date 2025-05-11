import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function UserConnection() {
  const { user, updatePrimaryUser } = useAuth();
  const [primaryUserPhone, setPrimaryUserPhone] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!user || !primaryUserPhone) return;
    setIsConnecting(true);
    try {
      // TODO: Implement Firebase connection logic
      // For now, just update the local user state
      await updatePrimaryUser(primaryUserPhone);
      setPrimaryUserPhone('');
    } catch (error) {
      console.error('Error connecting users:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (user?.userType === 'primary') {
    return null; // Primary users don't need to connect to anyone
  }

  return (
    <ThemedView style={styles.container}>
      {user?.primaryUserId ? (
        <ThemedText style={styles.connected}>
          Connected to Primary User
        </ThemedText>
      ) : (
        <>
          <ThemedText style={styles.title}>Connect to Primary User</ThemedText>
          <TextInput
            label="Primary User's Phone Number"
            value={primaryUserPhone}
            onChangeText={setPrimaryUserPhone}
            keyboardType="phone-pad"
            style={styles.input}
            mode="outlined"
            disabled={isConnecting}
          />
          <Button
            mode="contained"
            onPress={handleConnect}
            loading={isConnecting}
            disabled={isConnecting || !primaryUserPhone}
            style={styles.button}
          >
            Connect
          </Button>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  connected: {
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});