import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {}

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            padding: '2rem',
            fontFamily: 'Calibre, sans-serif',
            maxWidth: '480px',
            margin: '2rem auto',
            border: '1px solid var(--border, #ccc)',
            borderRadius: 'var(--radius, 8px)',
            backgroundColor: 'var(--card, #fff)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--foreground, #111)' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 'var(--text-sm, 14px)', color: 'var(--muted-foreground, #666)', marginBottom: '1rem' }}>
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              fontFamily: 'inherit',
              fontSize: 'var(--text-sm, 14px)',
              fontWeight: 600,
              color: 'var(--background, #fff)',
              backgroundColor: 'var(--foreground, #111)',
              border: 'none',
              borderRadius: 'var(--radius, 8px)',
              cursor: 'pointer',
            }}
          >
            Reset app state
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
