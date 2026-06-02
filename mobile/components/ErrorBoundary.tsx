// ══ ERROR BOUNDARY (RN port) — per-route fallback UI ══════════════════════
// RN twin of src/react/components/ErrorBoundary.tsx. Catches render errors,
// shows a fallback with retry + reload. Same props (children / fallbackTitle),
// same testIDs (error-boundary / error-reset / error-reload), same i18n keys.
// Reuses the SHARED, bundler-decoupled util layer (src/util/sentry.js +
// logger.js — both RN-safe via the env shim) so observability stays
// single-source. RN has no window.location.reload; "reload" re-mounts the
// subtree by resetting state (the closest native equivalent — a full app
// relaunch is the user's OS-level action).

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { captureException } from '../../src/util/sentry.js';
import { logger } from '../../src/util/logger.js';
import { dark } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('[ErrorBoundary] caught render error:', error, errorInfo);
    captureException(error, {
      tags: { source: 'react-error-boundary' },
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View
          testID="error-boundary"
          accessibilityRole="alert"
          className="bg-paper"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <Text style={{ fontSize: 20, fontWeight: '600', color: dark.ink, marginBottom: 8, textAlign: 'center' }}>
            {this.props.fallbackTitle ?? t('errorBoundary.title')}
          </Text>
          <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 24, maxWidth: 280, textAlign: 'center' }}>
            {t('errorBoundary.body')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Pressable
              testID="error-reset"
              accessibilityRole="button"
              onPress={this.handleReset}
              className="bg-brick"
              style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: dark.paper }}>
                {t('errorBoundary.retryCta')}
              </Text>
            </Pressable>
            <Pressable
              testID="error-reload"
              accessibilityRole="button"
              onPress={this.handleReset}
              className="bg-paper-2 border border-line-strong"
              style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
                {t('errorBoundary.reloadCta')}
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}
