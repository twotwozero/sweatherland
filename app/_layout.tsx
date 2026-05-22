import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from '../providers/GameProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="egg" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="mood" options={{ presentation: 'modal' }} />
          <Stack.Screen name="action" options={{ presentation: 'modal' }} />
        </Stack>
      </GameProvider>
    </SafeAreaProvider>
  );
}
