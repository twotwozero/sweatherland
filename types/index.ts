export type MoodType =
  | 'joy'
  | 'calm'
  | 'tired'
  | 'anxious'
  | 'sad'
  | 'frustrated'
  | 'lonely'
  | 'proud'
  | 'lethargic'
  | 'excited';

export type EnergyType =
  | 'sunlight'
  | 'moonlight'
  | 'cloud'
  | 'wind'
  | 'raindrop'
  | 'pebble'
  | 'starlight'
  | 'flame'
  | 'soil'
  | 'sprout';

export type ActionType =
  | 'walk5min'
  | 'drinkWater'
  | 'makeBed'
  | 'getSunlight'
  | 'textFriend'
  | 'listenSong'
  | 'writeDiary'
  | 'shower'
  | 'walk10min'
  | 'throwTrash';

export type StatKey = 'mind' | 'vitality' | 'care' | 'connection' | 'focus' | 'courage';

export type CreatureStage = 1 | 2 | 3 | 4 | 5;

export type FinalCreatureType =
  | 'sunshine_runner'
  | 'moonlight_writer'
  | 'forest_caretaker'
  | 'starlight_connector'
  | 'quiet_gardener'
  | 'rainbow_traveler';

export interface Stats {
  mind: number;
  vitality: number;
  care: number;
  connection: number;
  focus: number;
  courage: number;
}

export interface Creature {
  id: string;
  name: string;
  stage: CreatureStage;
  totalExp: number;
  stats: Stats;
  currentType: FinalCreatureType | null;
  createdAt: string;
  completedAt: string | null;
  equippedItems: string[];
}

export interface Player {
  id: string;
  name: string;
  sweatDrops: number;
  createdAt: string;
}

export interface MoodLog {
  id: string;
  mood: MoodType;
  energyType: EnergyType;
  createdAt: string;
}

export interface ActionLog {
  id: string;
  actionType: ActionType;
  statAffected: StatKey;
  expGained: number;
  sweatGained: number;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  creatureId: string;
  finalType: FinalCreatureType;
  creatureName: string;
  completedAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  type: 'accessory' | 'background';
  price: number;
  unlocked: boolean;
}

export interface GameState {
  player: Player | null;
  creature: Creature | null;
  moodLogs: MoodLog[];
  actionLogs: ActionLog[];
  collection: CollectionItem[];
  shopItems: ShopItem[];
  todayMoodDone: boolean;
  todayActionDone: boolean;
  /** true이면 오늘 걸음 보상을 이미 수령함 — 자정 리셋 */
  todayStepRewardClaimed: boolean;
  lastLogDate: string;
  // level-up celebration: set when stage advances, cleared after modal is dismissed
  pendingLevelUp: CreatureStage | null;
}
