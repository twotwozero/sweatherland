import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useGame } from '../providers/GameProvider';
import { PASTEL_COLORS, STAGE_EXP_THRESHOLDS } from '../constants';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AdminPanel({ visible, onClose }: Props) {
  const { state, adminAddDrops, adminAddExp, adminResetDaily, adminUnlockAllShop, adminUnlockAllDex } = useGame();
  const creature = state.creature;
  const player = state.player;

  function expToNextStage(): number {
    if (!creature || creature.stage >= 5) return 0;
    const nextThreshold = STAGE_EXP_THRESHOLDS[creature.stage + 1];
    return Math.max(1, nextThreshold - creature.totalExp + 1);
  }

  function expToMaxStage(): number {
    if (!creature) return 0;
    return Math.max(1, STAGE_EXP_THRESHOLDS[5] - creature.totalExp + 1);
  }

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.rowBtns}>{children}</View>
      </View>
    );
  }

  function Btn({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
    return (
      <TouchableOpacity
        style={[styles.btn, danger && styles.btnDanger]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <Text style={[styles.btnText, danger && styles.btnTextDanger]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>🔧 관리자 패널</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>
                💧 {player?.sweatDrops ?? 0} 땀방울  ·  ⭐ {creature?.totalExp ?? 0} EXP  ·  Lv.{creature?.stage ?? '-'}
              </Text>
              <Text style={styles.statusText}>
                일일: 감정 {state.todayMoodDone ? '✅' : '❌'}  행동 {state.todayActionDone ? '✅' : '❌'}  걸음 {state.todayStepRewardClaimed ? '✅' : '❌'}
              </Text>
            </View>

            <Row label="💧 땀방울 충전">
              <Btn label="+100" onPress={() => adminAddDrops(100)} />
              <Btn label="+1000" onPress={() => adminAddDrops(1000)} />
              <Btn label="최대" onPress={() => adminAddDrops(9999)} />
            </Row>

            <Row label="⭐ 경험치 추가">
              <Btn label="+30" onPress={() => adminAddExp(30)} />
              <Btn
                label="다음단계"
                onPress={() => {
                  const amt = expToNextStage();
                  if (amt <= 0) { Alert.alert('이미 최종 단계예요'); return; }
                  adminAddExp(amt);
                }}
              />
              <Btn
                label="최종단계"
                onPress={() => {
                  const amt = expToMaxStage();
                  if (amt <= 0) { Alert.alert('이미 최종 단계예요'); return; }
                  adminAddExp(amt);
                }}
              />
            </Row>

            <Row label="📅 일일 퀘스트">
              <Btn label="전부 초기화" onPress={() => { adminResetDaily(); Alert.alert('초기화 완료', '오늘 퀘스트를 다시 할 수 있어요'); }} />
            </Row>

            <Row label="🛍️ 상점 아이템">
              <Btn label="전부 해금" onPress={() => { adminUnlockAllShop(); Alert.alert('해금 완료', '모든 아이템이 해금됐어요'); }} />
            </Row>

            <Row label="📚 컬렉션 도감">
              <Btn label="전체 해금" onPress={() => { adminUnlockAllDex(); Alert.alert('해금 완료', '모든 생명체 도감이 해금됐어요'); }} />
            </Row>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: PASTEL_COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '75%',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text },
  close: { fontSize: 18, color: PASTEL_COLORS.textLight, paddingHorizontal: 4 },
  statusBox: {
    backgroundColor: PASTEL_COLORS.background, borderRadius: 12,
    padding: 12, marginBottom: 20, gap: 4,
  },
  statusText: { fontSize: 13, color: PASTEL_COLORS.text, fontWeight: '500' },
  row: { marginBottom: 16 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: PASTEL_COLORS.text, marginBottom: 8 },
  rowBtns: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  btn: {
    backgroundColor: PASTEL_COLORS.primary, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  btnDanger: { backgroundColor: '#ffe0de' },
  btnText: { fontSize: 13, fontWeight: '700', color: PASTEL_COLORS.text },
  btnTextDanger: { color: '#c0706a' },
});
