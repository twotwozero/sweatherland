import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Stats } from '../types';
import { PASTEL_COLORS, STAT_LABELS } from '../constants';

interface Props {
  stats: Stats;
}

export default function StatGrid({ stats }: Props) {
  return (
    <View style={styles.grid}>
      {(Object.keys(stats) as (keyof Stats)[]).map((key) => {
        const { label, emoji } = STAT_LABELS[key];
        return (
          <View key={key} style={styles.item}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.value}>{stats[key]}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8,
  },
  item: {
    width: '30%', alignItems: 'center',
    backgroundColor: PASTEL_COLORS.background, borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 4,
  },
  emoji: { fontSize: 20 },
  value: { fontSize: 18, fontWeight: '700', color: PASTEL_COLORS.text, marginTop: 3 },
  label: { fontSize: 11, color: PASTEL_COLORS.textLight, marginTop: 1 },
});
