import { useEffect } from 'react';

const TOAST_DURATION_MS = 2500;

export type ToastVariant = 'toast' | 'error';

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, variant, onDismiss, durationMs = TOAST_DURATION_MS }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [onDismiss, durationMs]);

  const isError = variant === 'error';
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        maxWidth: 'calc(100% - 32px)',
        padding: '10px 16px',
        fontFamily: 'Calibre, sans-serif',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: isError ? 'var(--destructive-foreground, #fff)' : 'var(--foreground)',
        backgroundColor: isError ? 'var(--destructive, #dc2626)' : 'var(--card)',
        border: `1px solid ${isError ? 'var(--destructive)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}
