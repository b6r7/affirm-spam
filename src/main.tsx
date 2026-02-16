import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './app/i18n/config';
import App from './app/App.tsx';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import { PasswordGate } from './app/components/PasswordGate';
import './styles/index.css';

const isFigmaPlugin =
  typeof globalThis !== 'undefined' && 'figma' in globalThis;

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<p style="padding:1rem;font-family:sans-serif;">Root element #root not found.</p>';
} else {
  try {
    const root = createRoot(rootEl);
    const app = (
      <ErrorBoundary>
        <Suspense fallback={<div style={{ padding: '2rem', fontFamily: 'sans-serif', fontSize: 14 }}>Loading…</div>}>
          <App />
        </Suspense>
      </ErrorBoundary>
    );
    root.render(
      isFigmaPlugin ? app : <PasswordGate>{app}</PasswordGate>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    rootEl.innerHTML = `<p style="padding:1rem;font-family:sans-serif;color:#c00;">Error: ${message}</p>`;
  }
}
