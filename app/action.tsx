import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../providers/GameProvider';
import CreatureDisplay from '../components/CreatureDisplay';
import { PASTEL_COLORS, ACTION_MAP, STAT_LABELS } from '../constants';
import type { ActionType } from '../types';

const ACTION_KEYS: ActionType[] = [
  'walk5min', 'drinkWater', 'makeBed', 'getSunlight', 'textFriend',
  'listenSong', 'writeDiary', 'shower', 'walk10min', 'throwTrash',
];

type Step = 'select' | 'done';

export default function ActionScreen() {
  const { state, completeAction } = useGame();
  const router = useRouter();
  const [selected, setSelected] = useState<ActionType | null>(null);
  const [step, setStep] = useState<Step>('select');

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const congScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (step === 'done') {
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(congScale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
      ]).start(() => {
        Animated.spring(badgeScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
      });
    }
  }, [step]);

  // Already done today
  if (state.todayActionDone && step !== 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.alreadyDoneContainer}>
          <Text style={styles.alreadyEmoji}>✅</Text>
          <Text style={styles.alreadyTitle}>오늘 행동 완료!</Text>
          <Text style={styles.alreadySub}>
            오늘의 작은 행동을 이미 완료했어요.{'\n'}
            {state.creature?.name}가 함께 기뻐하고 있어요 💛
          </Text>
          {state.creature && (
            <View style={styles.alreadyCreatureBox}>
              <CreatureDisplay creature={state.creature} size="medium" />
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.backBtnText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function handleComplete() {
    if (!selected) return;
    completeAction(selected);
    fadeIn.setValue(0);
    slideUp.setValue(24);
    badgeScale.setValue(0);
    congScale.setValue(0.5);
    setStep('done');
  }

  // ── Done / Celebration screen ──
  if (step === 'done' && selected && state.creature) {
    const info = ACTION_MAP[selected];
    const stat = STAT_LABELS[info.statAffected];
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.doneScroll}
          style={{ opacity: fadeIn }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.Text style={[styles.congEmoji, { transform: [{ scale: congScale }] }]}>
            🎉
          </Animated.Text>
          <Text style={styles.congTitle}>작은 행동 성공!</Text>

          <CreatureDisplay creature={state.creature} size="large" />

          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              "{info.label}"을 해냈구나!{'\n'}
              나도 같이 기뻐 {stat.emoji}
            </Text>
          </View>

          <Animated.View style={[styles.rewardsContainer, { transform: [{ scale: badgeScale }] }]}>
            <View style={[styles.rewardItem, { backgroundColor: PASTEL_COLORS.yellow }]}>
              <Text style={styles.rewardEmoji}>⚡</Text>
              <Text style={styles.rewardValue}>+{info.expGained}</Text>
              <Text style={styles.rewardLabel}>경험치</Text>
            </View>
            <View style={[styles.rewardItem, { backgroundColor: PASTEL_COLORS.secondary }]}>
              <Text style={styles.rewardEmoji}>💧</Text>
              <Text style={styles.rewardValue}>+{info.sweatGained}</Text>
              <Text style={styles.rewardLabel}>땀방울</Text>
            </View>
            <View style={[styles.rewardItem, { backgroundColor: PASTEL_COLORS.green }]}>
              <Text style={styles.rewardEmoji}>{stat.emoji}</Text>
              <Text style={styles.rewardValue}>+3</Text>
              <Text style={styles.rewardLabel}>{stat.label}</Text>
            </View>
          </Animated.View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
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
          <Text style={styles.title}>오늘의 작은 행동</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.question}>할 수 있는 행동을{'\n'}하나만 골라볼래요?</Text>
        <Text style={styles.hint}>작게 해도 괜찮아요. 하나면 충분해요 💛</Text>

        <View style={styles.cardGrid}>
          {ACTION_KEYS.map((action) => {
            const info = ACTION_MAP[action];
            const isSelected = selected === action;
            const stat = STAT_LABELS[info.statAffected];
            return (
              <TouchableOpacity
                key={action}
                style={[styles.actionCard, isSelected && styles.actionCardSelected]}
                onPress={() => setSelected(action)}
                activeOpacity={0.8}
              >
                <View style={styles.actionCardTop}>
                  <Text style={styles.actionCardEmoji}>{info.emoji}</Text>
                  {isSelected && (
                    <View style={styles.selectedCheck}>
                      <Text style={styles.selectedCheckText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.actionCardLabel, isSelected && styles.actionCardLabelSelected]}>
                  {info.label}
                </Text>
                <Text style={styles.actionCardDesc} numberOfLines={2}>
                  {info.description}
                </Text>
                {isSelected && (
                  <View style={styles.actionCardMeta}>
                    <Text style={styles.actionCardMetaText}>{stat.emoji} {stat.label} ↑</Text>
                    <Text style={styles.actionCardMetaText}>⚡+{info.expGained}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, !selected && styles.confirmDisabled]}
          onPress={handleComplete}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmText}>
            {selected ? `"${ACTION_MAP[selected].label}" 완료하기` : '행동을 골라보세요'}
          </Text>
        </TouchableOpacity>
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

  question: {
    fontSize: 22, fontWeight: '700', color: PASTEL_COLORS.text,
    textAlign: 'center', lineHeight: 32, marginBottom: 6,
  },
  hint: { fontSize: 14, color: PASTEL_COLORS.textLight, textAlign: 'center', marginBottom: 24 },

  cardGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  actionCard: {
    width: '47%', backgroundColor: PASTEL_COLORS.white, borderRadius: 18,
    padding: 14,
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  actionCardSelected: {
    backgroundColor: PASTEL_COLORS.orange, borderColor: '#FFB085',
  },
  actionCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  actionCardEmoji: { fontSize: 28 },
  selectedCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: PASTEL_COLORS.text, alignItems: 'center', justifyContent: 'center',
  },
  selectedCheckText: { fontSize: 12, color: PASTEL_COLORS.white, fontWeight: '700' },
  actionCardLabel: {
    fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 4,
  },
  actionCardLabelSelected: { color: PASTEL_COLORS.text },
  actionCardDesc: { fontSize: 11, color: PASTEL_COLORS.textLight, lineHeight: 16 },
  actionCardMeta: {
    flexDirection: 'row', gap: 6, marginTop: 8,
    flexWrap: 'wrap',
  },
  actionCardMetaText: {
    fontSize: 11, fontWeight: '700', color: PASTEL_COLORS.text,
    backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },

  confirmBtn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 20,
    paddingVertical: 18, alignItems: 'center',
  },
  confirmDisabled: { opacity: 0.35 },
  confirmText: { fontSize: 17, fontWeight: '700', color: PASTEL_COLORS.text },

  // already done screen
  alreadyDoneContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  alreadyEmoji: { fontSize: 64, marginBottom: 12 },
  alreadyTitle: { fontSize: 26, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 10 },
  alreadySub: {
    fontSize: 15, color: PASTEL_COLORS.textLight, textAlign: 'center', lineHeight: 24, marginBottom: 24,
  },
  alreadyCreatureBox: { marginBottom: 32 },
  backBtn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 20,
    paddingVertical: 18, paddingHorizontal: 48,
  },
  backBtnText: { fontSize: 17, fontWeight: '700', color: PASTEL_COLORS.text },

  // done / celebration screen
  doneScroll: { paddingHorizontal: 28, paddingTop: 48, paddingBottom: 40, alignItems: 'center' },
  congEmoji: { fontSize: 64, marginBottom: 8 },
  congTitle: { fontSize: 28, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 24 },
  speechBubble: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 20, padding: 20,
    marginTop: 16, marginBottom: 24, alignSelf: 'stretch',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  speechText: { fontSize: 16, color: PASTEL_COLORS.text, textAlign: 'center', lineHeight: 26 },
  rewardsContainer: {
    flexDirection: 'row', gap: 10, marginBottom: 32,
  },
  rewardItem: {
    flex: 1, alignItems: 'center', borderRadius: 16, paddingVertical: 16,
  },
  rewardEmoji: { fontSize: 24, marginBottom: 4 },
  rewardValue: { fontSize: 20, fontWeight: '700', color: PASTEL_COLORS.text },
  rewardLabel: { fontSize: 11, color: PASTEL_COLORS.textLight, marginTop: 2 },
  doneBtn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 20,
    paddingVertical: 18, paddingHorizontal: 48,
  },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: PASTEL_COLORS.text },
});
