import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BPRanges {
  systolic: {
    min: number;
    max: number;
  };
  diastolic: {
    min: number;
    max: number;
  };
}

export interface UserPreferences {
  id: string;
  bpRanges: {
    good: BPRanges;
    normal: BPRanges;
  };
  notificationsEnabled: boolean;
  measurementReminder: boolean;
  reminderTime?: string; // HH:mm format
  useMetricSystem: boolean;
}

const DEFAULT_BP_RANGES = {
  good: {
    systolic: { min: 90, max: 120 },
    diastolic: { min: 60, max: 80 },
  },
  normal: {
    systolic: { min: 120, max: 130 },
    diastolic: { min: 80, max: 85 },
  },
};

class PreferencesService {
  private static PREFERENCES_KEY = 'user_preferences';

  static async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(`${this.PREFERENCES_KEY}_${userId}`);
      if (data) {
        return JSON.parse(data);
      }

      // Return default preferences if none exist
      const defaultPreferences: UserPreferences = {
        id: userId,
        bpRanges: DEFAULT_BP_RANGES,
        notificationsEnabled: true,
        measurementReminder: false,
        useMetricSystem: true,
      };

      await this.savePreferences(defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }

  static async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.PREFERENCES_KEY}_${preferences.id}`,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  static async updateBPRanges(
    userId: string,
    ranges: { good: BPRanges; normal: BPRanges }
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      preferences.bpRanges = ranges;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error updating BP ranges:', error);
      throw error;
    }
  }

  static async toggleNotifications(userId: string, enabled: boolean): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      preferences.notificationsEnabled = enabled;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      throw error;
    }
  }

  static async setMeasurementReminder(
    userId: string,
    enabled: boolean,
    time?: string
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      preferences.measurementReminder = enabled;
      preferences.reminderTime = time;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error setting measurement reminder:', error);
      throw error;
    }
  }

  static async toggleMetricSystem(userId: string, useMetric: boolean): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      preferences.useMetricSystem = useMetric;
      await this.savePreferences(preferences);
    } catch (error) {
      console.error('Error toggling metric system:', error);
      throw error;
    }
  }
}

export default PreferencesService;