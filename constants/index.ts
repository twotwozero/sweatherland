import type { MoodType, EnergyType, ActionType, StatKey, FinalCreatureType, ShopItem, CreatureStage } from '../types';

export const MOOD_MAP: Record<MoodType, { label: string; energyType: EnergyType; energyLabel: string; emoji: string }> = {
  joy:        { label: '기쁨',    energyType: 'sunlight',  energyLabel: '햇살 에너지',   emoji: '☀️' },
  calm:       { label: '평온',    energyType: 'moonlight', energyLabel: '달빛 에너지',   emoji: '🌙' },
  tired:      { label: '피곤',    energyType: 'cloud',     energyLabel: '구름 에너지',   emoji: '☁️' },
  anxious:    { label: '불안',    energyType: 'wind',      energyLabel: '바람 에너지',   emoji: '🌬️' },
  sad:        { label: '우울',    energyType: 'raindrop',  energyLabel: '물방울 에너지', emoji: '💧' },
  frustrated: { label: '답답',    energyType: 'pebble',    energyLabel: '돌멩이 에너지', emoji: '🪨' },
  lonely:     { label: '외로움',  energyType: 'starlight', energyLabel: '별빛 에너지',   emoji: '⭐' },
  proud:      { label: '뿌듯',    energyType: 'flame',     energyLabel: '불꽃 에너지',   emoji: '🔥' },
  lethargic:  { label: '무기력',  energyType: 'soil',      energyLabel: '흙 에너지',     emoji: '🌱' },
  excited:    { label: '설렘',    energyType: 'sprout',    energyLabel: '새싹 에너지',   emoji: '🌿' },
};

// Multiple responses per mood — picked randomly at display time
export const MOOD_RESPONSES: Record<MoodType, string[]> = {
  joy: [
    '기쁜 마음이 나한테도 전해졌어! 오늘도 알려줘서 고마워 💛',
    '오늘 기쁜 날이었구나, 나도 덩달아 기분 좋아! ☀️',
    '그 기쁜 마음, 에너지가 됐어. 오늘 정말 빛났어 ✨',
  ],
  calm: [
    '평온한 하루였구나. 그 고요함이 나는 참 좋아 🌙',
    '잔잔한 마음을 나눠줘서 고마워. 그런 날도 정말 소중해 🫧',
    '평온함도 힘이 돼. 오늘 하루 잘 버텼어 💙',
  ],
  tired: [
    '많이 힘들었구나. 그 마음도 나한테는 소중한 에너지야 ☁️',
    '오늘 정말 수고했어. 피곤한 건 열심히 살았다는 증거야 💤',
    '힘든 날도 여기 와줘서 고마워. 그것만으로도 충분해 🤍',
  ],
  anxious: [
    '불안한 마음을 용기 내어 말해줘서 고마워. 나 여기 있을게 🌬️',
    '불안할 때도 괜찮아. 나는 항상 네 편이야 💜',
    '그 마음, 혼자 담고 있었겠다. 나눠줘서 정말 고마워 🌸',
  ],
  sad: [
    '그 마음도 나한테는 소중한 에너지야. 오늘도 알려줘서 고마워 💧',
    '슬픈 날도 있어. 그런 날에도 여기 온 네가 대단해 🫧',
    '울어도 괜찮아. 나는 여기서 기다릴게 🌙',
  ],
  frustrated: [
    '답답했겠다. 그 감정을 기록해줘서 정말 고마워 🪨',
    '꽉 막힌 느낌이었구나. 그 에너지도 내가 받아낼게 💛',
    '답답한 감정을 내뱉는 것도 용기야. 잘했어 ✨',
  ],
  lonely: [
    '외로운 마음을 나눠줘서 고마워. 나는 항상 여기 있어 ⭐',
    '오늘은 내가 옆에 있을게. 혼자가 아니야 🌸',
    '외로운 날일수록 더 생각나게 해줘서 고마워 💛',
  ],
  proud: [
    '뿌듯한 하루였구나! 그 마음 나도 같이 자랑스러워 🔥',
    '오늘 정말 잘했어! 그 뿌듯함, 충분히 누려도 돼 🌟',
    '스스로를 칭찬한 거야. 정말 멋있어 🎉',
  ],
  lethargic: [
    '무기력해도 괜찮아. 오늘 여기 온 것만으로도 충분해 🌱',
    '쉬고 싶은 날도 있어. 그것도 솔직한 마음이야 🤍',
    '아무것도 하기 싫은 날, 그래도 나한테 말해줘서 고마워 🫧',
  ],
  excited: [
    '설레는 마음이 느껴져! 좋은 일이 있었나봐 🌿',
    '두근두근한 하루였구나! 그 에너지 나한테도 왔어 ✨',
    '설렘도 에너지야. 오늘 정말 특별한 날이었네 🌈',
  ],
};

export function getRandomMoodResponse(mood: MoodType): string {
  const arr = MOOD_RESPONSES[mood];
  return arr[Math.floor(Math.random() * arr.length)];
}

export const ACTION_MAP: Record<ActionType, {
  label: string;
  emoji: string;
  statAffected: StatKey;
  expGained: number;
  sweatGained: number;
  description: string;
}> = {
  walk5min:    { label: '5분 산책하기',        emoji: '🚶', statAffected: 'vitality',   expGained: 10, sweatGained: 5,  description: '문 밖을 나서는 것만으로도 충분해요' },
  drinkWater:  { label: '물 한 잔 마시기',      emoji: '💧', statAffected: 'care',       expGained: 8,  sweatGained: 3,  description: '몸을 돌보는 가장 작은 시작이에요' },
  makeBed:     { label: '침대 정리하기',        emoji: '🛏️', statAffected: 'care',       expGained: 8,  sweatGained: 3,  description: '공간을 정리하면 마음도 정리돼요' },
  getSunlight: { label: '햇빛 보기',           emoji: '☀️', statAffected: 'vitality',   expGained: 10, sweatGained: 5,  description: '창문이든 밖이든, 햇빛 한 줄기면 돼요' },
  textFriend:  { label: '친구에게 안부 보내기', emoji: '💌', statAffected: 'connection', expGained: 12, sweatGained: 6,  description: '짧은 "잘 지내?" 하나면 충분해요' },
  listenSong:  { label: '좋아하는 노래 한 곡',  emoji: '🎵', statAffected: 'focus',      expGained: 10, sweatGained: 4,  description: '귀로 듣는 작은 쉼표예요' },
  writeDiary:  { label: '3줄 일기 쓰기',       emoji: '📝', statAffected: 'mind',       expGained: 15, sweatGained: 7,  description: '세 줄이면 충분해요. 오늘의 나를 기록해요' },
  shower:      { label: '샤워하기',            emoji: '🚿', statAffected: 'care',       expGained: 10, sweatGained: 5,  description: '씻고 나면 조금은 나아지는 기분이에요' },
  walk10min:   { label: '10분 걷기',           emoji: '🏃', statAffected: 'vitality',   expGained: 15, sweatGained: 8,  description: '걷는 동안만큼은 생각이 정리돼요' },
  throwTrash:  { label: '쓰레기 하나 버리기',   emoji: '🗑️', statAffected: 'courage',   expGained: 8,  sweatGained: 3,  description: '작은 정리가 큰 용기의 시작이에요' },
};

export const STAT_LABELS: Record<StatKey, { label: string; emoji: string; color: string }> = {
  mind:       { label: '마음빛', emoji: '💜', color: '#C9A8F5' },
  vitality:   { label: '활력',   emoji: '💛', color: '#FFD166' },
  care:       { label: '돌봄',   emoji: '💚', color: '#80CDA8' },
  connection: { label: '연결',   emoji: '💙', color: '#80C4F5' },
  focus:      { label: '몰입',   emoji: '🩵', color: '#A8D8EA' },
  courage:    { label: '용기',   emoji: '🧡', color: '#FFB085' },
};

export const STAGE_NAMES: Record<number, string> = {
  1: '마음알',
  2: '말랑이',
  3: '꼬마 생명체',
  4: '개성 발현체',
  5: '최종 형태',
};

export const STAGE_EMOJI: Record<number, string> = {
  1: '🥚',
  2: '🫧',
  3: '🌱',
  4: '✨',
  5: '🌟',
};

export const STAGE_EXP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 30,
  3: 80,
  4: 160,
  5: 280,
};

export const STAGE_LEVEL_UP_MESSAGES: Record<number, { title: string; body: string }> = {
  2: { title: '말랑이로 성장했어요!',       body: '마음알이 조금씩 형태를 갖춰가고 있어요.\n앞으로 더 많은 감정과 행동이 기다리고 있어요.' },
  3: { title: '꼬마 생명체가 됐어요!',      body: '이제 성격이 보이기 시작해요.\n어떤 모습으로 완성될지 기대되지 않나요?' },
  4: { title: '개성이 발현되고 있어요!',    body: '최종 형태가 가까워지고 있어요.\n지금까지의 감정과 행동이 모습을 만들어가요.' },
  5: { title: '드디어 최종 형태예요! 🎉',   body: '지금까지의 여정이 하나의 생명체로 완성됐어요.\n컬렉션에 영원히 남아요.' },
};

export const FINAL_TYPE_INFO: Record<FinalCreatureType, {
  name: string;
  emoji: string;
  description: string;
  unlockHint: string;
  traits: string[];
}> = {
  sunshine_runner: {
    name: '햇살 러너',
    emoji: '🌞🏃',
    description: '에너지 넘치게 세상을 달리는 생명체',
    unlockHint: '활력과 용기를 많이 키우면 만날 수 있어요',
    traits: ['산책', '걷기', '외출', '햇빛 보기'],
  },
  moonlight_writer: {
    name: '달빛 기록가',
    emoji: '🌙📖',
    description: '마음을 글로 담는 조용한 생명체',
    unlockHint: '마음빛과 몰입을 많이 키우면 만날 수 있어요',
    traits: ['일기 쓰기', '감정 기록', '노래 듣기'],
  },
  forest_caretaker: {
    name: '숲의 돌봄가',
    emoji: '🌿🫧',
    description: '자신과 주변을 따뜻하게 돌보는 생명체',
    unlockHint: '돌봄과 마음빛을 많이 키우면 만날 수 있어요',
    traits: ['물 마시기', '샤워', '침대 정리', '일기'],
  },
  starlight_connector: {
    name: '별빛 연결자',
    emoji: '⭐🤝',
    description: '사람들을 이어주는 빛나는 생명체',
    unlockHint: '연결과 활력을 많이 키우면 만날 수 있어요',
    traits: ['친구 안부', '산책', '걷기'],
  },
  quiet_gardener: {
    name: '조용한 정원사',
    emoji: '🪴🎧',
    description: '몰입과 돌봄으로 세상을 가꾸는 생명체',
    unlockHint: '몰입과 돌봄을 많이 키우면 만날 수 있어요',
    traits: ['노래 듣기', '물 마시기', '샤워', '침대 정리'],
  },
  rainbow_traveler: {
    name: '무지개 여행자',
    emoji: '🌈🧭',
    description: '모든 가능성을 품은 특별한 생명체',
    unlockHint: '모든 능력치를 골고루 키우면 만날 수 있어요',
    traits: ['모든 행동을 골고루'],
  },
};

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 'item_shoes',     name: '작은 러닝화', emoji: '👟', type: 'accessory',  price: 20, unlocked: false },
  { id: 'item_hat',       name: '노란 모자',   emoji: '🎩', type: 'accessory',  price: 15, unlocked: false },
  { id: 'item_blanket',   name: '포근한 담요', emoji: '🧸', type: 'accessory',  price: 25, unlocked: false },
  { id: 'item_bottle',    name: '물병',        emoji: '🍶', type: 'accessory',  price: 10, unlocked: false },
  { id: 'item_headphone', name: '헤드폰',      emoji: '🎧', type: 'accessory',  price: 30, unlocked: false },
  { id: 'item_book',      name: '작은 책',     emoji: '📚', type: 'accessory',  price: 20, unlocked: false },
  { id: 'bg_ocean',       name: '바다 배경',   emoji: '🌊', type: 'background', price: 40, unlocked: false },
  { id: 'bg_forest',      name: '숲 배경',     emoji: '🌲', type: 'background', price: 40, unlocked: false },
  { id: 'bg_night',       name: '밤하늘 배경', emoji: '🌃', type: 'background', price: 50, unlocked: false },
  { id: 'bg_campus',      name: '캠퍼스 잔디', emoji: '🌿', type: 'background', price: 35, unlocked: false },
];

export const EXP_PER_MOOD = 5;

// Daily quote shown as creature's speech on home screen, rotates by day-of-year
export const CREATURE_DAILY_QUOTES = [
  '오늘도 여기 와줘서 고마워 🌱',
  '어떤 하루든, 나는 네 곁에 있어 💛',
  '오늘 하루, 작은 것 하나만 해도 충분해 ✨',
  '잘 못한 날도 괜찮아. 내일 다시 시작하면 돼 🌸',
  '네가 느끼는 감정은 모두 소중해 💜',
  '오늘도 네 옆에서 같이 숨 쉬고 있어 🫧',
  '힘든 날일수록 더 고마워, 여기 와줘서 💙',
  '아무것도 하지 않아도 괜찮아. 존재만으로 충분해 🤍',
  '오늘의 나를 기록하는 건 용기 있는 일이야 🔥',
  '작은 행동 하나가 우리 둘을 같이 성장시켜 🌿',
  '비가 오는 날도, 맑은 날도 나는 여기 있어 ☁️',
  '오늘 감정이 어떻든, 그게 지금의 너야. 충분해 ⭐',
];

export function getDailyQuote(): string {
  const day = Math.floor(Date.now() / 86400000);
  return CREATURE_DAILY_QUOTES[day % CREATURE_DAILY_QUOTES.length];
}

export const PASTEL_COLORS = {
  primary:    '#A8D8EA',
  secondary:  '#FFF9C4',
  accent:     '#FFD1DC',
  green:      '#B8E0C8',
  purple:     '#E8D5F5',
  orange:     '#FFE5CC',
  yellow:     '#FFF3B0',
  pink:       '#FFD6E0',
  text:       '#4A4A6A',
  textLight:  '#8888AA',
  white:      '#FFFFFF',
  background: '#FAF7FF',
  card:       '#FFFFFF',
  border:     '#E8E0F0',
};
