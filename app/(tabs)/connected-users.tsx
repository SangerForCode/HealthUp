import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { BPMeasurement } from '@/services/BPService';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, IconButton } from 'react-native-paper';

type ConnectedUserData = {
  userId: string;
  name: string;
  phone: string;
  lastMeasurement?: BPMeasurement;
};

export default function ConnectedUsersScreen() {
  const { user } = useAuth();
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConnectedUsers();
  }, []);

  const loadConnectedUsers = async () => {
    if (!user?.connectedUsers) {
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual Firebase query
      const mockUsers: ConnectedUserData[] = [
        {
          userId: '456',
          name: 'John Doe',
          phone: '+1234567890',
          lastMeasurement: {
            id: '789',
            userId: '456',
            systolic: 128,
            diastolic: 82,
            pulse: 72,
            timestamp: new Date(),
            status: 'Normal',
          },
        },
        {
          userId: '457',
          name: 'Jane Smith',
          phone: '+1987654321',
          lastMeasurement: {
            id: '790',
            userId: '457',
            systolic: 142,
            diastolic: 88,
            pulse: 76,
            timestamp: new Date(),
            status: 'High',
          },
        },
      ];

      setConnectedUsers(mockUsers);
    } catch (error) {
      console.error('Error loading connected users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return '#4CAF50';
      case 'Normal': return '#FFC107';
      case 'High': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (!user || user.userType !== 'primary') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>
          This screen is only available for primary users.
        </ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Connected Users</ThemedText>

        {connectedUsers.length === 0 ? (
          <ThemedText style={styles.noData}>
            No connected users yet.
          </ThemedText>
        ) : (
          connectedUsers.map((connectedUser) => (
            <Card key={connectedUser.userId} style={styles.card}>
              <Card.Title
                title={connectedUser.name}
                subtitle={connectedUser.phone}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="chevron-right"
                    onPress={() => {
                      // TODO: Navigate to detailed view
                    }}
                  />
                )}
              />
              {connectedUser.lastMeasurement && (
                <Card.Content>
                  <ThemedView style={styles.measurementContainer}>
                    <ThemedView>
                      <ThemedText style={styles.label}>Last Reading:</ThemedText>
                      <ThemedText>
                        {connectedUser.lastMeasurement.systolic}/
                        {connectedUser.lastMeasurement.diastolic} mmHg
                      </ThemedText>
                      <ThemedText>
                        Pulse: {connectedUser.lastMeasurement.pulse} bpm
                      </ThemedText>
                    </ThemedView>
                    <ThemedView
                      style={[
                        styles.status,
                        { backgroundColor: getStatusColor(connectedUser.lastMeasurement.status) }
                      ]}
                    >
                      <ThemedText style={styles.statusText}>
                        {connectedUser.lastMeasurement.status}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </Card.Content>
              )}
            </Card>
          ))
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    textAlign: 'center',
    color: '#F44336',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    marginBottom: 16,
  },
  measurementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    padding: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
});