import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../providers/GameProvider';
import CreatureDisplay from '../components/CreatureDisplay';
import { PASTEL_COLORS, MOOD_MAP, getRandomMoodResponse, EXP_PER_MOOD } from '../constants';
import type { MoodType } from '../types';

const MOOD_KEYS: MoodType[] = [
  'joy', 'calm', 'tired', 'anxious', 'sad',
  'frustrated', 'lonely', 'proud', 'lethargic', 'excited',
];

type Step = 'select' | 'response';

export default function MoodScreen() {
  const { state, logMood } = useGame();
  const router = useRouter();
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [step, setStep] = useState<Step>('select');
  const [responseText, setResponseText] = useState('');

  // entry animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  // reward badge pop
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [step]);

  function handleConfirm() {
    if (!selected) return;
    const response = getRandomMoodResponse(selected);
    setResponseText(response);
    logMood(selected);
    fadeIn.setValue(0);
    slideUp.setValue(20);
    setStep('response');
    Animated.spring(badgeScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  }

  // ── Response screen ──
  if (step === 'response' && selected && state.creature) {
    const info = MOOD_MAP[selected];
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.responseContainer, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          <CreatureDisplay creature={state.creature} size="large" />

          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{responseText}</Text>
          </View>

          <Animated.View style={[styles.energyRow, { transform: [{ scale: badgeScale }] }]}>
            <View style={styles.energyBadge}>
              <Text style={styles.energyEmoji}>{info.emoji}</Text>
              <Text style={styles.energyText}>{info.energyLabel} 획득!</Text>
            </View>
            <View style={styles.expBadge}>
              <Text style={styles.expText}>경험치 +{EXP_PER_MOOD}</Text>
            </View>
          </Animated.View>

          {state.todayMoodDone && (
            <Text style={styles.alreadyNote}>
              오늘 마음을 기록해줘서 고마워요 💛
            </Text>
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>홈으로 돌아가기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reRecordBtn}
            onPress={() => {
              setSelected(null);
              fadeIn.setValue(0);
              slideUp.setValue(20);
              badgeScale.setValue(0);
              setStep('select');
            }}
          >
            <Text style={styles.reRecordText}>다른 감정도 기록할게요</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Selection screen ──
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>오늘의 마음</Text>
          <View style={{ width: 40 }} />
        </View>

        {state.todayMoodDone && (
          <View style={styles.alreadyBanner}>
            <Text style={styles.alreadyBannerText}>
              ✅ 오늘 이미 기록했어요. 한 번 더 기록해도 괜찮아요.
            </Text>
          </View>
        )}

        <Text style={styles.question}>오늘 마음은 어땠나요?</Text>
        <Text style={styles.hint}>어떤 감정이든 정답이에요. 솔직하게 골라보세요</Text>

        <View style={styles.moodGrid}>
          {MOOD_KEYS.map((mood) => {
            const { label, emoji } = MOOD_MAP[mood];
            const isSelected = selected === mood;
            return (
              <TouchableOpacity
                key={mood}
                style={[styles.moodCard, isSelected && styles.moodCardSelected]}
                onPress={() => setSelected(mood)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected && (
          <View style={styles.selectedPreview}>
            <Text style={styles.selectedPreviewEmoji}>{MOOD_MAP[selected].emoji}</Text>
            <View>
              <Text style={styles.selectedPreviewLabel}>선택한 감정</Text>
              <Text style={styles.selectedPreviewMood}>{MOOD_MAP[selected].label}</Text>
              <Text style={styles.selectedPreviewEnergy}>{MOOD_MAP[selected].energyLabel} 획득 예정</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmBtn, !selected && styles.confirmDisabled]}
          onPress={handleConfirm}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmText}>
            {selected ? `"${MOOD_MAP[selected].label}" 기록하기` : '감정을 골라보세요'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          어떤 감정이든 {state.creature?.name ?? '마음알'}의 에너지가 돼요 💛
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PASTEL_COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 20, color: PASTEL_COLORS.textLight },
  title: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text },

  alreadyBanner: {
    backgroundColor: PASTEL_COLORS.green, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16,
  },
  alreadyBannerText: { fontSize: 13, color: PASTEL_COLORS.text, textAlign: 'center' },

  question: {
    fontSize: 22, fontWeight: '700', color: PASTEL_COLORS.text,
    textAlign: 'center', marginBottom: 6,
  },
  hint: { fontSize: 14, color: PASTEL_COLORS.textLight, textAlign: 'center', marginBottom: 24 },

  moodGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 10, marginBottom: 20,
  },
  moodCard: {
    width: '18%', alignItems: 'center', paddingVertical: 12,
    backgroundColor: PASTEL_COLORS.white, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  moodCardSelected: {
    backgroundColor: PASTEL_COLORS.purple, borderColor: '#C9A8F5',
  },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 11, color: PASTEL_COLORS.textLight, marginTop: 6, fontWeight: '600' },
  moodLabelSelected: { color: PASTEL_COLORS.text },

  selectedPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: PASTEL_COLORS.white, borderRadius: 18,
    padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: PASTEL_COLORS.primary,
  },
  selectedPreviewEmoji: { fontSize: 36 },
  selectedPreviewLabel: { fontSize: 11, color: PASTEL_COLORS.textLight },
  selectedPreviewMood: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text },
  selectedPreviewEnergy: { fontSize: 12, color: PASTEL_COLORS.primary, fontWeight: '600', marginTop: 2 },

  confirmBtn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 20,
    paddingVertical: 18, alignItems: 'center', marginBottom: 16,
  },
  confirmDisabled: { opacity: 0.35 },
  confirmText: { fontSize: 17, fontWeight: '700', color: PASTEL_COLORS.text },
  footerNote: { fontSize: 13, color: PASTEL_COLORS.textLight, textAlign: 'center' },

  // response screen
  responseContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  speechBubble: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 20,
    padding: 20, marginTop: 20, marginBottom: 20, alignSelf: 'stretch',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  speechText: {
    fontSize: 16, color: PASTEL_COLORS.text,
    textAlign: 'center', lineHeight: 26,
  },
  energyRow: {
    flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'center',
  },
  energyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PASTEL_COLORS.secondary, borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  energyEmoji: { fontSize: 22 },
  energyText: { fontSize: 15, fontWeight: '700', color: PASTEL_COLORS.text },
  expBadge: {
    backgroundColor: PASTEL_COLORS.green, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  expText: { fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text },
  alreadyNote: {
    fontSize: 13, color: PASTEL_COLORS.textLight, marginBottom: 8,
  },
  doneBtn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 20,
    paddingVertical: 18, paddingHorizontal: 48, marginBottom: 12, marginTop: 16,
  },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: PASTEL_COLORS.text },
  reRecordBtn: { paddingVertical: 10 },
  reRecordText: { fontSize: 14, color: PASTEL_COLORS.textLight, textDecorationLine: 'underline' },
});
