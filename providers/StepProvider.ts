// ─────────────────────────────────────────────────────────────────────────────
// StepProvider — 걸음 수 / 활동 데이터 추상 계층
//
// 현재 구현: MockStepProvider (모의 데이터)
// 향후 구현:
//   iOS  → HealthKit  (expo-health-kit 또는 react-native-health)
//   Android → Health Connect (react-native-health-connect)
//
// 교체 방법: createStepProvider() 함수에서 Platform.OS에 따라
//           HealthKitStepProvider 또는 HealthConnectStepProvider를 반환하도록 변경
// ─────────────────────────────────────────────────────────────────────────────

// ── 타입 정의 ──────────────────────────────────────────────────────────────

export type ActivityType = 'walking' | 'running' | 'none';

export interface StepData {
  steps: number;
  activityType: ActivityType;
  date: string; // Date.toDateString() 형식
}

/** 하루 활동 요약 — 걸음 수보다 풍부한 정보 */
export interface ActivitySummary {
  totalSteps: number;
  activityType: ActivityType;
  // TODO: iOS — HKQuantityTypeIdentifierActiveEnergyBurned
  // TODO: Android — Health Connect TotalCaloriesBurnedRecord
  estimatedCalories: number;
  // TODO: iOS — HKWorkoutType 세션 duration 합산
  // TODO: Android — Health Connect ExerciseSessionRecord duration
  activeMinutes: number;
  date: string;
}

export interface StepReward {
  sweatDrops: number;
  /** 러닝 배율 적용 여부 */
  runningBonus: boolean;
  /** cap에 의해 잘렸는지 여부 */
  wasCapped: boolean;
  /** 사용자에게 보여줄 설명 문구 */
  label: string;
  /** 달성한 마일스톤 (0 = 미달성) */
  milestone: 0 | 500 | 1000 | 3000 | 5000;
}

// ── 인터페이스 ────────────────────────────────────────────────────────────────

export interface StepProvider {
  /**
   * 오늘 걸음 수를 반환한다.
   *
   * TODO [iOS]:
   *   1. HealthKit 권한 요청 — HKHealthStore.requestAuthorization(toShare:read:)
   *      요청 타입: HKQuantityTypeIdentifierStepCount
   *      → 개인정보 처리방침에 걸음 수 수집 목적 명시 필요
   *   2. HKStatisticsQuery로 오늘 0시~현재까지 합산
   *
   * TODO [Android]:
   *   1. Health Connect 권한 선언 — AndroidManifest.xml에
   *      READ_STEPS 퍼미션 추가
   *      → 개인정보 처리방침에 걸음 수 수집 목적 명시 필요
   *   2. HealthConnectClient.readRecords(StepsRecord, timeRange) 호출
   */
  getTodaySteps(): Promise<StepData>;

  /**
   * 하루 활동 요약을 반환한다.
   *
   * TODO [iOS]:
   *   HKWorkoutType 쿼리로 오늘 세션 목록 가져와
   *   running / walking 구분 후 ActivitySummary 생성
   *
   * TODO [Android]:
   *   Health Connect ExerciseSessionRecord 조회 후
   *   EXERCISE_TYPE_RUNNING / WALKING 구분
   */
  getTodayActivitySummary(): Promise<ActivitySummary>;

  /**
   * 활동 요약을 보상으로 변환한다. (순수 함수 — 플랫폼 무관)
   * GameProvider의 CLAIM_STEP_REWARD 액션에 sweatDrops를 넘길 때 사용.
   */
  calculateStepReward(summary: ActivitySummary): StepReward;
}

// ── 보상 계산 상수 ────────────────────────────────────────────────────────────

export const STEP_MILESTONES = [500, 1000, 3000, 5000] as const;
export type StepMilestone = (typeof STEP_MILESTONES)[number];

const MILESTONE_REWARDS: Record<StepMilestone, number> = {
  500:  5,
  1000: 10,
  3000: 25,
  5000: 40,
};

/** 하루 걸음 보상 상한 (러닝 2배 포함 최대치) */
export const MAX_DAILY_STEP_REWARD = 80;

/** 러닝 보상 배율 */
export const RUNNING_MULTIPLIER = 2;

// ── 순수 보상 계산 함수 ────────────────────────────────────────────────────────

export function calculateStepReward(summary: ActivitySummary): StepReward {
  const { totalSteps, activityType } = summary;

  let base = 0;
  let milestone: StepReward['milestone'] = 0;

  for (const ms of [...STEP_MILESTONES].reverse()) {
    if (totalSteps >= ms) {
      base = MILESTONE_REWARDS[ms];
      milestone = ms;
      break;
    }
  }

  const runningBonus = activityType === 'running';
  const multiplier = runningBonus ? RUNNING_MULTIPLIER : 1;
  const raw = base * multiplier;
  const capped = Math.min(raw, MAX_DAILY_STEP_REWARD);
  const wasCapped = raw > MAX_DAILY_STEP_REWARD;

  const label = buildRewardLabel(totalSteps, capped, runningBonus, milestone);

  return { sweatDrops: capped, runningBonus, wasCapped, label, milestone };
}

function buildRewardLabel(
  steps: number,
  drops: number,
  runningBonus: boolean,
  milestone: StepReward['milestone'],
): string {
  if (milestone === 0) {
    return '오늘은 쉬어가는 날이어도 괜찮아요 🌸';
  }
  const stepStr = steps.toLocaleString('ko-KR');
  const runStr = runningBonus ? ' (러닝 보너스 ×2)' : '';
  return `${stepStr}보 달성! 땀방울 ${drops}개${runStr}`;
}

// ── Mock 시나리오 ─────────────────────────────────────────────────────────────

export interface MockScenario {
  id: string;
  label: string;
  emoji: string;
  summary: ActivitySummary;
}

export const MOCK_SCENARIOS: MockScenario[] = [
  {
    id: 'rest',
    label: '쉬는 날',
    emoji: '🛋️',
    summary: {
      totalSteps: 120,
      activityType: 'none',
      estimatedCalories: 50,
      activeMinutes: 0,
      date: new Date().toDateString(),
    },
  },
  {
    id: 'light_walk',
    label: '가벼운 산책',
    emoji: '🚶',
    summary: {
      totalSteps: 620,
      activityType: 'walking',
      estimatedCalories: 150,
      activeMinutes: 12,
      date: new Date().toDateString(),
    },
  },
  {
    id: 'normal_day',
    label: '평범한 하루',
    emoji: '🏙️',
    summary: {
      totalSteps: 1350,
      activityType: 'walking',
      estimatedCalories: 280,
      activeMinutes: 25,
      date: new Date().toDateString(),
    },
  },
  {
    id: 'active_day',
    label: '활발한 하루',
    emoji: '🌟',
    summary: {
      totalSteps: 4200,
      activityType: 'walking',
      estimatedCalories: 520,
      activeMinutes: 65,
      date: new Date().toDateString(),
    },
  },
  {
    id: 'running',
    label: '러닝 하루',
    emoji: '🏃',
    summary: {
      totalSteps: 3100,
      activityType: 'running',
      estimatedCalories: 680,
      activeMinutes: 35,
      date: new Date().toDateString(),
    },
  },
];

// ── MockStepProvider ─────────────────────────────────────────────────────────

/**
 * 목 데이터 기반 StepProvider.
 *
 * TODO: 실제 연동 시 이 클래스를 HealthKitStepProvider / HealthConnectStepProvider로 교체.
 *       createStepProvider() 팩토리 함수만 수정하면 됨.
 *
 * TODO [개인정보]:
 *   실제 연동 전 개인정보 처리방침에 다음 항목 추가 필요:
 *   - 수집 항목: 걸음 수, 활동 유형
 *   - 수집 목적: 게임 내 보상 계산
 *   - 보관 기간: 앱 삭제 시 즉시 삭제 (기기 로컬만 사용)
 *   - 제3자 제공: 없음
 */
export class MockStepProvider implements StepProvider {
  private scenarioId: string;

  constructor(scenarioId: string = 'normal_day') {
    this.scenarioId = scenarioId;
  }

  setScenario(id: string) {
    this.scenarioId = id;
  }

  async getTodaySteps(): Promise<StepData> {
    const summary = await this.getTodayActivitySummary();
    return {
      steps: summary.totalSteps,
      activityType: summary.activityType,
      date: summary.date,
    };
  }

  async getTodayActivitySummary(): Promise<ActivitySummary> {
    // Simulate async (real SDK calls are async)
    await new Promise((r) => setTimeout(r, 300));
    const scenario = MOCK_SCENARIOS.find((s) => s.id === this.scenarioId)
      ?? MOCK_SCENARIOS[2]; // default: 평범한 하루
    return { ...scenario.summary, date: new Date().toDateString() };
  }

  calculateStepReward(summary: ActivitySummary): StepReward {
    return calculateStepReward(summary);
  }
}

// ── 팩토리 ────────────────────────────────────────────────────────────────────

/**
 * 플랫폼에 맞는 StepProvider를 반환한다.
 *
 * TODO [iOS]:
 *   import { Platform } from 'react-native';
 *   if (Platform.OS === 'ios') return new HealthKitStepProvider();
 *
 * TODO [Android]:
 *   if (Platform.OS === 'android') return new HealthConnectStepProvider();
 *
 * TODO [권한]:
 *   실제 provider는 init() 메서드에서 권한 요청 후 사용해야 함.
 *   권한 거부 시 MockStepProvider로 graceful fallback.
 */
export function createStepProvider(): StepProvider {
  return new MockStepProvider();
}

export const defaultStepProvider = createStepProvider() as MockStepProvider;
