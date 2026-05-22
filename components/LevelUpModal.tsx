import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import type { CreatureStage, FinalCreatureType } from '../types';
import {
  STAGE_NAMES, STAGE_EMOJI, STAGE_LEVEL_UP_MESSAGES, FINAL_TYPE_INFO, PASTEL_COLORS,
} from '../constants';

interface Props {
  visible: boolean;
  newStage: CreatureStage;
  finalType?: FinalCreatureType | null;
  creatureName: string;
  onDismiss: () => void;
}

export default function LevelUpModal({ visible, newStage, finalType, creatureName, onDismiss }: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.6);
      opacity.setValue(0);
    }
  }, [visible]);

  const info = STAGE_LEVEL_UP_MESSAGES[newStage];
  const isFinal = newStage === 5;
  const finalInfo = isFinal && finalType ? FINAL_TYPE_INFO[finalType] : null;
  const emoji = isFinal && finalInfo ? finalInfo.emoji : STAGE_EMOJI[newStage];

  useEffect(() => {
    if (visible && !info) onDismiss();
  }, [visible, info, onDismiss]);

  if (!info) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.emoji}>{emoji}</Text>

          <Text style={styles.creatureName}>{creatureName}</Text>
          <Text style={styles.stageBadge}>
            Lv.{newStage} {STAGE_NAMES[newStage]}
          </Text>

          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.body}>{info.body}</Text>

          {finalInfo && (
            <View style={styles.finalTypeBox}>
              <Text style={styles.finalTypeLabel}>최종 타입</Text>
              <Text style={styles.finalTypeName}>{finalInfo.name}</Text>
              <Text style={styles.finalTypeDesc}>{finalInfo.description}</Text>
            </View>
          )}

          {isFinal && (
            <View style={styles.collectionNote}>
              <Text style={styles.collectionNoteText}>📚 컬렉션에 저장됐어요!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.buttonText}>
              {isFinal ? '컬렉션 보러 가기' : '계속하기 →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(74,74,106,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 28,
    padding: 32, alignItems: 'center', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  sparkle: { fontSize: 32, marginBottom: 4 },
  emoji: { fontSize: 72, marginBottom: 12 },
  creatureName: { fontSize: 22, fontWeight: '700', color: PASTEL_COLORS.text },
  stageBadge: {
    fontSize: 13, color: PASTEL_COLORS.primary, fontWeight: '700',
    backgroundColor: PASTEL_COLORS.background, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5, marginTop: 6, marginBottom: 16,
  },
  title: {
    fontSize: 20, fontWeight: '700', color: PASTEL_COLORS.text,
    textAlign: 'center', marginBottom: 10,
  },
  body: {
    fontSize: 14, color: PASTEL_COLORS.textLight,
    textAlign: 'center', lineHeight: 22, marginBottom: 16,
  },
  finalTypeBox: {
    backgroundColor: PASTEL_COLORS.purple, borderRadius: 16,
    padding: 16, alignItems: 'center', width: '100%', marginBottom: 12,
  },
  finalTypeLabel: { fontSize: 11, color: PASTEL_COLORS.textLight, marginBottom: 4 },
  finalTypeName: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text },
  finalTypeDesc: { fontSize: 12, color: PASTEL_COLORS.textLight, marginTop: 4, textAlign: 'center' },
  collectionNote: {
    backgroundColor: PASTEL_COLORS.green, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20,
  },
  collectionNoteText: { fontSize: 13, fontWeight: '600', color: PASTEL_COLORS.text },
  button: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 18,
    paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', marginTop: 4,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: PASTEL_COLORS.text },
});
