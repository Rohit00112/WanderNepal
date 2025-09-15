import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const RootLayoutInner = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Handle authentication-based navigation
    if (user === null) {
      // User is not authenticated, redirect to login
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="saved-places" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="my-contributions" options={{ headerShown: false }} />
        <Stack.Screen name="destination-details" options={{ headerShown: false }} />
        <Stack.Screen name="see-all" options={{ headerShown: false }} />
        <Stack.Screen name="itinerary-planner" options={{ headerShown: false }} />
        <Stack.Screen name="weather-guide" options={{ headerShown: false }} />
        <Stack.Screen name="festivals" options={{ headerShown: false }} />
        <Stack.Screen name="transportation" options={{ headerShown: false }} />
        <Stack.Screen name="cuisine-guide" options={{ headerShown: false }} />
        <Stack.Screen name="language-translator" options={{ headerShown: false }} />
        <Stack.Screen name="emergency-sos" options={{ headerShown: false }} />
        <Stack.Screen name="altitude-monitor" options={{ headerShown: false }} />
        <Stack.Screen name="altitude-settings" options={{ headerShown: false }} />
        <Stack.Screen name="altitude-symptoms" options={{ headerShown: false }} />
        <Stack.Screen name="altitude-info" options={{ headerShown: false }} />
        <Stack.Screen name="trek-analyzer" options={{ headerShown: false }} />
        <Stack.Screen name="offline-routes" options={{ headerShown: false }} />
        <Stack.Screen name="route-details" options={{ headerShown: false }} />
        <Stack.Screen name="full-map" options={{ headerShown: false }} />
        <Stack.Screen name="connectivity-map" options={{ headerShown: false }} />
        <Stack.Screen name="community" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-settings" options={{ headerShown: false }} />
        <Stack.Screen name="planning-hub" options={{ headerShown: false }} />
        <Stack.Screen name="routes-hub" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  useFrameworkReady();

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
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}