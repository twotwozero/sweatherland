import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import type { Creature, ShopItem } from '../types';
import { STAGE_EMOJI, FINAL_TYPE_INFO } from '../constants';

interface Props {
  creature: Creature;
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  equippedItems?: string[];
  shopItems?: ShopItem[];
}

export default function CreatureDisplay({
  creature,
  size = 'medium',
  animate = true,
  equippedItems = [],
  shopItems = [],
}: Props) {
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

  const creatureFontSize = size === 'large' ? 80 : size === 'medium' ? 56 : 32;
  const bgFontSize = size === 'large' ? 130 : size === 'medium' ? 90 : 56;
  const accessoryFontSize = size === 'large' ? 20 : size === 'medium' ? 16 : 12;

  const equippedShopItems = shopItems.filter(
    (i) => i.unlocked && equippedItems.includes(i.id),
  );
  const background = equippedShopItems.find((i) => i.type === 'background');
  const accessories = equippedShopItems.filter((i) => i.type === 'accessory');

  return (
    <View style={styles.wrapper}>
      {background && (
        <Text style={[styles.bgEmoji, { fontSize: bgFontSize }]}>
          {background.emoji}
        </Text>
      )}
      <Animated.View style={{ transform: [{ translateY: bounce }], alignItems: 'center' }}>
        <Text style={{ fontSize: creatureFontSize, textAlign: 'center' }}>{emoji}</Text>
      </Animated.View>
      {accessories.length > 0 && (
        <View style={styles.accessoryRow}>
          {accessories.map((a) => (
            <Text key={a.id} style={{ fontSize: accessoryFontSize }}>{a.emoji}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  bgEmoji: {
    position: 'absolute',
    opacity: 0.12,
    textAlign: 'center',
  },
  accessoryRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
