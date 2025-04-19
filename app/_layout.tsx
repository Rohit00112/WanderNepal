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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
          redirect={!user}
        />
        <Stack.Screen 
          name="booking" 
          options={{ headerShown: false }}
          redirect={!user}
        />
        <Stack.Screen 
          name="login" 
          options={{ headerShown: false }}
          redirect={user}
        />
        <Stack.Screen 
          name="register" 
          options={{ headerShown: false }}
          redirect={user}
        />
        <Stack.Screen 
          name="saved-places" 
          options={{ headerShown: false }}
          redirect={!user}
        />
        <Stack.Screen 
          name="favorites" 
          options={{ headerShown: false }}
          redirect={!user}
        />
        <Stack.Screen 
          name="my-contributions" 
          options={{ headerShown: false }}
          redirect={!user}
        />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();

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