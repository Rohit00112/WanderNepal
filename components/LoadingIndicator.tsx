import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  useSharedValue,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { useEffect } from 'react';

export default function LoadingIndicator() {
  const dots = Array(3).fill(0).map(() => useSharedValue(0));

  useEffect(() => {
    dots.forEach((dot, index) => {
      dot.value = withRepeat(
        withSequence(
          withDelay(
            index * 200,
            withTiming(1, { duration: 400 })
          ),
          withDelay(
            600,
            withTiming(0, { duration: 400 })
          )
        ),
        -1
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            useAnimatedStyle(() => ({
              transform: [{ scale: dot.value }],
              opacity: dot.value,
            })),
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF385C',
  },
});