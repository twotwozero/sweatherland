# Sweatherland Project Guide

## Product Concept

Sweatherland (스웨더랜드) is a mobile nurturing game for mental wellness and behavioral activation.
Users grow a small creature through daily mood check-ins and small achievable actions.
The app should feel like a cozy creature-raising game, not a clinical mental health app.

Korean UI is the default. All user-facing copy must be in Korean unless specified otherwise.

## Core Principle

Every emotion is valid. No exceptions.
Negative moods (불안, 우울, 무기력, 피곤, 답답, 외로움) must never damage, punish, or kill the creature.
Mood logging must always result in energy gain or a positive response from the creature.
The game rewards showing up, not performing.

## Tech Stack

- Expo (SDK 56)
- React Native 0.85
- TypeScript (strict mode)
- `@react-native-async-storage/async-storage` — local-first storage, no backend
- `expo-router` — file-based routing under `app/`
- `react-native-safe-area-context` — safe area layout
- No backend in MVP
- No login or auth in MVP
- No payment in MVP
- No real HealthKit or Health Connect integration in MVP

## Project Structure

```
app/                     # expo-router screens
  _layout.tsx            # root layout with GameProvider and SafeAreaProvider
  index.tsx              # router redirect (onboarding / egg / home)
  onboarding.tsx         # player name input
  egg.tsx                # creature naming and hatch animation
  mood.tsx               # daily mood check-in (modal)
  action.tsx             # daily small action quest (modal)
  (tabs)/
    _layout.tsx          # bottom tab layout
    home.tsx             # main home screen
    collection.tsx       # completed creature collection
    shop.tsx             # shop and room decoration
components/              # shared UI components
  CreatureDisplay.tsx    # animated creature emoji display
  ProgressBar.tsx        # horizontal progress bar
  StatGrid.tsx           # 6-stat grid display (uses STAT_LABELS from constants)
  LevelUpModal.tsx       # stage-up celebration modal (spring animation)
constants/index.ts       # MOOD_MAP, ACTION_MAP, STAGE_*, PASTEL_COLORS,
                         # STAT_LABELS, CREATURE_DAILY_QUOTES, STAGE_LEVEL_UP_MESSAGES,
                         # FINAL_TYPE_INFO (with unlockHint + traits),
                         # getRandomMoodResponse(), getDailyQuote()
engine/growth.ts         # pure functions: EXP, stage, final type branching
providers/
  GameProvider.tsx       # global game state via useReducer + AsyncStorage
  StepProvider.ts        # StepProvider interface, ActivitySummary, MockStepProvider (5 scenarios),
                         # calculateStepReward() pure fn, STEP_MILESTONES, createStepProvider() factory
hooks/
  useActivityData.ts     # useActivityData() hook — wraps StepProvider, manages loading state,
                         # exposes switchScenario() for mock testing
storage/index.ts         # AsyncStorage load/save/clear wrappers
types/index.ts           # all TypeScript types (Player, Creature, Stats, etc.)
```

## MVP Features

- Player onboarding (name input)
- Creature naming and egg hatching animation
- Daily mood check-in (10 moods → energy type → creature response)
- Daily small action quest (10 actions → EXP + stat + sweat drops)
- EXP-based 5-stage creature evolution
- Final character type branching (6 types based on dominant stats)
- Collection screen with full creature dex
- Shop with sweat-drop currency and equip system
- Mock step provider (interface ready for HealthKit / Health Connect)
- Activity screen: daily step count display, milestone dots, reward claim, mock scenario switcher

## Growth System

Stages: 1 (마음알) → 2 (말랑이) → 3 (꼬마 생명체) → 4 (개성 발현체) → 5 (최종 형태)
EXP thresholds: 0 / 30 / 80 / 160 / 280

Stats: `mind` / `vitality` / `care` / `connection` / `focus` / `courage`

Final type branching (in `engine/growth.ts`):
- vitality + courage → 햇살 러너
- mind + focus → 달빛 기록가
- care + mind → 숲의 돌봄가
- connection + vitality → 별빛 연결자
- focus + care → 조용한 정원사
- balanced → 무지개 여행자

## Mental Health Safety

This app does not diagnose or treat mental illness. Never add such claims.
Do not use language that blames the user for low mood, inactivity, or missing a day.
Do not implement streak-based penalties or failure states that create guilt.
Use warm, validating Korean copy throughout.
The onboarding screen includes a gentle disclaimer directing users to seek professional help if needed.

## Game Design Rules

- Reward small actions. A single completed quest is enough for the day.
- No competitive ranking.
- No streak shame or loss-of-progress mechanics.
- No failure states that feel punishing.
- Collection and customization are the primary long-term motivators.
- Daily limit: one action per day (blocked after completion). Mood can be re-recorded any number of
  times, but only the first recording awards EXP (`todayMoodDone` gates EXP, not screen access).
- Level-up is surfaced via `pendingLevelUp: CreatureStage | null` in GameState. Set in the reducer
  when `updated.stage > prev.stage`; cleared by `DISMISS_LEVEL_UP` action (called from home screen).
  Never persisted to AsyncStorage so stale modals never appear on restart.

## Code Rules

- Inspect the existing structure before making changes. Never delete unrelated files.
- Keep components small and focused. Split if a component exceeds ~150 lines.
- Use TypeScript types defined in `types/index.ts` for all core data models.
- Prefer pure functions for growth, EXP, stat, and final character calculations (`engine/`).
- Keep HealthKit / Health Connect behind the `StepProvider` interface in `providers/StepProvider.ts`.
  To swap to real data: implement `HealthKitStepProvider` / `HealthConnectStepProvider` and update
  `createStepProvider()` in the same file. The activity screen and hook need no changes.
- `calculateStepReward()` is a pure function (platform-independent). Keep it that way.
- Step reward milestones: 500→5, 1000→10, 3000→25, 5000→40 sweat drops. Running ×2. Daily max 80.
- Match the pastel color system in `constants/index.ts` (`PASTEL_COLORS`). Do not introduce new ad-hoc colors.
- Korean strings belong in the screen/component files directly. No i18n layer needed for MVP.
- Do not add backend, auth, payment, push notifications, or external API calls.

## Commands

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# TypeScript type check
npx tsc --noEmit
```

## Output Expectations

When completing a task, summarize:
- What changed
- Which files were modified or created
- How to verify the change works
- Known limitations or edge cases
- Next recommended task (if applicable)
