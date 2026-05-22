import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../providers/GameProvider';
import { useActivityData } from '../../hooks/useActivityData';
import {
  MOCK_SCENARIOS, STEP_MILESTONES, MAX_DAILY_STEP_REWARD,
} from '../../providers/StepProvider';
import { PASTEL_COLORS } from '../../constants';
import type { ActivityType } from '../../providers/StepProvider';

// ── helpers ──────────────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<ActivityType, { label: string; emoji: string; color: string }> = {
  walking: { label: '걷기',         emoji: '🚶', color: PASTEL_COLORS.green },
  running: { label: '러닝',         emoji: '🏃', color: PASTEL_COLORS.orange },
  none:    { label: '오늘은 휴식',  emoji: '🛋️', color: PASTEL_COLORS.border },
};

function MilestoneDots({ steps }: { steps: number }) {
  return (
    <View style={msStyles.row}>
      {STEP_MILESTONES.map((ms, idx) => {
        const reached = steps >= ms;
        return (
          <React.Fragment key={ms}>
            <View style={[msStyles.dot, reached && msStyles.dotReached]}>
              {reached && <Text style={msStyles.dotCheck}>✓</Text>}
            </View>
            <View style={msStyles.labelCol}>
              <Text style={[msStyles.msLabel, reached && msStyles.msLabelReached]}>
                {ms >= 1000 ? `${ms / 1000}천` : ms}
              </Text>
              <Text style={msStyles.msDrops}>💧{[5, 10, 25, 40][idx]}</Text>
            </View>
            {idx < STEP_MILESTONES.length - 1 && (
              <View style={[msStyles.line, steps >= STEP_MILESTONES[idx + 1] && msStyles.lineReached]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const msStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: PASTEL_COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotReached: { backgroundColor: PASTEL_COLORS.primary },
  dotCheck: { fontSize: 12, fontWeight: '700', color: PASTEL_COLORS.text },
  labelCol: { alignItems: 'center', marginHorizontal: 2 },
  msLabel: { fontSize: 10, color: PASTEL_COLORS.textLight, marginTop: 4 },
  msLabelReached: { color: PASTEL_COLORS.text, fontWeight: '700' },
  msDrops: { fontSize: 9, color: PASTEL_COLORS.textLight },
  line: { flex: 1, height: 3, backgroundColor: PASTEL_COLORS.border, marginBottom: 20 },
  lineReached: { backgroundColor: PASTEL_COLORS.primary },
});

// ── main screen ───────────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const { state, claimStepReward } = useGame();
  const { summary, reward, loading, error, refresh, switchScenario, currentScenarioId } =
    useActivityData();

  const fadeIn = useRef(new Animated.Value(0)).current;
  // start at 1 if already claimed on load; animates from 0 only when claiming in this session
  const claimedScale = useRef(new Animated.Value(state.todayStepRewardClaimed ? 1 : 0)).current;

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!loading && summary) {
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [loading, summary]);

  function handleClaim() {
    if (!reward || reward.sweatDrops === 0 || state.todayStepRewardClaimed) return;
    claimStepReward(reward.sweatDrops);
    Animated.spring(claimedScale, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }).start();
  }

  const alreadyClaimed = state.todayStepRewardClaimed;
  const canClaim = !alreadyClaimed && (reward?.sweatDrops ?? 0) > 0;
  const activityInfo = summary ? ACTIVITY_LABELS[summary.activityType] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Text style={styles.title}>🏃 오늘의 활동</Text>
        <Text style={styles.subtitle}>
          오늘 몸을 움직인 만큼 땀방울을 받을 수 있어요
        </Text>

        {/* ── Loading ── */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={PASTEL_COLORS.primary} />
            <Text style={styles.loadingText}>활동 데이터를 불러오는 중...</Text>
          </View>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
              <Text style={styles.retryBtnText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Main content ── */}
        {summary && reward && !loading && (
          <Animated.View style={{ opacity: fadeIn }}>

            {/* step count card */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                {activityInfo && (
                  <View style={[styles.activityBadge, { backgroundColor: activityInfo.color }]}>
                    <Text style={styles.activityBadgeText}>
                      {activityInfo.emoji} {activityInfo.label}
                    </Text>
                  </View>
                )}
                {summary.activityType === 'running' && (
                  <View style={styles.runningBonusBadge}>
                    <Text style={styles.runningBonusText}>× 2 보너스</Text>
                  </View>
                )}
              </View>

              <Text style={styles.stepNumber}>
                {summary.totalSteps.toLocaleString('ko-KR')}
              </Text>
              <Text style={styles.stepUnit}>걸음</Text>

              {summary.activeMinutes > 0 && (
                <Text style={styles.statsLine}>
                  활동 {summary.activeMinutes}분 · 약 {summary.estimatedCalories}kcal
                </Text>
              )}

              {/* milestones */}
              <View style={styles.milestoneSection}>
                <MilestoneDots steps={summary.totalSteps} />
              </View>
            </View>

            {/* reward card */}
            <View style={styles.rewardCard}>
              <Text style={styles.rewardCardTitle}>오늘의 보상</Text>

              {reward.milestone === 0 ? (
                <View style={styles.noRewardBox}>
                  <Text style={styles.noRewardEmoji}>🌸</Text>
                  <Text style={styles.noRewardText}>
                    오늘은 쉬어가는 날이어도 괜찮아요{'\n'}
                    내일 다시 시도해보세요
                  </Text>
                </View>
              ) : (
                <View style={styles.rewardContent}>
                  <View style={styles.rewardDropsRow}>
                    <Text style={styles.rewardDropsEmoji}>💧</Text>
                    <Text style={styles.rewardDropsValue}>{reward.sweatDrops}</Text>
                    <Text style={styles.rewardDropsUnit}>땀방울</Text>
                  </View>
                  <Text style={styles.rewardLabel}>{reward.label}</Text>
                  {reward.wasCapped && (
                    <Text style={styles.capNote}>
                      (하루 최대 {MAX_DAILY_STEP_REWARD}개 제한 적용)
                    </Text>
                  )}
                </View>
              )}

              {alreadyClaimed ? (
                <Animated.View style={[styles.claimedBox, { transform: [{ scale: claimedScale.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
                  <Text style={styles.claimedEmoji}>✅</Text>
                  <Text style={styles.claimedText}>오늘 보상을 받았어요!</Text>
                  <Text style={styles.claimedSub}>내일 자정에 새로운 보상이 준비돼요</Text>
                </Animated.View>
              ) : (
                <TouchableOpacity
                  style={[styles.claimBtn, !canClaim && styles.claimBtnDisabled]}
                  onPress={handleClaim}
                  disabled={!canClaim}
                  activeOpacity={0.85}
                >
                  <Text style={styles.claimBtnText}>
                    {reward.milestone === 0 ? '아직 보상이 없어요' : '보상 받기 💧'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* safe message */}
            <View style={styles.safeCard}>
              <Text style={styles.safeEmoji}>💛</Text>
              <Text style={styles.safeText}>
                걸음 수가 적어도 걱정하지 마세요.{'\n'}
                오늘 하루를 살아간 것만으로도 충분해요.
              </Text>
            </View>

          </Animated.View>
        )}

        {/* ── Mock scenario switcher ── */}
        {/* TODO: 실제 HealthKit / Health Connect 연동 후 이 섹션 제거 */}
        {!loading && (
          <View style={styles.mockSection}>
            <Text style={styles.mockLabel}>🧪 목 데이터 시나리오 (개발용)</Text>
            <Text style={styles.mockSub}>실제 연동 후 이 섹션은 제거됩니다</Text>
            <View style={styles.scenarioRow}>
              {MOCK_SCENARIOS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.scenarioBtn,
                    currentScenarioId === s.id && styles.scenarioBtnActive,
                  ]}
                  onPress={() => switchScenario(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scenarioBtnEmoji}>{s.emoji}</Text>
                  <Text
                    style={[
                      styles.scenarioBtnLabel,
                      currentScenarioId === s.id && styles.scenarioBtnLabelActive,
                    ]}
                    numberOfLines={2}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Integration guide ── */}
        <View style={styles.integrationCard}>
          <Text style={styles.integrationTitle}>📱 건강 앱 연동 안내</Text>
          <Text style={styles.integrationText}>
            현재는 모의 데이터를 사용하고 있어요.{'\n'}
            향후 업데이트에서 아이폰 건강 앱(HealthKit)과{'\n'}
            안드로이드 Health Connect 연동이 추가될 예정이에요.
            {'\n\n'}
            실제 연동 시 걸음 수 데이터만 사용하며,{'\n'}
            데이터는 기기 내에서만 처리됩니다.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PASTEL_COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  title: { fontSize: 24, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: PASTEL_COLORS.textLight, marginBottom: 20, lineHeight: 20 },

  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, color: PASTEL_COLORS.textLight },

  errorBox: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  errorText: { fontSize: 14, color: PASTEL_COLORS.textLight, textAlign: 'center' },
  retryBtn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text },

  // step card
  stepCard: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 24,
    padding: 24, marginBottom: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  stepHeader: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  activityBadge: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  activityBadgeText: { fontSize: 13, fontWeight: '700', color: PASTEL_COLORS.text },
  runningBonusBadge: {
    backgroundColor: PASTEL_COLORS.accent, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  runningBonusText: { fontSize: 13, fontWeight: '700', color: PASTEL_COLORS.text },
  stepNumber: { fontSize: 64, fontWeight: '700', color: PASTEL_COLORS.text, lineHeight: 72 },
  stepUnit: { fontSize: 18, color: PASTEL_COLORS.textLight, marginBottom: 6 },
  statsLine: { fontSize: 13, color: PASTEL_COLORS.textLight, marginBottom: 16 },
  milestoneSection: { width: '100%', marginTop: 8 },

  // reward card
  rewardCard: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 24,
    padding: 24, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  rewardCardTitle: { fontSize: 16, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 16 },
  noRewardBox: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  noRewardEmoji: { fontSize: 36 },
  noRewardText: { fontSize: 14, color: PASTEL_COLORS.textLight, textAlign: 'center', lineHeight: 22 },
  rewardContent: { alignItems: 'center', marginBottom: 16 },
  rewardDropsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  rewardDropsEmoji: { fontSize: 32 },
  rewardDropsValue: { fontSize: 48, fontWeight: '700', color: PASTEL_COLORS.text },
  rewardDropsUnit: { fontSize: 16, color: PASTEL_COLORS.textLight, alignSelf: 'flex-end', marginBottom: 8 },
  rewardLabel: { fontSize: 14, color: PASTEL_COLORS.textLight, textAlign: 'center' },
  capNote: { fontSize: 11, color: PASTEL_COLORS.textLight, marginTop: 4 },
  claimedBox: {
    backgroundColor: PASTEL_COLORS.green, borderRadius: 16,
    padding: 16, alignItems: 'center', gap: 4,
  },
  claimedEmoji: { fontSize: 28 },
  claimedText: { fontSize: 15, fontWeight: '700', color: PASTEL_COLORS.text },
  claimedSub: { fontSize: 12, color: PASTEL_COLORS.textLight },
  claimBtn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 18,
    paddingVertical: 16, alignItems: 'center',
  },
  claimBtnDisabled: { opacity: 0.4 },
  claimBtnText: { fontSize: 16, fontWeight: '700', color: PASTEL_COLORS.text },

  // safe message
  safeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PASTEL_COLORS.yellow, borderRadius: 18,
    padding: 16, marginBottom: 24,
  },
  safeEmoji: { fontSize: 24 },
  safeText: { flex: 1, fontSize: 13, color: PASTEL_COLORS.text, lineHeight: 20 },

  // mock section
  mockSection: {
    backgroundColor: PASTEL_COLORS.border, borderRadius: 18,
    padding: 16, marginBottom: 16,
  },
  mockLabel: { fontSize: 13, fontWeight: '700', color: PASTEL_COLORS.textLight, marginBottom: 2 },
  mockSub: { fontSize: 11, color: PASTEL_COLORS.textLight, marginBottom: 12 },
  scenarioRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  scenarioBtn: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8,
    backgroundColor: PASTEL_COLORS.white, borderRadius: 12, minWidth: 56,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  scenarioBtnActive: { borderColor: PASTEL_COLORS.primary, backgroundColor: PASTEL_COLORS.background },
  scenarioBtnEmoji: { fontSize: 20, marginBottom: 3 },
  scenarioBtnLabel: { fontSize: 10, color: PASTEL_COLORS.textLight, textAlign: 'center' },
  scenarioBtnLabelActive: { color: PASTEL_COLORS.text, fontWeight: '700' },

  // integration guide
  integrationCard: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 18,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  integrationTitle: { fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 10 },
  integrationText: {
    fontSize: 12, color: PASTEL_COLORS.textLight, lineHeight: 20,
  },
});
