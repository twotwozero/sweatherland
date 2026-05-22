import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGame } from '../../providers/GameProvider';
import { PASTEL_COLORS } from '../../constants';
import type { ShopItem } from '../../types';
import AdminPanel from '../../components/AdminPanel';

export default function ShopScreen() {
  const { state, buyItem, equipItem, unequipItem, resetGame } = useGame();
  const router = useRouter();
  const { shopItems, player, creature } = state;
  const [tab, setTab] = useState<'accessory' | 'background'>('accessory');
  const [adminVisible, setAdminVisible] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTitleTap() {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setAdminVisible(true);
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    }
  }

  const filtered = shopItems.filter((i) => i.type === tab);
  const equipped = creature?.equippedItems ?? [];

  function handleBuy(item: ShopItem) {
    if (!player) return;
    if (player.sweatDrops < item.price) {
      Alert.alert('땀방울 부족', `땀방울이 ${item.price - player.sweatDrops}개 더 필요해요.\n행동 퀘스트를 완료하면 땀방울을 얻을 수 있어요!`);
      return;
    }
    buyItem(item.id);
  }

  function handleEquip(item: ShopItem) {
    if (!item.unlocked) return;
    if (equipped.includes(item.id)) {
      unequipItem(item.id);
    } else {
      equipItem(item.id);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AdminPanel visible={adminVisible} onClose={() => setAdminVisible(false)} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleTitleTap} activeOpacity={1}>
            <Text style={styles.title}>🛍️ 상점 & 방 꾸미기</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>💧 {player?.sweatDrops ?? 0}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>행동 퀘스트를 완료하면 땀방울을 얻어요</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'accessory' && styles.tabActive]}
            onPress={() => setTab('accessory')}
          >
            <Text style={[styles.tabText, tab === 'accessory' && styles.tabTextActive]}>액세서리</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'background' && styles.tabActive]}
            onPress={() => setTab('background')}
          >
            <Text style={[styles.tabText, tab === 'background' && styles.tabTextActive]}>배경</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {filtered.map((item) => {
            const isEquipped = equipped.includes(item.id);
            return (
              <View key={item.id} style={[styles.card, isEquipped && styles.cardEquipped]}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.unlocked ? (
                  <TouchableOpacity
                    style={[styles.btn, isEquipped ? styles.btnEquipped : styles.btnUnequip]}
                    onPress={() => handleEquip(item)}
                  >
                    <Text style={styles.btnText}>{isEquipped ? '착용 중 ✓' : '착용하기'}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnBuy]}
                    onPress={() => handleBuy(item)}
                  >
                    <Text style={styles.btnText}>💧 {item.price}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.earnInfo}>
          <Text style={styles.earnTitle}>💧 땀방울 얻는 방법</Text>
          <Text style={styles.earnText}>• 행동 퀘스트 완료: 3~8 땀방울</Text>
          <Text style={styles.earnText}>• 일기 쓰기: 7 땀방울</Text>
          <Text style={styles.earnText}>• 친구 안부 보내기: 6 땀방울</Text>
        </View>

        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => {
            Alert.alert(
              '게임 초기화',
              '모든 데이터가 삭제되고 처음부터 다시 시작해요.\n정말 초기화할까요?',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '초기화',
                  style: 'destructive',
                  onPress: async () => {
                    await resetGame();
                    router.replace('/onboarding');
                  },
                },
              ],
            );
          }}
        >
          <Text style={styles.resetBtnText}>게임 초기화</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PASTEL_COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', color: PASTEL_COLORS.text },
  badge: {
    backgroundColor: PASTEL_COLORS.secondary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  badgeText: { fontSize: 14, fontWeight: '700', color: PASTEL_COLORS.text },
  subtitle: { fontSize: 13, color: PASTEL_COLORS.textLight, marginBottom: 20 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tabBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center',
    backgroundColor: PASTEL_COLORS.white, borderWidth: 1.5, borderColor: PASTEL_COLORS.border,
  },
  tabActive: { backgroundColor: PASTEL_COLORS.primary, borderColor: PASTEL_COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: PASTEL_COLORS.textLight },
  tabTextActive: { color: PASTEL_COLORS.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: {
    width: '47%', backgroundColor: PASTEL_COLORS.white, borderRadius: 20,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardEquipped: { borderWidth: 2, borderColor: PASTEL_COLORS.primary },
  itemEmoji: { fontSize: 40, marginBottom: 8 },
  itemName: { fontSize: 14, fontWeight: '600', color: PASTEL_COLORS.text, marginBottom: 10, textAlign: 'center' },
  btn: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center', width: '100%' },
  btnBuy: { backgroundColor: PASTEL_COLORS.secondary },
  btnEquipped: { backgroundColor: PASTEL_COLORS.primary },
  btnUnequip: { backgroundColor: PASTEL_COLORS.border },
  btnText: { fontSize: 13, fontWeight: '700', color: PASTEL_COLORS.text },
  earnInfo: {
    backgroundColor: PASTEL_COLORS.white, borderRadius: 20, padding: 20,
  },
  earnTitle: { fontSize: 15, fontWeight: '700', color: PASTEL_COLORS.text, marginBottom: 10 },
  earnText: { fontSize: 13, color: PASTEL_COLORS.textLight, marginBottom: 4 },
  resetBtn: {
    marginTop: 32, paddingVertical: 14, borderRadius: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0b0b0',
  },
  resetBtnText: { fontSize: 14, fontWeight: '600', color: '#c0706a' },
});
