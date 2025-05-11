import AsyncStorage from '@react-native-async-storage/async-storage';
import PreferencesService, { BPRanges } from './PreferencesService';

export type BPMeasurement = {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp: Date;
  status: 'Good' | 'Normal' | 'High';
};

class BPService {
  private static BP_KEY = 'bp_measurements';

  static async addMeasurement(measurement: Omit<BPMeasurement, 'id' | 'status'>): Promise<BPMeasurement> {
    try {
      const measurements = await this.getMeasurements();
      const status = await this.getBPStatus(measurement.systolic, measurement.diastolic, measurement.userId);
      
      const newMeasurement: BPMeasurement = {
        ...measurement,
        id: Date.now().toString(),
        status,
      };
      
      measurements.push(newMeasurement);
      await AsyncStorage.setItem(this.BP_KEY, JSON.stringify(measurements));

      // TODO: Sync with Firebase for primary user access
      
      return newMeasurement;
    } catch (error) {
      console.error('Error adding measurement:', error);
      throw error;
    }
  }

  static async getMeasurements(userId?: string): Promise<BPMeasurement[]> {
    try {
      const data = await AsyncStorage.getItem(this.BP_KEY);
      const measurements: BPMeasurement[] = data ? JSON.parse(data) : [];
      
      if (userId) {
        return measurements.filter(m => m.userId === userId);
      }
      
      return measurements;
    } catch (error) {
      console.error('Error getting measurements:', error);
      throw error;
    }
  }

  static async getBPStatus(
    systolic: number,
    diastolic: number,
    userId: string
  ): Promise<'Good' | 'Normal' | 'High'> {
    try {
      const preferences = await PreferencesService.getPreferences(userId);
      const { good, normal } = preferences.bpRanges;

      if (this.isInRange(systolic, diastolic, good)) return 'Good';
      if (this.isInRange(systolic, diastolic, normal)) return 'Normal';
      return 'High';
    } catch (error) {
      console.error('Error getting BP status:', error);
      // Fallback to default ranges if preferences can't be loaded
      if (systolic < 120 && diastolic < 80) return 'Good';
      if (systolic < 130 && diastolic < 85) return 'Normal';
      return 'High';
    }
  }

  private static isInRange(
    systolic: number,
    diastolic: number,
    range: BPRanges
  ): boolean {
    return (
      systolic >= range.systolic.min &&
      systolic <= range.systolic.max &&
      diastolic >= range.diastolic.min &&
      diastolic <= range.diastolic.max
    );
  }

  static async getPrediction(userId: string): Promise<{ prediction: string; confidence: number }> {
    // TODO: Implement ML prediction using TensorFlow Lite
    // This is a placeholder that returns a mock prediction
    return {
      prediction: 'Your blood pressure is likely to remain stable',
      confidence: 0.85
    };
  }

  static async clearMeasurements(userId?: string): Promise<void> {
    try {
      if (userId) {
        // Delete only specific user's measurements
        const measurements = await this.getMeasurements();
        const filteredMeasurements = measurements.filter(m => m.userId !== userId);
        await AsyncStorage.setItem(this.BP_KEY, JSON.stringify(filteredMeasurements));
      } else {
        // Delete all measurements
        await AsyncStorage.removeItem(this.BP_KEY);
      }
    } catch (error) {
      console.error('Error clearing measurements:', error);
      throw error;
    }
  }
}

export default BPService;