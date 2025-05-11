import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserConnection } from '@/components/UserConnection';
import { useAuth } from '@/contexts/AuthContext';
import BPService, { BPMeasurement } from '@/services/BPService';
import { handleError, showNotification } from '@/utils/notifications';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';

export default function MeasureScreen() {
  const { user } = useAuth();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentMeasurements, setRecentMeasurements] = useState<BPMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentMeasurements();
  }, [user]);

  const loadRecentMeasurements = async () => {
    if (!user) return;
    try {
      const measurements = await BPService.getMeasurements(user.id);
      setRecentMeasurements(measurements.slice(0, 3)); // Get 3 most recent
    } catch (error) {
      handleError(error, 'Failed to load measurements');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInput = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse);

    if (isNaN(sys) || isNaN(dia) || isNaN(pul)) {
      showNotification('Please enter valid numbers', 'error');
      return false;
    }

    if (sys < 70 || sys > 200) {
      showNotification('Systolic pressure should be between 70 and 200 mmHg', 'error');
      return false;
    }

    if (dia < 40 || dia > 130) {
      showNotification('Diastolic pressure should be between 40 and 130 mmHg', 'error');
      return false;
    }

    if (pul < 40 || pul > 200) {
      showNotification('Pulse rate should be between 40 and 200 bpm', 'error');
      return false;
    }

    return true;
  };

  const handleAddMeasurement = async () => {
    if (!user) return;
    if (!validateInput()) return;
    
    setIsSubmitting(true);
    try {
      const sys = parseInt(systolic);
      const dia = parseInt(diastolic);
      const status = await BPService.getBPStatus(sys, dia, user.id);
      
      const newMeasurement = await BPService.addMeasurement({
        userId: user.id,
        systolic: sys,
        diastolic: dia,
        pulse: parseInt(pulse),
        timestamp: new Date(),
      });
      
      // Show appropriate message based on BP status
      showNotification(
        status === 'High' 
          ? 'Your blood pressure is high. Consider consulting a healthcare provider.'
          : status === 'Good'
          ? 'Your blood pressure is in a healthy range.'
          : 'Your blood pressure is normal but monitor it regularly.',
        status === 'High' ? 'error' : status === 'Good' ? 'success' : 'info'
      );
      
      // Reset fields and reload measurements
      setSystolic('');
      setDiastolic('');
      setPulse('');
      loadRecentMeasurements();
    } catch (error) {
      handleError(error, 'Failed to save measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBPStatusColor = async (sys: number, dia: number) => {
    if (!user) return '#9E9E9E';
    const status = await BPService.getBPStatus(sys, dia, user.id);
    switch (status) {
      case 'Good': return '#4CAF50';
      case 'Normal': return '#FFC107';
      case 'High': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Blood Pressure Log</ThemedText>

        <UserConnection />

        {recentMeasurements.length > 0 && (
          <ThemedView style={styles.recentContainer}>
            <ThemedText type="subtitle" style={styles.subtitle}>Recent Readings</ThemedText>
            {recentMeasurements.map((measurement) => (
              <Card key={measurement.id} style={styles.card}>
                <Card.Content>
                  <ThemedView style={styles.measurementRow}>
                    <ThemedView>
                      <ThemedText style={styles.measurementText}>
                        {measurement.systolic}/{measurement.diastolic} mmHg
                      </ThemedText>
                      <ThemedText>Pulse: {measurement.pulse} bpm</ThemedText>
                      <ThemedText style={styles.dateText}>
                        {new Date(measurement.timestamp).toLocaleString()}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView
                      style={[
                        styles.statusBadge,
                        { backgroundColor: 
                          measurement.status === 'Good' ? '#4CAF50' :
                          measurement.status === 'Normal' ? '#FFC107' :
                          '#F44336'
                        }
                      ]}
                    >
                      <ThemedText style={styles.statusText}>
                        {measurement.status}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </Card.Content>
              </Card>
            ))}
          </ThemedView>
        )}

        <ThemedText type="subtitle" style={styles.subtitle}>New Reading</ThemedText>

        <TextInput
          label="Systolic Pressure (mmHg)"
          value={systolic}
          onChangeText={setSystolic}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          disabled={isSubmitting}
          error={systolic !== '' && (parseInt(systolic) < 70 || parseInt(systolic) > 200)}
          placeholder="90-140 is normal"
        />

        <TextInput
          label="Diastolic Pressure (mmHg)"
          value={diastolic}
          onChangeText={setDiastolic}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          disabled={isSubmitting}
          error={diastolic !== '' && (parseInt(diastolic) < 40 || parseInt(diastolic) > 130)}
          placeholder="60-90 is normal"
        />

        <TextInput
          label="Pulse Rate (bpm)"
          value={pulse}
          onChangeText={setPulse}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          disabled={isSubmitting}
          error={pulse !== '' && (parseInt(pulse) < 40 || parseInt(pulse) > 200)}
          placeholder="60-100 is normal"
        />

        <Button
          mode="contained"
          onPress={handleAddMeasurement}
          style={styles.button}
          loading={isSubmitting}
          disabled={isSubmitting || !systolic || !diastolic || !pulse || !user}
        >
          Add to Log
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.push('/explore')}
          style={styles.exploreButton}
          icon="chart-line"
        >
          View Analysis
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
  subtitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  exploreButton: {
    marginTop: 8,
  },
  recentContainer: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 8,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 4,
    minWidth: 70,
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
