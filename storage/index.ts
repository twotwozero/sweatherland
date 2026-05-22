import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Creature, Player } from '../types';
import { INITIAL_SHOP_ITEMS } from '../constants';

const STORAGE_KEY = 'sweatherland_state_v2';

function isValidPlayer(p: unknown): p is Player {
  return (
    typeof p === 'object' && p !== null &&
    typeof (p as Player).id === 'string' &&
    typeof (p as Player).name === 'string' &&
    typeof (p as Player).sweatDrops === 'number'
  );
}

function isValidCreature(c: unknown): c is Creature {
  return (
    typeof c === 'object' && c !== null &&
    typeof (c as Creature).id === 'string' &&
    typeof (c as Creature).name === 'string' &&
    typeof (c as Creature).stage === 'number' &&
    typeof (c as Creature).totalExp === 'number' &&
    typeof (c as Creature).stats === 'object'
  );
}

function sanitizeCreature(c: Creature): Creature {
  return {
    ...c,
    stage: ([1, 2, 3, 4, 5].includes(c.stage) ? c.stage : 1) as Creature['stage'],
    totalExp: Math.max(0, c.totalExp ?? 0),
    stats: {
      mind:       Math.max(0, c.stats?.mind ?? 0),
      vitality:   Math.max(0, c.stats?.vitality ?? 0),
      care:       Math.max(0, c.stats?.care ?? 0),
      connection: Math.max(0, c.stats?.connection ?? 0),
      focus:      Math.max(0, c.stats?.focus ?? 0),
      courage:    Math.max(0, c.stats?.courage ?? 0),
    },
    equippedItems: Array.isArray(c.equippedItems) ? c.equippedItems : [],
    completedAt: c.completedAt ?? null,
    currentType: c.currentType ?? null,
  };
}

const DEFAULT_STATE: GameState = {
  player: null,
  creature: null,
  moodLogs: [],
  actionLogs: [],
  collection: [],
  shopItems: INITIAL_SHOP_ITEMS,
  todayMoodDone: false,
  todayActionDone: false,
  todayStepRewardClaimed: false,
  lastLogDate: '',
  pendingLevelUp: null,
};

export async function loadState(): Promise<GameState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };

    const saved = JSON.parse(raw) as Partial<GameState>;

    const player = isValidPlayer(saved.player) ? saved.player : null;
    const rawCreature = saved.creature;
    const creature = isValidCreature(rawCreature) ? sanitizeCreature(rawCreature) : null;

    // merge shop items to catch any newly added items in app updates
    const savedShopItems = Array.isArray(saved.shopItems) ? saved.shopItems : [];
    const savedIds = new Set(savedShopItems.map((i) => i.id));
    const mergedShopItems = [
      ...savedShopItems,
      ...INITIAL_SHOP_ITEMS.filter((i) => !savedIds.has(i.id)),
    ];

    return {
      ...DEFAULT_STATE,
      player,
      creature,
      moodLogs:        Array.isArray(saved.moodLogs)   ? saved.moodLogs   : [],
      actionLogs:      Array.isArray(saved.actionLogs) ? saved.actionLogs : [],
      collection:      Array.isArray(saved.collection) ? saved.collection : [],
      shopItems:       mergedShopItems,
      todayMoodDone:          saved.todayMoodDone          === true,
      todayActionDone:        saved.todayActionDone        === true,
      todayStepRewardClaimed: saved.todayStepRewardClaimed === true,
      lastLogDate:            typeof saved.lastLogDate === 'string' ? saved.lastLogDate : '',
      pendingLevelUp:         null, // never persist level-up celebration state
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function saveState(state: GameState): Promise<void> {
  try {
    // Never persist pendingLevelUp so stale modals don't appear on restart
    const toSave: GameState = { ...state, pendingLevelUp: null };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage failure is non-fatal; continue without crashing
  }
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
