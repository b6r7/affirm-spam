/**
 * Affirm SPAM Figma plugin — UI entry.
 * Bridge: send INIT, receive STATE from main; render AppView with state + dispatch (postMessage).
 * System content comes from static translations (no i18next in plugin runtime).
 * Centralized handling of TOAST and ERROR from MAIN (non-intrusive top-center toast, 2.5s).
 */

import { createRoot } from 'react-dom/client';
import { useEffect, useState, useCallback } from 'react';
import { AppView } from '@/app/AppView';
import { Toast } from '@/app/components/Toast';
import { getSystemEmailContent } from './translations';
import type { AppState, MessageFromMain } from './messageTypes';
import './ui.css';

function PluginBridge() {
  const [state, setState] = useState<AppState | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'toast' | 'error' } | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as MessageFromMain | undefined;
      if (!msg) return;
      if (msg.type === 'STATE') {
        setState(msg.state);
      } else if (msg.type === 'TOAST') {
        setToast({ message: msg.message, variant: 'toast' });
      } else if (msg.type === 'ERROR') {
        setToast({ message: msg.message, variant: 'error' });
      }
    };

    window.addEventListener('message', handleMessage);
    (window as unknown as { parent: { postMessage: (payload: unknown) => void } }).parent.postMessage(
      { pluginMessage: { type: 'INIT' } },
      '*'
    );

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const dispatch = (msg: import('./messageTypes').MessageFromUI) => {
    (window as unknown as { parent: { postMessage: (payload: unknown) => void } }).parent.postMessage(
      { pluginMessage: msg },
      '*'
    );
  };

  const dismissToast = useCallback(() => setToast(null), []);

  if (!state) {
    return (
      <div style={{ padding: 16, fontFamily: 'sans-serif', fontSize: 14, color: 'var(--muted-foreground)' }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <AppView
        state={state}
        dispatch={dispatch}
        getSystemEmailContent={getSystemEmailContent}
      />
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      )}
    </>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<PluginBridge />);
}
