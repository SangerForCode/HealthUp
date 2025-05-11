import { BPRangesSettings } from '@/components/BPRangesSettings';
import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TimeInput } from '@/components/TimeInput';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import BPService from '@/services/BPService';
import PreferencesService, { BPRanges, UserPreferences } from '@/services/PreferencesService';
import { requestNotificationPermissions, scheduleMeasurementReminder, showNotification } from '@/utils/notifications';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme as useSystemColorScheme } from 'react-native';
import { Button, Dialog, List, Portal, Switch } from 'react-native-paper';

// Define the BPRange interface to match the component's expectations
interface BPRange {
  systolic: { min: number; max: number };
  diastolic: { min: number; max: number };
}

export default function SettingsScreen() {
  const systemColorScheme = useSystemColorScheme();
  const colorScheme = useColorScheme();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    try {
      const prefs = await PreferencesService.getPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      showNotification('Failed to load preferences', 'error');
    }
  };

  const handleThemeChange = async (isDark: boolean) => {
    try {
      // Fixed theme setting logic to correctly handle the switch state
      const newTheme = isDark ? 'dark' : 'light';
      await setTheme(newTheme);
      showNotification(
        `Switched to ${isDark ? 'dark' : 'light'} mode`,
        'success'
      );
    } catch (error) {
      showNotification('Failed to change theme', 'error');
    }
  };

  const handleSystemTheme = async () => {
    try {
      await setTheme(null);
      showNotification('Using system theme', 'success');
    } catch (error) {
      showNotification('Failed to reset theme', 'error');
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (!user || !preferences) return;
    try {
      if (enabled) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          showNotification('Please enable notifications in your device settings', 'warning');
          return;
        }
      }

      await PreferencesService.toggleNotifications(user.id, enabled);
      setPreferences({ ...preferences, notificationsEnabled: enabled });
      
      // Update reminder schedule if notifications are disabled
      if (!enabled && preferences.measurementReminder) {
        await handleReminderToggle(false);
      }
      
      showNotification(
        `Notifications ${enabled ? 'enabled' : 'disabled'}`,
        'success'
      );
    } catch (error) {
      showNotification('Failed to update notification settings', 'error');
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (!user || !preferences) return;
    try {
      if (enabled && !preferences.notificationsEnabled) {
        showNotification('Please enable notifications first', 'warning');
        return;
      }

      await PreferencesService.setMeasurementReminder(
        user.id,
        enabled,
        preferences.reminderTime
      );
      
      // Schedule or cancel reminder
      await scheduleMeasurementReminder(
        user.id,
        preferences.reminderTime || '09:00',
        enabled
      );
      
      setPreferences({ ...preferences, measurementReminder: enabled });
      if (enabled && !preferences.reminderTime) {
        setTimePickerVisible(true);
      }
    } catch (error) {
      showNotification('Failed to update reminder settings', 'error');
    }
  };

  const handleReminderTimeChange = async (time: string) => {
    if (!user || !preferences) return;
    try {
      await PreferencesService.setMeasurementReminder(
        user.id,
        preferences.measurementReminder,
        time
      );
      
      // Update reminder schedule with new time
      if (preferences.measurementReminder) {
        await scheduleMeasurementReminder(user.id, time, true);
      }
      
      setPreferences({ ...preferences, reminderTime: time });
      setTimePickerVisible(false);
      showNotification('Reminder time updated', 'success');
    } catch (error) {
      showNotification('Failed to update reminder time', 'error');
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;
    try {
      await BPService.clearMeasurements(user.id);
      showNotification('All measurement data has been deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete data', 'error');
    } finally {
      setDeleteDialogVisible(false);
    }
  };

  const handleRangeChange = async (type: 'normal' | 'high', range: BPRange) => {
    if (!user || !preferences) return;
    try {
      const newRanges = {
        good: type === 'normal' ? range : preferences.bpRanges.good,
        normal: type === 'high' ? range : preferences.bpRanges.normal,
      };
      await PreferencesService.updateBPRanges(user.id, newRanges);
      setPreferences({ ...preferences, bpRanges: newRanges });
      showNotification('BP ranges updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update BP ranges', 'error');
    }
  };

  if (!user || !preferences) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          description={theme === null ? 'Using system setting' : undefined}
          right={() => (
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeChange}
            />
          )}
        />
        {theme !== null && (
          <Button
            mode="text"
            onPress={handleSystemTheme}
            style={styles.systemThemeButton}
          >
            Use System Theme ({systemColorScheme === 'dark' ? 'Dark' : 'Light'})
          </Button>
        )}
      </List.Section>

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Enable Notifications"
          right={() => (
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
            />
          )}
        />
        <List.Item
          title="Measurement Reminder"
          description={preferences.reminderTime || 'No time set'}
          right={() => (
            <Switch
              value={preferences.measurementReminder}
              onValueChange={handleReminderToggle}
            />
          )}
        />
      </List.Section>

      <Collapsible title="BP Range Settings">
        <BPRangesSettings 
          ranges={{
            normal: preferences.bpRanges.good,
            high: preferences.bpRanges.normal,
          }}
          onRangeChange={handleRangeChange}
        />
      </Collapsible>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Phone Number"
          description={user.phone}
        />
        <List.Item
          title="Account Type"
          description={user.userType === 'primary' ? 'Primary User' : 'Normal User'}
        />
      </List.Section>

      {user.userType === 'normal' && (
        <List.Section>
          <List.Subheader>Health Data</List.Subheader>
          <List.Item
            title="Height"
            description={`${user.height} cm`}
          />
          <List.Item
            title="Weight"
            description={`${user.weight} kg`}
          />
        </List.Section>
      )}

      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        <Button
          mode="outlined"
          onPress={() => setDeleteDialogVisible(true)}
          style={styles.deleteButton}
          textColor="#F44336"
        >
          Delete All Measurements
        </Button>
      </List.Section>

      <Button
        mode="contained"
        onPress={signOut}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete All Data</Dialog.Title>
          <Dialog.Content>
            <ThemedText>
              Are you sure you want to delete all your blood pressure measurements? This action cannot be undone.
            </ThemedText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteData} textColor="#F44336">Delete</Button>
          </Dialog.Actions>
        </Dialog>

        {isTimePickerVisible && (
          <Dialog
            visible={isTimePickerVisible}
            onDismiss={() => setTimePickerVisible(false)}
          >
            <Dialog.Title>Set Reminder Time</Dialog.Title>
            <Dialog.Content>
              <TimeInput
                value={preferences.reminderTime || '09:00'}
                onChange={(time) => handleReminderTimeChange(time)}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setTimePickerVisible(false)}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        )}
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteButton: {
    margin: 16,
    borderColor: '#F44336',
  },
  signOutButton: {
    margin: 16,
  },
  systemThemeButton: {
    marginHorizontal: 16,
  },
});