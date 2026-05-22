import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../providers/GameProvider';
import { PASTEL_COLORS } from '../constants';

export default function SplashRouter() {
  const { state, loaded } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;
    if (!state.player) {
      router.replace('/onboarding');
    } else if (!state.creature) {
      router.replace('/egg');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [loaded, state.player, state.creature]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={PASTEL_COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: PASTEL_COLORS.background },
});
