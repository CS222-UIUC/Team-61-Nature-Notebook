import { Tabs } from 'expo-router';
import React, {useEffect, useState} from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const LOCAL_IP = '10.0.2.2';
const BACKEND_URL = Platform.select({
  android: `http://${LOCAL_IP}:5000`,
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`${BACKEND_URL}/me`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      {!user && (
        <>
          <Tabs.Screen
            name="sign-in"
            options={{
              title: 'Sign In',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="sign-up"
            options={{
              title: 'Sign Up',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
            }}
          />
        </>
      )}
    </Tabs>
  );
}