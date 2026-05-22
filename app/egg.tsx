import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../providers/GameProvider';
import { PASTEL_COLORS } from '../constants';

export default function EggScreen() {
  const [name, setName] = useState('');
  const [hatched, setHatched] = useState(false);
  const { createCreature, state } = useGame();
  const router = useRouter();

  const shake = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  function handleHatch() {
    const trimmed = name.trim();
    if (!trimmed) return;

    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(scale, { toValue: 2, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => {
      createCreature(trimmed);
      setHatched(true);
    });
  }

  useEffect(() => {
    if (hatched) {
      const timer = setTimeout(() => router.replace('/(tabs)/home'), 1200);
      return () => clearTimeout(timer);
    }
  }, [hatched]);

  if (hatched) {
    return (
      <View style={styles.hatchedContainer}>
        <Text style={styles.hatchedEmoji}>🫧</Text>
        <Text style={styles.hatchedText}>반가워, {name}!</Text>
        <Text style={styles.hatchedSub}>마음알이 깨어났어요 ✨</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.greeting}>
            {state.player?.name ? `${state.player.name}님,` : ''} 안녕하세요 👋
          </Text>
          <Text style={styles.title}>아직 이름 없는 마음알이{'\n'}당신을 기다리고 있어요</Text>

          <Animated.Text
            style={[
              styles.egg,
              { transform: [{ translateX: shake }, { scale }], opacity },
            ]}
          >
            🥚
          </Animated.Text>

          <Text style={styles.hint}>이름을 지어주면 알이 부화해요</Text>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>마음알의 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 지어주세요"
              placeholderTextColor={PASTEL_COLORS.textLight}
              value={name}
              onChangeText={setName}
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={handleHatch}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleHatch}
            disabled={!name.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>이름 지어주기 🐣</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PASTEL_COLORS.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 48, paddingBottom: 40 },
  greeting: { fontSize: 18, color: PASTEL_COLORS.textLight, marginBottom: 12 },
  title: {
    fontSize: 24, fontWeight: '700', color: PASTEL_COLORS.text,
    textAlign: 'center', lineHeight: 34, marginBottom: 40,
  },
  egg: { fontSize: 96, marginBottom: 16 },
  hint: { fontSize: 14, color: PASTEL_COLORS.textLight, marginBottom: 40 },
  inputSection: { width: '100%', marginBottom: 24 },
  inputLabel: { fontSize: 16, color: PASTEL_COLORS.text, fontWeight: '600', marginBottom: 10 },
  input: {
    backgroundColor: PASTEL_COLORS.white, borderWidth: 1.5,
    borderColor: PASTEL_COLORS.border, borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 16,
    fontSize: 18, color: PASTEL_COLORS.text,
  },
  button: {
    backgroundColor: PASTEL_COLORS.accent, borderRadius: 20,
    paddingVertical: 18, paddingHorizontal: 48, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text },
  hatchedContainer: {
    flex: 1, backgroundColor: PASTEL_COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  hatchedEmoji: { fontSize: 96, marginBottom: 16 },
  hatchedText: { fontSize: 28, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 8 },
  hatchedSub: { fontSize: 16, color: PASTEL_COLORS.textLight },
});
