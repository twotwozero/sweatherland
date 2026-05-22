// ─────────────────────────────────────────────────────────────────────────────
// StepProvider — 걸음 수 / 활동 데이터 추상 계층
//
// iOS + EAS Build → HealthKitStepProvider (react-native-health)
// Android / Expo Go → MockStepProvider (폴백)
//
// 러닝 판정: 평균 페이스 < 8분/km (7.5km/h 이상)
// 어뷰징 판정: 평균 페이스 < 2분/km (30km/h 이상) → 보상 차단
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';

// ── 타입 정의 ──────────────────────────────────────────────────────────────

export type ActivityType = 'walking' | 'running' | 'abuse' | 'none';

export interface StepData {
  steps: number;
  activityType: ActivityType;
  date: string;
}

export interface ActivitySummary {
  totalSteps: number;
  activityType: ActivityType;
  estimatedCalories: number;
  activeMinutes: number;
  date: string;
  /** 러닝 워크아웃의 평균 페이스 (분/km). running 또는 abuse일 때만 설정됨 */
  averagePaceMinPerKm?: number;
}

export interface StepReward {
  sweatDrops: number;
  runningBonus: boolean;
  wasCapped: boolean;
  /** 어뷰징 감지됨 — 보상 차단 */
  isAbuse: boolean;
  label: string;
  milestone: 0 | 500 | 1000 | 3000 | 5000;
}

// ── StepProvider 인터페이스 ────────────────────────────────────────────────

export interface StepProvider {
  /**
   * 오늘 걸음 수를 반환한다.
   * iOS: HealthKit HKQuantityTypeIdentifierStepCount
   * Android (TODO): Health Connect StepsRecord
   */
  getTodaySteps(): Promise<StepData>;

  /**
   * 하루 활동 요약을 반환한다. 러닝 워크아웃 페이스 포함.
   * iOS: HealthKit Steps + Workout 쿼리
   * Android (TODO): Health Connect ExerciseSessionRecord
   */
  getTodayActivitySummary(): Promise<ActivitySummary>;

  /** 활동 요약을 보상으로 변환한다. (순수 함수) */
  calculateStepReward(summary: ActivitySummary): StepReward;
}

// ── 보상 계산 상수 ─────────────────────────────────────────────────────────

export const STEP_MILESTONES = [500, 1000, 3000, 5000] as const;
export type StepMilestone = (typeof STEP_MILESTONES)[number];

const MILESTONE_REWARDS: Record<StepMilestone, number> = {
  500:  5,
  1000: 10,
  3000: 25,
  5000: 40,
};

export const MAX_DAILY_STEP_REWARD = 80;
export const RUNNING_MULTIPLIER = 2;

/** 이 페이스(분/km) 미만이면 러닝으로 판정 (= 7.5km/h 이상) */
export const RUNNING_PACE_THRESHOLD = 8;

/** 이 페이스(분/km) 미만이면 어뷰징으로 판정 (= 30km/h 이상) */
export const ABUSE_PACE_THRESHOLD = 2;

// ── 순수 보상 계산 함수 ────────────────────────────────────────────────────

export function calculateStepReward(summary: ActivitySummary): StepReward {
  const { totalSteps, activityType } = summary;

  if (activityType === 'abuse') {
    return {
      sweatDrops: 0,
      runningBonus: false,
      wasCapped: false,
      isAbuse: true,
      label: '비정상적인 속도(30km/h 이상)가 감지됐어요. 보상이 차단됐어요.',
      milestone: 0,
    };
  }

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

  return { sweatDrops: capped, runningBonus, wasCapped, isAbuse: false, label, milestone };
}

function buildRewardLabel(
  steps: number,
  drops: number,
  runningBonus: boolean,
  milestone: StepReward['milestone'],
): string {
  if (milestone === 0) return '오늘은 쉬어가는 날이어도 괜찮아요 🌸';
  const stepStr = steps.toLocaleString('ko-KR');
  const runStr = runningBonus ? ' (러닝 보너스 ×2)' : '';
  return `${stepStr}보 달성! 땀방울 ${drops}개${runStr}`;
}

// ── HealthKit 조건부 임포트 ───────────────────────────────────────────────
//
// react-native-health는 iOS 네이티브 모듈로,
// EAS Build(커스텀 네이티브 빌드) 없이는 사용 불가.
// Expo Go / Android에서는 require가 실패하므로 try-catch로 폴백.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AppleHealthKit: any = null;
try {
  if (Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AppleHealthKit = require('react-native-health').default;
  }
} catch {
  // Expo Go 또는 Android — MockStepProvider로 폴백
}

const HEALTHKIT_PERMISSIONS = {
  permissions: {
    read: ['Steps', 'Workout', 'DistanceWalkingRunning'],
    write: [] as string[],
  },
};

interface WorkoutSample {
  activityName: string;
  duration: number;  // seconds
  distance: number;  // meters
  calories: number;
}

function buildActivitySummary(steps: number, workouts: WorkoutSample[]): ActivitySummary {
  let activityType: ActivityType = steps > 0 ? 'walking' : 'none';
  let averagePaceMinPerKm: number | undefined;
  let totalCalories = 0;
  let totalActiveSeconds = 0;

  for (const w of workouts) {
    totalCalories += w.calories ?? 0;
    totalActiveSeconds += w.duration ?? 0;

    const isRunning =
      typeof w.activityName === 'string' &&
      w.activityName.toLowerCase().includes('run');

    if (isRunning) {
      if (w.distance > 10 && w.duration > 0) {
        // 페이스(분/km) = (초/60) / (미터/1000)
        const pace = (w.duration / 60) / (w.distance / 1000);

        if (pace < ABUSE_PACE_THRESHOLD) {
          activityType = 'abuse';
          averagePaceMinPerKm = pace;
          break;
        }
        // 여기까지 오면 pace >= ABUSE_PACE_THRESHOLD 이므로 abuse 아님
        if (pace < RUNNING_PACE_THRESHOLD) {
          activityType = 'running';
          averagePaceMinPerKm = pace;
        }
      } else {
        // 거리 정보 없음 (실내 러닝 등) → 러닝 분류
        activityType = 'running';
      }
    }
  }

  return {
    totalSteps: steps,
    activityType,
    estimatedCalories: Math.round(totalCalories),
    activeMinutes: Math.round(totalActiveSeconds / 60),
    date: new Date().toDateString(),
    averagePaceMinPerKm,
  };
}

// ── HealthKitStepProvider ─────────────────────────────────────────────────

/**
 * iOS HealthKit 기반 StepProvider.
 * EAS Build로 빌드된 앱에서만 동작합니다.
 *
 * 권한 요청: Steps, Workout, DistanceWalkingRunning (읽기 전용)
 *
 * 개인정보 처리방침 필수 고지:
 *   - 수집 항목: 걸음 수, 운동 유형, 운동 거리
 *   - 수집 목적: 게임 내 보상 계산 (기기 내 처리, 서버 전송 없음)
 *   - 보관 기간: 앱 삭제 시 즉시 삭제
 *
 * TODO [Android]: HealthConnectStepProvider 별도 구현 후 createStepProvider()에 추가
 */
export class HealthKitStepProvider implements StepProvider {
  private ready = false;
  private initPromise: Promise<void> | null = null;

  private ensureInit(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (this.initPromise) return this.initPromise;
    this.initPromise = new Promise<void>((resolve) => {
      AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (err: string) => {
        if (!err) this.ready = true;
        resolve();
      });
    });
    return this.initPromise;
  }

  async getTodaySteps(): Promise<StepData> {
    const summary = await this.getTodayActivitySummary();
    return { steps: summary.totalSteps, activityType: summary.activityType, date: summary.date };
  }

  async getTodayActivitySummary(): Promise<ActivitySummary> {
    await this.ensureInit();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    const [steps, workouts] = await Promise.all([
      this.fetchSteps(start, now),
      this.fetchWorkouts(start, now),
    ]);
    return buildActivitySummary(steps, workouts);
  }

  calculateStepReward(summary: ActivitySummary): StepReward {
    return calculateStepReward(summary);
  }

  private fetchSteps(start: Date, end: Date): Promise<number> {
    return new Promise((resolve) => {
      if (!this.ready) { resolve(0); return; }
      AppleHealthKit.getStepCount(
        { startDate: start.toISOString(), endDate: end.toISOString() },
        (err: string, result: { value: number }) => resolve(err ? 0 : (result?.value ?? 0)),
      );
    });
  }

  private fetchWorkouts(start: Date, end: Date): Promise<WorkoutSample[]> {
    return new Promise((resolve) => {
      if (!this.ready) { resolve([]); return; }
      AppleHealthKit.getSamples(
        {
          type: 'Workout',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          limit: 50,
        },
        (err: string, results: WorkoutSample[]) => resolve(err ? [] : (results ?? [])),
      );
    });
  }
}

// ── Mock 시나리오 ─────────────────────────────────────────────────────────

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
      totalSteps: 120, activityType: 'none',
      estimatedCalories: 50, activeMinutes: 0, date: new Date().toDateString(),
    },
  },
  {
    id: 'light_walk',
    label: '가벼운 산책',
    emoji: '🚶',
    summary: {
      totalSteps: 620, activityType: 'walking',
      estimatedCalories: 150, activeMinutes: 12, date: new Date().toDateString(),
    },
  },
  {
    id: 'normal_day',
    label: '평범한 하루',
    emoji: '🏙️',
    summary: {
      totalSteps: 1350, activityType: 'walking',
      estimatedCalories: 280, activeMinutes: 25, date: new Date().toDateString(),
    },
  },
  {
    id: 'active_day',
    label: '활발한 하루',
    emoji: '🌟',
    summary: {
      totalSteps: 4200, activityType: 'walking',
      estimatedCalories: 520, activeMinutes: 65, date: new Date().toDateString(),
    },
  },
  {
    id: 'running',
    label: '러닝 하루',
    emoji: '🏃',
    summary: {
      totalSteps: 3100, activityType: 'running',
      estimatedCalories: 680, activeMinutes: 35, date: new Date().toDateString(),
      averagePaceMinPerKm: 5.5,
    },
  },
  {
    id: 'abuse',
    label: '어뷰징 테스트',
    emoji: '⚠️',
    summary: {
      totalSteps: 8000, activityType: 'abuse',
      estimatedCalories: 900, activeMinutes: 20, date: new Date().toDateString(),
      averagePaceMinPerKm: 1.2,
    },
  },
];

// ── MockStepProvider ──────────────────────────────────────────────────────

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
    return { steps: summary.totalSteps, activityType: summary.activityType, date: summary.date };
  }

  async getTodayActivitySummary(): Promise<ActivitySummary> {
    await new Promise((r) => setTimeout(r, 300));
    const scenario = MOCK_SCENARIOS.find((s) => s.id === this.scenarioId) ?? MOCK_SCENARIOS[2];
    return { ...scenario.summary, date: new Date().toDateString() };
  }

  calculateStepReward(summary: ActivitySummary): StepReward {
    return calculateStepReward(summary);
  }
}

// ── 팩토리 ───────────────────────────────────────────────────────────────

/**
 * 플랫폼에 맞는 StepProvider를 반환한다.
 *
 * iOS + EAS Build: HealthKitStepProvider (실제 HealthKit 데이터)
 * iOS + Expo Go:   MockStepProvider (AppleHealthKit 모듈 없음)
 * Android:         MockStepProvider (TODO: HealthConnectStepProvider)
 */
export function createStepProvider(): StepProvider {
  if (Platform.OS === 'ios' && AppleHealthKit !== null) {
    return new HealthKitStepProvider();
  }
  return new MockStepProvider();
}

export const defaultStepProvider = createStepProvider();

/** activity 화면에서 mock 시나리오 섹션 표시 여부 결정에 사용 */
export const isMockMode = 'setScenario' in defaultStepProvider;
