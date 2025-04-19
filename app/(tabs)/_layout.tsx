import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Chrome as Home, Map, MessageCircle, User, Camera, Compass } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function TabLayout() {
  const tabBarHeight = useSharedValue(60);
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.replace('/login');
    return null;
  }

  const tabBarStyle = useAnimatedStyle(() => ({
    height: withSpring(tabBarHeight.value),
  }));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, tabBarStyle],
        tabBarBackground: () => (
          <AnimatedBlurView intensity={90} style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: '#72777A',
        tabBarLabelStyle: styles.tabLabel,
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },
});
