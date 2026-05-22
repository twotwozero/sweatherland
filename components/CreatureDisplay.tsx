import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import type { Creature } from '../types';
import { STAGE_EMOJI, FINAL_TYPE_INFO, PASTEL_COLORS } from '../constants';

interface Props {
  creature: Creature;
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
}

export default function CreatureDisplay({ creature, size = 'medium', animate = true }: Props) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -8, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [animate, bounce]);

  const emoji =
    creature.stage === 5 && creature.currentType
      ? FINAL_TYPE_INFO[creature.currentType].emoji
      : STAGE_EMOJI[creature.stage];

  const fontSize = size === 'large' ? 80 : size === 'medium' ? 56 : 32;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bounce }] }]}>
      <Text style={[styles.emoji, { fontSize }]}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  emoji: { textAlign: 'center' },
});
