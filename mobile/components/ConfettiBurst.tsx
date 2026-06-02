// ══ CONFETTI BURST (RN port) — celebratory particle burst ═════════════════
// RN twin of src/react/components/ConfettiBurst.tsx. ~14 particles fan upward
// from a single origin (host center) with random direction + rotation + scale,
// then fall + fade once over ~900ms; auto-cleans after cleanupMs. Same props
// (count / cleanupMs). Decorative (aria-hidden). Theme-aware palette draws from
// the Pulse accent tokens. The web used a CSS keyframe + CSS vars; here each
// particle animates via Reanimated. Reduced motion → no spray (renders null).

import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { accent } from '../lib/tokens';
import { useReducedMotion } from '../lib/useReducedMotion';

interface Particle {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  scale: number;
  color: string;
}

const COLORS: readonly string[] = [accent.volt, accent.aqua, accent.ember, accent.gold];
let particleCounter = 0;

function makeParticles(count: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.78);
    const magnitude = 60 + Math.random() * 70;
    const dx = Math.cos(angle) * magnitude;
    const dy = Math.sin(angle) * magnitude + 60;
    const rot = (Math.random() - 0.5) * 540;
    const scale = 0.7 + Math.random() * 0.6;
    out.push({ id: ++particleCounter, dx, dy, rot, scale, color: COLORS[i % COLORS.length] ?? accent.volt });
  }
  return out;
}

function ConfettiParticle({ p }: { p: Particle }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * p.dx },
      { translateY: progress.value * p.dy },
      { rotate: `${progress.value * p.rot}deg` },
      { scale: p.scale },
    ],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: 8, height: 8, borderRadius: 2, backgroundColor: p.color },
        style,
      ]}
    />
  );
}

interface ConfettiBurstProps {
  count?: number;
  cleanupMs?: number;
}

export function ConfettiBurst({ count = 14, cleanupMs = 1000 }: ConfettiBurstProps = {}) {
  const reduced = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>(() => (reduced ? [] : makeParticles(count)));

  useEffect(() => {
    if (reduced) return;
    const handle = setTimeout(() => setParticles([]), cleanupMs);
    return () => clearTimeout(handle);
  }, [cleanupMs, reduced]);

  if (particles.length === 0) return null;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}
    >
      {particles.map((p) => (
        <ConfettiParticle key={p.id} p={p} />
      ))}
    </View>
  );
}
