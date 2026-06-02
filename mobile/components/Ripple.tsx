// ══ RIPPLE (RN port) — tap ripple parity shim ═════════════════════════════
// RN twin of src/react/components/Ripple.tsx. Same props (`color?`), same
// drop-in usage (mount inside a relative host). On the web the component
// attaches a pointerdown listener to its PARENT DOM node and spawns CSS-keyframe
// dots at the tap point — there is no parent-listener equivalent in RN, and a
// pointer-events:none overlay cannot receive touches.
//
// FIDELITY FLAG: native tap feedback on RN is the host `Pressable`'s own
// pressed-state / `android_ripple` (Material) — that is where the screen waves
// get the real ripple. This component is the API-parity placeholder so existing
// `<Ripple />` call sites compile unchanged; it renders an inert decorative
// overlay (no DOM parent to bind to). When a screen needs the Material splash,
// it uses Pressable's android_ripple={{ color }} directly. Kept rather than
// dropped so the shared call-site shape stays identical across the port.

import { View } from 'react-native';

interface RippleProps {
  /** Accepted for API parity; consumed by the host Pressable's native ripple. */
  color?: string;
}

export function Ripple(_props: RippleProps = {}) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    />
  );
}
