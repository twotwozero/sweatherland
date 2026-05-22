import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../providers/GameProvider';
import ProgressBar from '../../components/ProgressBar';
import { PASTEL_COLORS, FINAL_TYPE_INFO } from '../../constants';
import type { FinalCreatureType } from '../../types';

const ALL_TYPES: FinalCreatureType[] = [
  'sunshine_runner',
  'moonlight_writer',
  'forest_caretaker',
  'starlight_connector',
  'quiet_gardener',
  'rainbow_traveler',
];

export default function CollectionScreen() {
  const { state } = useGame();
  const { collection } = state;
  const [detailType, setDetailType] = useState<FinalCreatureType | null>(null);

  const collectedTypes = new Set(collection.map((c) => c.finalType));
  const collectedCount = collectedTypes.size;

  const detailInfo = detailType ? FINAL_TYPE_INFO[detailType] : null;
  const detailCollected = detailType ? collection.filter((c) => c.finalType === detailType) : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Text style={styles.title}>📚 컬렉션 도감</Text>

        {/* ── Progress bar ── */}
        <View style={styles.progressCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>수집 현황</Text>
            <Text style={styles.progressCount}>
              {collectedCount} / {ALL_TYPES.length}종
            </Text>
          </View>
          <ProgressBar
            progress={collectedCount / ALL_TYPES.length}
            color={PASTEL_COLORS.primary}
            height={10}
          />
          {collectedCount === ALL_TYPES.length && (
            <Text style={styles.completedBadge}>🌈 전체 컬렉션 완성!</Text>
          )}
        </View>

        {/* ── My creatures ── */}
        {collection.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내가 키운 생명체</Text>
            {collection.map((item) => {
              const info = FINAL_TYPE_INFO[item.finalType];
              const date = new Date(item.completedAt).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              return (
                <View key={item.id} style={styles.myCreatureCard}>
                  <Text style={styles.myCreatureEmoji}>{info.emoji}</Text>
                  <View style={styles.myCreatureInfo}>
                    <Text style={styles.myCreatureName}>{item.creatureName}</Text>
                    <Text style={styles.myCreatureType}>{info.name}</Text>
                    <Text style={styles.myCreatureDate}>{date} 완성</Text>
                  </View>
                  <View style={styles.myCreatureBadge}>
                    <Text style={styles.myCreatureBadgeText}>완성 ✓</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Dex grid ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>생명체 도감</Text>
          <Text style={styles.sectionSub}>탭해서 자세히 보기</Text>
          <View style={styles.dexGrid}>
            {ALL_TYPES.map((type, idx) => {
              const info = FINAL_TYPE_INFO[type];
              const unlocked = collectedTypes.has(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.dexCard, unlocked ? styles.dexCardUnlocked : styles.dexCardLocked]}
                  onPress={() => setDetailType(type)}
                  activeOpacity={0.8}
                >
                  {unlocked ? (
                    <>
                      <Text style={styles.dexEmoji}>{info.emoji}</Text>
                      <Text style={styles.dexName}>{info.name}</Text>
                      <View style={styles.unlockedTag}>
                        <Text style={styles.unlockedTagText}>수집 완료</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.lockedEmoji}>🔒</Text>
                      <Text style={styles.lockedNum}>No.{String(idx + 1).padStart(2, '0')}</Text>
                      <Text style={styles.lockedHint} numberOfLines={2}>
                        {info.unlockHint}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {collection.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>아직 완성한 생명체가 없어요</Text>
            <Text style={styles.emptySub}>
              감정 기록과 행동 퀘스트를 통해{'\n'}생명체를 5단계까지 성장시켜 보세요
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Detail modal ── */}
      <Modal
        visible={detailType !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailType(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setDetailType(null)}
          activeOpacity={1}
        >
          <TouchableOpacity activeOpacity={1} style={styles.detailSheet}>
            {detailInfo && detailType && (
              <>
                <View style={styles.detailHandle} />
                <Text style={styles.detailEmoji}>
                  {collectedTypes.has(detailType) ? detailInfo.emoji : '🔒'}
                </Text>
                <Text style={styles.detailName}>
                  {collectedTypes.has(detailType) ? detailInfo.name : '???'}
                </Text>

                {collectedTypes.has(detailType) ? (
                  <>
                    <Text style={styles.detailDesc}>{detailInfo.description}</Text>
                    <View style={styles.traitsRow}>
                      {detailInfo.traits.map((t) => (
                        <View key={t} style={styles.traitChip}>
                          <Text style={styles.traitChipText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                    {detailCollected.length > 0 && (
                      <View style={styles.detailHistory}>
                        <Text style={styles.detailHistoryTitle}>내가 키운 기록</Text>
                        {detailCollected.map((c) => (
                          <Text key={c.id} style={styles.detailHistoryItem}>
                            · {c.creatureName} ({new Date(c.completedAt).toLocaleDateString('ko-KR')})
                          </Text>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.detailLocked}>아직 만나지 못한 생명체예요</Text>
                    <View style={styles.unlockHintBox}>
                      <Text style={styles.unlockHintLabel}>해금 조건</Text>
                      <Text style={styles.unlockHintText}>{detailInfo.unlockHint}</Text>
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={() => setDetailType(null)}
                >
                  <Text style={styles.detailCloseBtnText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PASTEL_COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  title: { fontSize: 24, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 16 },

  progressCard: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  progressLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
  },
  progressLabel: { fontSize: 14, fontWeight: '600', color: PASTEL_COLORS.text },
  progressCount: { fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.primary },
  completedBadge: {
    fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text,
    textAlign: 'center', marginTop: 10,
  },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: PASTEL_COLORS.textLight, marginBottom: 12 },

  myCreatureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: PASTEL_COLORS.white, borderRadius: 20,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  myCreatureEmoji: { fontSize: 44 },
  myCreatureInfo: { flex: 1 },
  myCreatureName: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text },
  myCreatureType: { fontSize: 13, color: PASTEL_COLORS.primary, fontWeight: '600', marginTop: 2 },
  myCreatureDate: { fontSize: 11, color: PASTEL_COLORS.textLight, marginTop: 3 },
  myCreatureBadge: {
    backgroundColor: PASTEL_COLORS.green, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  myCreatureBadgeText: { fontSize: 11, fontWeight: '700', color: PASTEL_COLORS.text },

  dexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dexCard: {
    width: '47%', borderRadius: 18, padding: 16, alignItems: 'center', minHeight: 130,
    justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  dexCardUnlocked: { backgroundColor: PASTEL_COLORS.white },
  dexCardLocked: { backgroundColor: PASTEL_COLORS.border },
  dexEmoji: { fontSize: 40, marginBottom: 8 },
  dexName: { fontSize: 13, fontWeight: '700', color: PASTEL_COLORS.text, textAlign: 'center' },
  unlockedTag: {
    marginTop: 8, backgroundColor: PASTEL_COLORS.primary, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  unlockedTagText: { fontSize: 10, fontWeight: '700', color: PASTEL_COLORS.text },
  lockedEmoji: { fontSize: 36, opacity: 0.3, marginBottom: 6 },
  lockedNum: { fontSize: 11, fontWeight: '700', color: PASTEL_COLORS.textLight, marginBottom: 4 },
  lockedHint: {
    fontSize: 10, color: PASTEL_COLORS.textLight, textAlign: 'center', lineHeight: 15,
  },

  emptyCard: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 24,
    padding: 32, alignItems: 'center',
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: PASTEL_COLORS.textLight, textAlign: 'center', lineHeight: 22 },

  // detail modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(74,74,106,0.4)', justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: PASTEL_COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40, alignItems: 'center',
  },
  detailHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: PASTEL_COLORS.border, marginBottom: 20,
  },
  detailEmoji: { fontSize: 64, marginBottom: 12 },
  detailName: { fontSize: 22, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 8 },
  detailDesc: {
    fontSize: 14, color: PASTEL_COLORS.textLight, textAlign: 'center',
    lineHeight: 22, marginBottom: 16,
  },
  traitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  traitChip: {
    backgroundColor: PASTEL_COLORS.secondary, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  traitChipText: { fontSize: 12, fontWeight: '600', color: PASTEL_COLORS.text },
  detailHistory: {
    backgroundColor: PASTEL_COLORS.background, borderRadius: 14,
    padding: 14, alignSelf: 'stretch', marginBottom: 16,
  },
  detailHistoryTitle: { fontSize: 12, fontWeight: '700', color: PASTEL_COLORS.textLight, marginBottom: 6 },
  detailHistoryItem: { fontSize: 13, color: PASTEL_COLORS.text, marginBottom: 3 },
  detailLocked: {
    fontSize: 15, color: PASTEL_COLORS.textLight, marginBottom: 16,
  },
  unlockHintBox: {
    backgroundColor: PASTEL_COLORS.background, borderRadius: 14,
    padding: 16, alignSelf: 'stretch', marginBottom: 20, alignItems: 'center',
  },
  unlockHintLabel: { fontSize: 11, color: PASTEL_COLORS.textLight, marginBottom: 6 },
  unlockHintText: { fontSize: 14, color: PASTEL_COLORS.text, textAlign: 'center', fontWeight: '600' },
  detailCloseBtn: {
    backgroundColor: PASTEL_COLORS.border, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 40, marginTop: 4,
  },
  detailCloseBtnText: { fontSize: 15, fontWeight: '600', color: PASTEL_COLORS.textLight },
});
