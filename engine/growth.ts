import type { Creature, CreatureStage, FinalCreatureType, Stats } from '../types';
import { STAGE_EXP_THRESHOLDS } from '../constants';

export function getNextStage(totalExp: number): CreatureStage {
  if (totalExp >= STAGE_EXP_THRESHOLDS[5]) return 5;
  if (totalExp >= STAGE_EXP_THRESHOLDS[4]) return 4;
  if (totalExp >= STAGE_EXP_THRESHOLDS[3]) return 3;
  if (totalExp >= STAGE_EXP_THRESHOLDS[2]) return 2;
  return 1;
}

export function getExpToNextStage(totalExp: number, stage: CreatureStage): number {
  if (stage >= 5) return 0;
  return STAGE_EXP_THRESHOLDS[(stage + 1) as CreatureStage] - totalExp;
}

export function getStageProgress(totalExp: number, stage: CreatureStage): number {
  if (stage >= 5) return 1;
  const current = STAGE_EXP_THRESHOLDS[stage];
  const next = STAGE_EXP_THRESHOLDS[(stage + 1) as CreatureStage];
  return Math.min((totalExp - current) / (next - current), 1);
}

export function determineFinalType(stats: Stats): FinalCreatureType {
  const { mind, vitality, care, connection, focus, courage } = stats;
  const total = mind + vitality + care + connection + focus + courage;
  if (total === 0) return 'rainbow_traveler';

  const max = Math.max(mind, vitality, care, connection, focus, courage);
  const avg = total / 6;
  const allBalanced = Object.values(stats).every((v) => v >= avg * 0.7);
  if (allBalanced && total >= 30) return 'rainbow_traveler';

  if (vitality >= max && courage >= max * 0.7) return 'sunshine_runner';
  if (courage >= max && vitality >= max * 0.7) return 'sunshine_runner';
  if (mind >= max && focus >= max * 0.7) return 'moonlight_writer';
  if (focus >= max && mind >= max * 0.7) return 'moonlight_writer';
  if (care >= max && mind >= max * 0.7) return 'forest_caretaker';
  if (connection >= max && vitality >= max * 0.7) return 'starlight_connector';
  if (focus >= max && care >= max * 0.7) return 'quiet_gardener';

  if (vitality >= max) return 'sunshine_runner';
  if (mind >= max) return 'moonlight_writer';
  if (care >= max) return 'forest_caretaker';
  if (connection >= max) return 'starlight_connector';
  if (focus >= max) return 'quiet_gardener';
  return 'rainbow_traveler';
}

export function applyExpAndStats(
  creature: Creature,
  expGained: number,
  statKey: keyof Stats,
  statGain: number = 2,
): Creature {
  const newExp = creature.totalExp + expGained;
  const newStats = { ...creature.stats, [statKey]: creature.stats[statKey] + statGain };
  const newStage = getNextStage(newExp);
  const isComplete = newStage === 5 && creature.stage < 5;
  const finalType = newStage >= 4 ? determineFinalType(newStats) : creature.currentType;

  return {
    ...creature,
    totalExp: newExp,
    stats: newStats,
    stage: newStage,
    currentType: finalType,
    completedAt: isComplete ? new Date().toISOString() : creature.completedAt,
  };
}
