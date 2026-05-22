import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../providers/GameProvider';
import CreatureDisplay from '../../components/CreatureDisplay';
import ProgressBar from '../../components/ProgressBar';
import StatGrid from '../../components/StatGrid';
import LevelUpModal from '../../components/LevelUpModal';
import {
  PASTEL_COLORS, STAGE_NAMES, FINAL_TYPE_INFO, STAGE_EXP_THRESHOLDS,
  STAGE_LEVEL_UP_MESSAGES, getDailyQuote,
} from '../../constants';
import { getStageProgress } from '../../engine/growth';
import type { CreatureStage, FinalCreatureType } from '../../types';

export default function HomeScreen() {
  const { state, resetDailyIfNeeded, dismissLevelUp } = useGame();
  const router = useRouter();
  const { creature, player } = state;

  useEffect(() => {
    resetDailyIfNeeded();
  }, []);

  if (!creature || !player) return null;

  const stageName = STAGE_NAMES[creature.stage];
  const progress = getStageProgress(creature.totalExp, creature.stage);
  const nextThreshold =
    creature.stage < 5 ? STAGE_EXP_THRESHOLDS[(creature.stage + 1) as CreatureStage] : null;
  const expToNext = nextThreshold ? nextThreshold - creature.totalExp : 0;
  const finalInfo =
    creature.stage === 5 && creature.currentType
      ? FINAL_TYPE_INFO[creature.currentType as FinalCreatureType]
      : null;

  const bothDone = state.todayMoodDone && state.todayActionDone;
  const dailyQuote = getDailyQuote();
  const levelUpStage =
    state.pendingLevelUp && STAGE_LEVEL_UP_MESSAGES[state.pendingLevelUp]
      ? state.pendingLevelUp
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요,</Text>
            <Text style={styles.playerName}>{player.name}님 👋</Text>
          </View>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>💧 {player.sweatDrops}</Text>
          </View>
        </View>

        {/* ── Creature Card ── */}
        <View style={styles.creatureCard}>
          {/* speech bubble */}
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{dailyQuote}</Text>
            <View style={styles.speechTail} />
          </View>

          <CreatureDisplay
            creature={creature}
            size="large"
            equippedItems={creature.equippedItems}
            shopItems={state.shopItems}
          />

          <Text style={styles.creatureName}>{creature.name}</Text>

          {finalInfo ? (
            <View style={styles.finalBadge}>
              <Text style={styles.finalBadgeText}>{finalInfo.name}</Text>
            </View>
          ) : (
            <Text style={styles.stageLine}>
              Lv.{creature.stage}  {stageName}
            </Text>
          )}

          {creature.stage < 5 && (
            <View style={styles.expSection}>
              <View style={styles.expLabelRow}>
                <Text style={styles.expLabel}>다음 단계까지</Text>
                <Text style={styles.expValue}>{expToNext} EXP 남음</Text>
              </View>
              <ProgressBar progress={progress} color={PASTEL_COLORS.primary} height={10} />
            </View>
          )}

          {creature.stage === 5 && finalInfo && (
            <Text style={styles.finalDesc}>{finalInfo.description}</Text>
          )}
        </View>

        {/* ── Stats ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>능력치</Text>
          <StatGrid stats={creature.stats} />
        </View>

        {/* ── Today's Actions ── */}
        <Text style={styles.sectionHeading}>오늘의 활동</Text>

        <TouchableOpacity
          style={[styles.actionBtn, styles.moodBtn]}
          onPress={() => router.push('/mood')}
          activeOpacity={0.85}
        >
          <View style={styles.actionBtnLeft}>
            <Text style={styles.actionBtnEmoji}>
              {state.todayMoodDone ? '✅' : '💭'}
            </Text>
            <View>
              <Text style={styles.actionBtnTitle}>오늘의 마음 기록하기</Text>
              <Text style={styles.actionBtnSub}>
                {state.todayMoodDone
                  ? '오늘 기록 완료! 다시 기록해도 괜찮아요'
                  : '감정을 기록하면 에너지가 돼요'}
              </Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.questBtn, state.todayActionDone && styles.actionBtnDone]}
          onPress={() => !state.todayActionDone && router.push('/action')}
          activeOpacity={0.85}
        >
          <View style={styles.actionBtnLeft}>
            <Text style={styles.actionBtnEmoji}>
              {state.todayActionDone ? '✅' : '⚡'}
            </Text>
            <View>
              <Text style={styles.actionBtnTitle}>오늘의 작은 행동하기</Text>
              <Text style={styles.actionBtnSub}>
                {state.todayActionDone
                  ? '오늘 행동 완료! 정말 잘했어요'
                  : '작은 행동이 큰 성장이 돼요'}
              </Text>
            </View>
          </View>
          {!state.todayActionDone && <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>

        {/* ── Today's achievement banner ── */}
        {bothDone && (
          <View style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>🌟</Text>
            <View>
              <Text style={styles.achievementTitle}>오늘의 활동 모두 완료!</Text>
              <Text style={styles.achievementSub}>
                {creature.name}가 오늘 하루를 함께 기억할 거예요 💛
              </Text>
            </View>
          </View>
        )}

        {!state.todayMoodDone && !state.todayActionDone && (
          <View style={styles.nudgeCard}>
            <Text style={styles.nudgeText}>
              감정 기록이나 작은 행동 하나로{'\n'}
              {creature.name}에게 에너지를 줄 수 있어요 🌱
            </Text>
          </View>
        )}

      </ScrollView>

      {/* ── Level-up modal ── */}
      <LevelUpModal
        visible={levelUpStage !== null}
        newStage={(levelUpStage ?? 2) as CreatureStage}
        finalType={creature.currentType}
        creatureName={creature.name}
        onDismiss={dismissLevelUp}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PASTEL_COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  greeting: { fontSize: 13, color: PASTEL_COLORS.textLight },
  playerName: { fontSize: 20, fontWeight: '700', color: PASTEL_COLORS.text },
  currencyBadge: {
    backgroundColor: PASTEL_COLORS.secondary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  currencyText: { fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text },

  creatureCard: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 28,
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  speechBubble: {
    backgroundColor: PASTEL_COLORS.background, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 16, position: 'relative',
    borderWidth: 1, borderColor: PASTEL_COLORS.border,
    alignSelf: 'stretch',
  },
  speechText: { fontSize: 13, color: PASTEL_COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  speechTail: {
    position: 'absolute', bottom: -8, alignSelf: 'center',
    width: 12, height: 12,
    backgroundColor: PASTEL_COLORS.background,
    borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: PASTEL_COLORS.border,
    transform: [{ rotate: '45deg' }],
  },

  creatureName: {
    fontSize: 26, fontWeight: '700', color: PASTEL_COLORS.text,
    marginTop: 14, marginBottom: 4,
  },
  stageLine: { fontSize: 14, color: PASTEL_COLORS.textLight, marginBottom: 12 },
  finalBadge: {
    backgroundColor: PASTEL_COLORS.purple, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginBottom: 12,
  },
  finalBadgeText: { fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text },
  finalDesc: {
    fontSize: 13, color: PASTEL_COLORS.textLight,
    textAlign: 'center', lineHeight: 20, marginTop: 4,
  },
  expSection: { width: '100%', marginTop: 8 },
  expLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 6,
  },
  expLabel: { fontSize: 12, color: PASTEL_COLORS.textLight },
  expValue: { fontSize: 12, fontWeight: '700', color: PASTEL_COLORS.text },

  sectionCard: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 24,
    padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 14 },

  sectionHeading: {
    fontSize: 15, fontWeight: '700', color: PASTEL_COLORS.text,
    marginBottom: 10,
  },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  moodBtn:     { backgroundColor: PASTEL_COLORS.purple },
  questBtn:    { backgroundColor: PASTEL_COLORS.orange },
  actionBtnDone: { opacity: 0.7 },
  actionBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  actionBtnEmoji: { fontSize: 30 },
  actionBtnTitle: { fontSize: 15, fontWeight: '700', color: PASTEL_COLORS.text },
  actionBtnSub: { fontSize: 12, color: PASTEL_COLORS.textLight, marginTop: 2, flexShrink: 1 },
  chevron: { fontSize: 22, color: PASTEL_COLORS.textLight, marginLeft: 8 },

  achievementCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: PASTEL_COLORS.green, borderRadius: 20,
    padding: 18, marginTop: 6,
  },
  achievementEmoji: { fontSize: 32 },
  achievementTitle: { fontSize: 15, fontWeight: '700', color: PASTEL_COLORS.text },
  achievementSub: { fontSize: 12, color: PASTEL_COLORS.textLight, marginTop: 3 },

  nudgeCard: {
    backgroundColor: PASTEL_COLORS.yellow, borderRadius: 20,
    padding: 18, alignItems: 'center', marginTop: 6,
  },
  nudgeText: { fontSize: 14, color: PASTEL_COLORS.text, textAlign: 'center', lineHeight: 22 },
});
