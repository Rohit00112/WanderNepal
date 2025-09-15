import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="saved-places" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="my-contributions" />
          <Stack.Screen name="destination-details" />
          <Stack.Screen name="see-all" />
          <Stack.Screen name="itinerary-planner" />
          <Stack.Screen name="weather-guide" />
          <Stack.Screen name="festivals" />
          <Stack.Screen name="transportation" />
          <Stack.Screen name="cuisine-guide" />
          <Stack.Screen name="language-translator" />
          <Stack.Screen name="emergency-sos" />
          <Stack.Screen name="altitude-monitor" />
          <Stack.Screen name="altitude-settings" />
          <Stack.Screen name="altitude-symptoms" />
          <Stack.Screen name="altitude-info" />
          <Stack.Screen name="trek-analyzer" />
          <Stack.Screen name="offline-routes" />
          <Stack.Screen name="route-details" />
          <Stack.Screen name="full-map" />
          <Stack.Screen name="connectivity-map" />
          <Stack.Screen name="community" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="privacy-settings" />
          <Stack.Screen name="planning-hub" />
          <Stack.Screen name="routes-hub" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}