import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import BPService, { BPMeasurement } from '@/services/BPService';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ActivityIndicator, Button } from 'react-native-paper';

export default function PlotsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BPMeasurement[]>([]);
  const [prediction, setPrediction] = useState<{ prediction: string; confidence: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, [user]);

  const loadMeasurements = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await BPService.getMeasurements(user.id);
      setMeasurements(data);
    } catch (error) {
      console.error('Error loading measurements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPrediction = async () => {
    if (!user) return;
    setIsPredicting(true);
    try {
      const pred = await BPService.getPrediction(user.id);
      setPrediction(pred);
    } catch (error) {
      console.error('Error getting prediction:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const bpData = {
    labels: measurements.map(m => {
      const date = new Date(m.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: measurements.map(m => m.systolic),
        color: () => '#F44336',
        strokeWidth: 2,
      },
      {
        data: measurements.map(m => m.diastolic),
        color: () => '#2196F3',
        strokeWidth: 2,
      },
    ],
    legend: ['Systolic', 'Diastolic'],
  };

  const pulseData = {
    labels: measurements.map(m => {
      const date = new Date(m.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: measurements.map(m => m.pulse),
        color: () => '#4CAF50',
        strokeWidth: 2,
      },
    ],
    legend: ['Pulse'],
  };

  const chartConfig = {
    backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
    backgroundGradientFrom: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
    backgroundGradientTo: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => isDark 
      ? `rgba(255, 255, 255, ${opacity})`
      : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => isDark
      ? `rgba(255, 255, 255, ${opacity})`
      : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    propsForBackgroundLines: {
      stroke: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Blood Pressure Trends</ThemedText>
        
        {measurements.length === 0 ? (
          <ThemedText style={styles.noData}>No measurements recorded yet</ThemedText>
        ) : (
          <>
            <ThemedText type="subtitle" style={styles.subtitle}>Blood Pressure Over Time</ThemedText>
            <LineChart
              data={bpData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots
              withShadow={!isDark}
              withVerticalLines
              withHorizontalLines
              fromZero={false}
            />

            <ThemedText type="subtitle" style={styles.subtitle}>Pulse Rate Over Time</ThemedText>
            <LineChart
              data={pulseData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots
              withShadow={!isDark}
              withVerticalLines
              withHorizontalLines
              fromZero={false}
            />

            <ThemedView style={styles.legend}>
              <ThemedView style={styles.legendItem}>
                <ThemedView style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <ThemedText>Systolic</ThemedText>
              </ThemedView>
              <ThemedView style={styles.legendItem}>
                <ThemedView style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
                <ThemedText>Diastolic</ThemedText>
              </ThemedView>
              <ThemedView style={styles.legendItem}>
                <ThemedView style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <ThemedText>Pulse</ThemedText>
              </ThemedView>
            </ThemedView>

            <Button
              mode="contained"
              onPress={getPrediction}
              loading={isPredicting}
              style={styles.button}
            >
              Get BP Prediction
            </Button>

            {prediction && (
              <ThemedView style={styles.predictionContainer}>
                <ThemedText style={styles.prediction}>{prediction.prediction}</ThemedText>
                <ThemedText style={styles.confidence}>
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </ThemedText>
              </ThemedView>
            )}
          </>
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
    marginVertical: 20,
  },
  subtitle: {
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    padding: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  button: {
    marginTop: 20,
  },
  predictionContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
  },
  prediction: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
  },
  confidence: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
    marginTop: 5,
  },
});