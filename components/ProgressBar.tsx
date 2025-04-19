import { View, StyleSheet } from 'react-native';

type ProgressBarProps = {
  progress: number;
};

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    width: '100%',
    backgroundColor: '#E5ECF1',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2D5F7F',
    borderRadius: 2,
  },
});