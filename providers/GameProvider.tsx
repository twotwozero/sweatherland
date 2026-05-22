import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import type { GameState, Player, Creature, MoodType, ActionType, CreatureStage, FinalCreatureType } from '../types';
import { loadState, saveState, clearState } from '../storage';
import { MOOD_MAP, ACTION_MAP, EXP_PER_MOOD, INITIAL_SHOP_ITEMS } from '../constants';
import { applyExpAndStats } from '../engine/growth';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayStr(): string {
  return new Date().toDateString();
}

type ReducerAction =
  | { type: 'LOAD'; payload: GameState }
  | { type: 'CREATE_PLAYER'; name: string }
  | { type: 'CREATE_CREATURE'; name: string }
  | { type: 'LOG_MOOD'; mood: MoodType }
  | { type: 'COMPLETE_ACTION'; action: ActionType }
  | { type: 'CLAIM_STEP_REWARD'; sweatDrops: number }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'EQUIP_ITEM'; itemId: string }
  | { type: 'UNEQUIP_ITEM'; itemId: string }
  | { type: 'DISMISS_LEVEL_UP' }
  | { type: 'RESET_GAME' }
  | { type: 'ADMIN_ADD_DROPS'; amount: number }
  | { type: 'ADMIN_ADD_EXP'; amount: number }
  | { type: 'ADMIN_RESET_DAILY' }
  | { type: 'ADMIN_UNLOCK_ALL_SHOP' }
  | { type: 'ADMIN_UNLOCK_ALL_DEX' };

function buildCollectionEntry(creature: Creature) {
  return {
    id: uid(),
    creatureId: creature.id,
    finalType: creature.currentType!,
    creatureName: creature.name,
    completedAt: new Date().toISOString(),
  };
}

function reducer(state: GameState, action: ReducerAction): GameState {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'CREATE_PLAYER': {
      const player: Player = {
        id: uid(),
        name: action.name,
        sweatDrops: 0,
        createdAt: new Date().toISOString(),
      };
      return { ...state, player };
    }

    case 'CREATE_CREATURE': {
      const creature: Creature = {
        id: uid(),
        name: action.name,
        stage: 1,
        totalExp: 0,
        stats: { mind: 0, vitality: 0, care: 0, connection: 0, focus: 0, courage: 0 },
        currentType: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        equippedItems: [],
      };
      return { ...state, creature };
    }

    case 'LOG_MOOD': {
      if (!state.creature || !state.player) return state;
      const { energyType } = MOOD_MAP[action.mood];
      const log = {
        id: uid(),
        mood: action.mood,
        energyType,
        createdAt: new Date().toISOString(),
      };
      const prev = state.creature;
      const updated = applyExpAndStats(prev, EXP_PER_MOOD, 'mind', 1);
      const leveledUp = updated.stage > prev.stage;
      const justFinished = updated.stage === 5 && prev.stage < 5;

      return {
        ...state,
        creature: updated,
        moodLogs: [...state.moodLogs, log],
        collection: justFinished
          ? [...state.collection, buildCollectionEntry(updated)]
          : state.collection,
        todayMoodDone: true,
        lastLogDate: todayStr(),
        pendingLevelUp: leveledUp ? updated.stage : state.pendingLevelUp,
      };
    }

    case 'COMPLETE_ACTION': {
      if (!state.creature || !state.player) return state;
      const info = ACTION_MAP[action.action];
      const log = {
        id: uid(),
        actionType: action.action,
        statAffected: info.statAffected,
        expGained: info.expGained,
        sweatGained: info.sweatGained,
        createdAt: new Date().toISOString(),
      };
      const prev = state.creature;
      const updated = applyExpAndStats(prev, info.expGained, info.statAffected, 3);
      const leveledUp = updated.stage > prev.stage;
      const justFinished = updated.stage === 5 && prev.stage < 5;

      return {
        ...state,
        creature: updated,
        actionLogs: [...state.actionLogs, log],
        collection: justFinished
          ? [...state.collection, buildCollectionEntry(updated)]
          : state.collection,
        player: {
          ...state.player,
          sweatDrops: state.player.sweatDrops + info.sweatGained,
        },
        todayActionDone: true,
        lastLogDate: todayStr(),
        pendingLevelUp: leveledUp ? updated.stage : state.pendingLevelUp,
      };
    }

    case 'CLAIM_STEP_REWARD': {
      if (!state.player || action.sweatDrops <= 0 || state.todayStepRewardClaimed) return state;
      return {
        ...state,
        player: {
          ...state.player,
          sweatDrops: state.player.sweatDrops + action.sweatDrops,
        },
        todayStepRewardClaimed: true,
        lastLogDate: todayStr(),
      };
    }

    case 'BUY_ITEM': {
      if (!state.player) return state;
      const item = state.shopItems.find((i) => i.id === action.itemId);
      if (!item || item.unlocked || state.player.sweatDrops < item.price) return state;
      return {
        ...state,
        player: { ...state.player, sweatDrops: state.player.sweatDrops - item.price },
        shopItems: state.shopItems.map((i) =>
          i.id === action.itemId ? { ...i, unlocked: true } : i,
        ),
      };
    }

    case 'EQUIP_ITEM': {
      if (!state.creature) return state;
      if (state.creature.equippedItems.includes(action.itemId)) return state;
      return {
        ...state,
        creature: {
          ...state.creature,
          equippedItems: [...state.creature.equippedItems, action.itemId],
        },
      };
    }

    case 'UNEQUIP_ITEM': {
      if (!state.creature) return state;
      return {
        ...state,
        creature: {
          ...state.creature,
          equippedItems: state.creature.equippedItems.filter((id) => id !== action.itemId),
        },
      };
    }

    case 'DISMISS_LEVEL_UP':
      return { ...state, pendingLevelUp: null };

    case 'RESET_GAME':
      return { ...INITIAL_STATE };

    case 'ADMIN_ADD_DROPS': {
      if (!state.player) return state;
      return { ...state, player: { ...state.player, sweatDrops: state.player.sweatDrops + action.amount } };
    }

    case 'ADMIN_ADD_EXP': {
      if (!state.creature) return state;
      const prev = state.creature;
      const updated = applyExpAndStats(prev, action.amount, 'mind', 0);
      const leveledUp = updated.stage > prev.stage;
      const justFinished = updated.stage === 5 && prev.stage < 5;
      return {
        ...state,
        creature: updated,
        collection: justFinished ? [...state.collection, buildCollectionEntry(updated)] : state.collection,
        pendingLevelUp: leveledUp ? updated.stage : state.pendingLevelUp,
      };
    }

    case 'ADMIN_RESET_DAILY':
      return { ...state, todayMoodDone: false, todayActionDone: false, todayStepRewardClaimed: false };

    case 'ADMIN_UNLOCK_ALL_SHOP':
      return { ...state, shopItems: state.shopItems.map((i) => ({ ...i, unlocked: true })) };

    case 'ADMIN_UNLOCK_ALL_DEX': {
      const ALL_FINAL_TYPES: FinalCreatureType[] = [
        'sunshine_runner', 'moonlight_writer', 'forest_caretaker',
        'starlight_connector', 'quiet_gardener', 'rainbow_traveler',
      ];
      const existingTypes = new Set(state.collection.map((c) => c.finalType));
      const toAdd = ALL_FINAL_TYPES
        .filter((type) => !existingTypes.has(type))
        .map((type) => ({
          id: uid(),
          creatureId: 'admin',
          finalType: type,
          creatureName: '관리자 해금',
          completedAt: new Date().toISOString(),
        }));
      return { ...state, collection: [...state.collection, ...toAdd] };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  loaded: boolean;
  createPlayer: (name: string) => void;
  createCreature: (name: string) => void;
  logMood: (mood: MoodType) => void;
  completeAction: (action: ActionType) => void;
  claimStepReward: (sweatDrops: number) => void;
  buyItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  resetDailyIfNeeded: () => void;
  dismissLevelUp: () => void;
  resetGame: () => Promise<void>;
  adminAddDrops: (amount: number) => void;
  adminAddExp: (amount: number) => void;
  adminResetDaily: () => void;
  adminUnlockAllShop: () => void;
  adminUnlockAllDex: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const INITIAL_STATE: GameState = {
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

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loaded, setLoaded] = React.useState(false);

  useEffect(() => {
    loadState().then((saved) => {
      dispatch({ type: 'LOAD', payload: saved });
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  const resetDailyIfNeeded = useCallback(() => {
    if (state.lastLogDate && state.lastLogDate !== todayStr()) {
      dispatch({
        type: 'LOAD',
        payload: {
          ...state,
          todayMoodDone: false,
          todayActionDone: false,
          todayStepRewardClaimed: false,
          lastLogDate: '',
          pendingLevelUp: null,
        },
      });
    }
  }, [state]);

  const createPlayer    = useCallback((name: string) => dispatch({ type: 'CREATE_PLAYER', name }), []);
  const createCreature  = useCallback((name: string) => dispatch({ type: 'CREATE_CREATURE', name }), []);
  const logMood         = useCallback((mood: MoodType) => dispatch({ type: 'LOG_MOOD', mood }), []);
  const completeAction  = useCallback((action: ActionType) => dispatch({ type: 'COMPLETE_ACTION', action }), []);
  const claimStepReward = useCallback((sweatDrops: number) => dispatch({ type: 'CLAIM_STEP_REWARD', sweatDrops }), []);
  const buyItem         = useCallback((itemId: string) => dispatch({ type: 'BUY_ITEM', itemId }), []);
  const equipItem       = useCallback((itemId: string) => dispatch({ type: 'EQUIP_ITEM', itemId }), []);
  const unequipItem     = useCallback((itemId: string) => dispatch({ type: 'UNEQUIP_ITEM', itemId }), []);
  const dismissLevelUp  = useCallback(() => dispatch({ type: 'DISMISS_LEVEL_UP' }), []);
  const resetGame = useCallback(async () => {
    await clearState();
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const adminAddDrops     = useCallback((amount: number) => dispatch({ type: 'ADMIN_ADD_DROPS', amount }), []);
  const adminAddExp       = useCallback((amount: number) => dispatch({ type: 'ADMIN_ADD_EXP', amount }), []);
  const adminResetDaily   = useCallback(() => dispatch({ type: 'ADMIN_RESET_DAILY' }), []);
  const adminUnlockAllShop = useCallback(() => dispatch({ type: 'ADMIN_UNLOCK_ALL_SHOP' }), []);
  const adminUnlockAllDex  = useCallback(() => dispatch({ type: 'ADMIN_UNLOCK_ALL_DEX' }), []);

  return (
    <GameContext.Provider
      value={{
        state, loaded,
        createPlayer, createCreature,
        logMood, completeAction, claimStepReward,
        buyItem, equipItem, unequipItem,
        resetDailyIfNeeded, dismissLevelUp, resetGame,
        adminAddDrops, adminAddExp, adminResetDaily, adminUnlockAllShop, adminUnlockAllDex,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
