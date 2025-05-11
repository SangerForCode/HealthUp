import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform, TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        headerRight: () => (
          <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 15 }}>
            <MaterialCommunityIcons 
              name="logout" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].tint} 
            />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Measure',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart-pulse" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plots"
        options={{
          title: 'BP Plots',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-line" size={28} color={color} />
          ),
        }}
      />
      {user?.userType === 'primary' && (
        <Tabs.Screen
          name="connected-users"
          options={{
            title: 'Monitored',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-group" size={28} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
