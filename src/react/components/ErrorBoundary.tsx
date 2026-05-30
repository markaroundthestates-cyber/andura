// ══ ERROR BOUNDARY — Phase 5 task_19 Per-Route Fallback UI ═══════════════
// React Error Boundary catches unhandled component render errors. Renders
// fallback UI cu "Inapoi la Antrenor" + reload option.
// §13-C1 + §4-C1 audit fix — wires Sentry captureException with componentStack
// extra (was console.error only — invisible to production observability).

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { captureException } from '../../util/sentry.js';
import { logger } from '../../util/logger.js';
import { t } from '../../i18n/index.js';

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
    // §13-C1 audit fix — surface to Sentry (production observability) +
    // preserve console for dev. Sentry no-ops on localhost (sentry.js gate).
    logger.error('[ErrorBoundary] caught render error:', error, errorInfo);
    captureException(error, {
      tags: { source: 'react-error-boundary' },
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section
          className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 text-center"
          data-testid="error-boundary"
          role="alert"
        >
          <h1 className="text-xl font-semibold text-ink mb-2">
            {this.props.fallbackTitle ?? t('errorBoundary.title')}
          </h1>
          <p className="text-sm text-ink2 mb-6 max-w-xs">
            {t('errorBoundary.body')}
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              data-testid="error-reset"
              className="px-5 py-3 bg-brick text-paper rounded-[14px] text-sm font-semibold"
            >
              {t('errorBoundary.retryCta')}
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              data-testid="error-reload"
              className="px-5 py-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold"
            >
              {t('errorBoundary.reloadCta')}
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
