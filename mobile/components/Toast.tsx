// ══ TOAST VIEWPORT (RN port) — global notification UI ═════════════════════
// RN twin of src/react/components/Toast.tsx. Renders all active toasts from the
// SHARED `toast` store (src/react/lib/toast.ts) — that store is pure module
// pub/sub (no DOM), so RN consumes it unchanged via useSyncExternalStore. Mount
// once at app root. Same testIDs (toast-viewport / toast-{id} / -dismiss),
// same role/aria semantics mapped to RN accessibility props, same variant icons
// (lucide-react-native). Bottom-center, above BottomNav. Auto-dismiss per item.

import { useEffect, useState, useSyncExternalStore } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react-native';
import { toast, type ToastItem, type ToastVariant } from '../../src/react/lib/toast';
import { useTheme } from '../lib/theme';
import { t } from '../../src/i18n/index.js';

function VariantIcon({ variant, color }: { variant: ToastVariant; color: string }) {
  const props = { size: 16, color };
  switch (variant) {
    case 'success':
      return <CheckCircle2 {...props} />;
    case 'warning':
      return <AlertTriangle {...props} />;
    case 'error':
    case 'critical':
      return <AlertCircle {...props} />;
    case 'info':
    default:
      return <Info {...props} />;
  }
}

function variantLive(variant: ToastVariant): 'polite' | 'assertive' {
  return variant === 'error' || variant === 'critical' ? 'assertive' : 'polite';
}

function ToastCard({ item }: { item: ToastItem }) {
  const { colors } = useTheme();
  useEffect(() => {
    if (item.durationMs <= 0) return;
    const handle = setTimeout(() => toast.dismiss(item.id), item.durationMs);
    return () => clearTimeout(handle);
  }, [item.id, item.durationMs]);

  return (
    <View
      testID={`toast-${item.id}`}
      accessibilityRole="alert"
      accessibilityLiveRegion={variantLive(item.variant)}
      className="flex-row items-center border border-line bg-paper-2"
      style={{
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        maxWidth: 384,
        backgroundColor: colors.paper2,
        borderColor: colors.line,
      }}
    >
      <VariantIcon variant={item.variant} color={colors.brick} />
      <Text style={{ flex: 1, fontSize: 14, color: colors.ink }}>
        {item.message as string}
      </Text>
      {item.dismissible && (
        <Pressable
          testID={`toast-${item.id}-dismiss`}
          accessibilityRole="button"
          accessibilityLabel={t('toast.dismissAria')}
          onPress={() => toast.dismiss(item.id)}
          style={{ padding: 4 }}
        >
          <X size={16} color={colors.ink2} />
        </Pressable>
      )}
    </View>
  );
}

function subscribe(cb: () => void): () => void {
  return toast.subscribe(() => cb());
}
function getSnapshot(): readonly ToastItem[] {
  return toast.getSnapshot();
}

export function ToastViewport() {
  const itemsFromStore = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [mirrored, setMirrored] = useState<readonly ToastItem[]>(itemsFromStore);
  useEffect(() => {
    setMirrored(itemsFromStore);
  }, [itemsFromStore]);

  if (mirrored.length === 0) return null;

  return (
    <View
      testID="toast-viewport"
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 80,
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        zIndex: 50,
      }}
    >
      {mirrored.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </View>
  );
}
