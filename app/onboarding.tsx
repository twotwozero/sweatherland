import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../providers/GameProvider';
import { PASTEL_COLORS } from '../constants';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const { createPlayer } = useGame();
  const router = useRouter();

  function handleNext() {
    const trimmed = name.trim();
    if (!trimmed) return;
    createPlayer(trimmed);
    router.replace('/egg');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.bigEmoji}>🌱</Text>
          <Text style={styles.title}>스웨더랜드에{'\n'}오신 걸 환영합니다</Text>
          <Text style={styles.subtitle}>
            오늘의 마음과 작은 행동으로{'\n'}나만의 마음 생명체를 키워보세요
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>당신의 이름은 무엇인가요?</Text>
            <TextInput
              style={styles.input}
              placeholder="이름을 입력해주세요"
              placeholderTextColor={PASTEL_COLORS.textLight}
              value={name}
              onChangeText={setName}
              maxLength={12}
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!name.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>시작하기 →</Text>
          </TouchableOpacity>

          <Text style={styles.safeNote}>
            스웨더랜드는 마음을 기록하고 작은 행동을 돕는 게임입니다.{'\n'}
            의학적 진단이나 치료를 제공하지 않아요.{'\n'}
            위기 상황이거나 즉각적인 도움이 필요하다면 주변 사람이나 전문가에게 도움을 요청해 주세요.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PASTEL_COLORS.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40 },
  bigEmoji: { fontSize: 72, marginBottom: 16 },
  title: {
    fontSize: 28, fontWeight: '700', color: PASTEL_COLORS.text,
    textAlign: 'center', lineHeight: 38, marginBottom: 12,
  },
  subtitle: {
    fontSize: 16, color: PASTEL_COLORS.textLight,
    textAlign: 'center', lineHeight: 24, marginBottom: 48,
  },
  inputSection: { width: '100%', marginBottom: 24 },
  inputLabel: { fontSize: 16, color: PASTEL_COLORS.text, fontWeight: '600', marginBottom: 10 },
  input: {
    backgroundColor: PASTEL_COLORS.white, borderWidth: 1.5,
    borderColor: PASTEL_COLORS.border, borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 16,
    fontSize: 18, color: PASTEL_COLORS.text,
  },
  button: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 20,
    paddingVertical: 18, paddingHorizontal: 48,
    alignItems: 'center', marginBottom: 40,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text },
  safeNote: {
    fontSize: 11, color: PASTEL_COLORS.textLight,
    textAlign: 'center', lineHeight: 18, paddingHorizontal: 8,
  },
});
