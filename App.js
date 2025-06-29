// App.js (Compat Mode) - Updated to remove header
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './firebase';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false, // This removes the header completely
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // Remove header for Home screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}