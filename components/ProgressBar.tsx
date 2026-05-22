import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PASTEL_COLORS } from '../constants';

interface Props {
  progress: number; // 0–1
  label?: string;
  color?: string;
  height?: number;
}

export default function ProgressBar({ progress, label, color = PASTEL_COLORS.primary, height = 12 }: Props) {
  const pct = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color, height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  label: { fontSize: 12, color: PASTEL_COLORS.textLight, marginBottom: 4 },
  track: {
    backgroundColor: PASTEL_COLORS.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: { borderRadius: 999 },
});
