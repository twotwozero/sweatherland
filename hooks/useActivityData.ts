import { useState, useCallback } from 'react';
import type { ActivitySummary, StepReward } from '../providers/StepProvider';
import { defaultStepProvider, MOCK_SCENARIOS } from '../providers/StepProvider';

export interface ActivityState {
  summary: ActivitySummary | null;
  reward: StepReward | null;
  loading: boolean;
  error: string | null;
}

export interface UseActivityDataReturn extends ActivityState {
  refresh: () => Promise<void>;
  /** mock 전용 — 시나리오 변경 후 자동 갱신 */
  switchScenario: (scenarioId: string) => Promise<void>;
  currentScenarioId: string;
}

export function useActivityData(): UseActivityDataReturn {
  const [data, setData] = useState<ActivityState>({
    summary: null,
    reward: null,
    loading: false,
    error: null,
  });
  const [currentScenarioId, setCurrentScenarioId] = useState('normal_day');

  const refresh = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const summary = await defaultStepProvider.getTodayActivitySummary();
      const reward = defaultStepProvider.calculateStepReward(summary);
      setData({ summary, reward, loading: false, error: null });
    } catch (e) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: '활동 데이터를 불러오지 못했어요',
      }));
    }
  }, []);

  const switchScenario = useCallback(async (scenarioId: string) => {
    setCurrentScenarioId(scenarioId);
    // MockStepProvider는 setScenario()를 가지고 있음
    // 실제 HealthKit provider로 교체 시 이 함수는 no-op이 됨
    if ('setScenario' in defaultStepProvider) {
      (defaultStepProvider as any).setScenario(scenarioId);
    }
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const summary = await defaultStepProvider.getTodayActivitySummary();
      const reward = defaultStepProvider.calculateStepReward(summary);
      setData({ summary, reward, loading: false, error: null });
    } catch {
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return { ...data, refresh, switchScenario, currentScenarioId };
}
