/** Plugin UI entry (React). IIFE for Figma sandbox. */
import { createRoot } from 'react-dom/client';
import { useEffect, useState, useCallback, useRef, type CSSProperties } from 'react';
import JSZip from 'jszip';
import { AppView } from '@/app/AppView';
import { Toast } from '@/app/components/Toast';
import { getSystemEmailContent } from 'figma-plugin/translations';
import type { AppState, MessageFromMain, MessageFromUI, Locale, Tone, Variant, EmailContent } from 'figma-plugin/messageTypes';
import './ui.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerText = 'Missing #root';
  throw new Error('Missing #root');
}
rootEl.innerHTML =
  '<div style="padding:16px;font-family:sans-serif;font-size:14px;color:#000;background:#fff;min-height:100%;display:flex;align-items:center;justify-content:center;">Loading UI...</div>';

function showErrorOverlay(message: string, stack?: string, source?: string, line?: number, col?: number) {
  try {
    const existing = document.getElementById('affirm-spam-error-overlay');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'affirm-spam-error-overlay';
    div.setAttribute(
      'style',
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);color:#fff;font-family:sans-serif;font-size:14px;padding:24px;overflow:auto;'
    );
    let loc = '';
    if (source != null && source !== '') loc += source;
    if (line != null) loc += (loc ? ' ' : '') + 'line ' + line;
    if (col != null) loc += (loc ? ', ' : '') + 'col ' + col;
    div.innerHTML =
      '<div style="margin-bottom:12px;font-weight:bold;">Plugin UI error</div>' +
      '<pre style="white-space:pre-wrap;word-break:break-word;margin:0 0 12px 0;color:#ffb3b3;">' +
      String(message).replace(/</g, '&lt;') +
      '</pre>' +
      (loc ? '<div style="margin-bottom:12px;font-size:12px;color:#aaa;">' + String(loc).replace(/</g, '&lt;') + '</div>' : '') +
      (stack
        ? '<pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-size:12px;color:#ccc;">' +
          String(stack).replace(/</g, '&lt;') +
          '</pre>'
        : '');
    document.body.appendChild(div);
  } catch (_) {
    document.body.innerHTML =
      '<div style="padding:16px;font-family:sans-serif;font-size:14px;color:#000;background:#fff;">Plugin UI error: ' +
      String(message).replace(/</g, '&lt;') +
      '</div>';
  }
}

window.onerror = function (message, source, lineno, colno, error) {
  const stack = error && error.stack ? error.stack : undefined;
  showErrorOverlay(String(message), stack, source ?? undefined, lineno, colno);
  return false;
};

window.onunhandledrejection = function (event) {
  const message = event.reason != null ? String(event.reason) : 'Unhandled promise rejection';
  const stack = event.reason && event.reason.stack ? event.reason.stack : undefined;
  showErrorOverlay(message, stack);
  event.preventDefault();
};

const INIT_RETRY_MS = 500;
const INIT_RETRY_MAX = 5;
const WAITING_FALLBACK_MS = 2000;

function SyncConflictModal({
  remoteUpdatedAt,
  remoteUpdatedBy,
  onPull,
  onOverwrite,
  onCancel,
}: {
  remoteUpdatedAt: string;
  remoteUpdatedBy?: string;
  onPull: () => void;
  onOverwrite: () => void;
  onCancel: () => void;
}) {
  const by = remoteUpdatedBy ? ` by ${remoteUpdatedBy}` : '';
  const time = (() => {
    try {
      const d = new Date(remoteUpdatedAt);
      return isNaN(d.getTime()) ? remoteUpdatedAt : d.toLocaleString();
    } catch {
      return remoteUpdatedAt;
    }
  })();
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 20,
          maxWidth: 400,
          fontFamily: 'sans-serif',
          fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Sync conflict</div>
        <p style={{ margin: '0 0 16px 0', color: '#333' }}>
          A newer library exists in this file (updated{by}: {time}). Pull first or overwrite?
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onPull}
            style={{
              padding: '8px 14px',
              fontFamily: 'sans-serif',
              fontSize: 13,
              cursor: 'pointer',
              background: '#0d0d0d',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
            }}
          >
            Pull
          </button>
          <button
            type="button"
            onClick={onOverwrite}
            style={{
              padding: '8px 14px',
              fontFamily: 'sans-serif',
              fontSize: 13,
              cursor: 'pointer',
              background: '#fff',
              color: '#0d0d0d',
              border: '1px solid #ccc',
              borderRadius: 6,
            }}
          >
            Overwrite
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 14px',
              fontFamily: 'sans-serif',
              fontSize: 13,
              cursor: 'pointer',
              background: 'transparent',
              color: '#666',
              border: 'none',
              borderRadius: 6,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const fullscreenCenteredStyle: CSSProperties = {
  padding: 16,
  fontFamily: 'sans-serif',
  fontSize: 14,
  color: '#111',
  backgroundColor: '#fff',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

function sendInit() {
  const parent = (window as unknown as { parent: { postMessage?: (payload: unknown) => void } }).parent;
  if (parent?.postMessage) parent.postMessage({ pluginMessage: { type: 'INIT' } }, '*');
}

try {
  sendInit();
} catch (_) {}

function PluginBridge() {
  const [state, setState] = useState<AppState | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'toast' | 'error' } | null>(null);
  const [showWaitingFallback, setShowWaitingFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stateReceivedRef = useRef(false);
  const initAttemptRef = useRef(0);
  const templateIdRef = useRef<string>('');

  const [syncConflict, setSyncConflict] = useState<{
    remoteUpdatedAt: string;
    remoteUpdatedBy?: string;
  } | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data && (event.data as { pluginMessage?: MessageFromMain }).pluginMessage;
      if (!msg) return;
      if (msg.type === 'STATE') {
        stateReceivedRef.current = true;
        const s = msg.state;
        templateIdRef.current = s?.selectedTemplateId ?? '';
        setState(s);
        setErrorMessage(null);
      } else if (msg.type === 'TOAST') {
        setToast({ message: msg.message, variant: 'toast' });
      } else if (msg.type === 'ERROR') {
        setToast({ message: msg.message, variant: 'error' });
        if (!stateReceivedRef.current) setErrorMessage(msg.message);
      } else if (msg.type === 'SYNC_CONFLICT') {
        setSyncConflict({
          remoteUpdatedAt: msg.remoteUpdatedAt,
          remoteUpdatedBy: msg.remoteUpdatedBy,
        });
      } else if (msg.type === 'LIBRARY_JSON_FOR_DOWNLOAD') {
        const filename = 'comms-forge.locales.json';
        const blob = new Blob([msg.json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else if (msg.type === 'LIBRARY_JSON_FOR_DOWNLOAD_MULTI') {
        const files = msg.files ?? [];
        (async () => {
          if (files.length === 0) return;
          if (files.length === 1) {
            const { locale, json } = files[0];
            const filename = `comms-forge.${locale}.json`;
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            setToast({ message: 'Exported 1 locale file', variant: 'toast' });
            return;
          }
          const zip = new JSZip();
          for (const { locale, json } of files) {
            zip.file(`comms-forge.${locale}.json`, json);
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'comms-forge.locales.zip';
          a.click();
          URL.revokeObjectURL(url);
          setToast({ message: `Exported ${files.length} locale files as ZIP`, variant: 'toast' });
        })();
      } else if (msg.type === 'VARIABLE_NAMES_DUMP') {
        const text = (msg.lines ?? []).join('\n');
        const copyViaClipboard = () => {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.setAttribute('readonly', '');
          document.body.appendChild(textarea);
          textarea.select();
          try {
            const ok = document.execCommand('copy');
            return ok ? Promise.resolve() : Promise.reject(new Error('execCommand copy failed'));
          } finally {
            document.body.removeChild(textarea);
          }
        };
        copyViaClipboard()
          .then(() => setToast({ message: 'Variable names copied to clipboard', variant: 'toast' }))
          .catch(() => setToast({ message: 'Copy failed; check console for variable list', variant: 'error' }));
      }
    };

    window.addEventListener('message', handleMessage);
    const trySendInit = () => {
      initAttemptRef.current += 1;
      sendInit();
    };
    trySendInit();

    const retryId = setInterval(() => {
      if (stateReceivedRef.current) return clearInterval(retryId);
      if (initAttemptRef.current >= INIT_RETRY_MAX) return clearInterval(retryId);
      trySendInit();
    }, INIT_RETRY_MS);

    const fallbackId = setTimeout(() => {
      if (!stateReceivedRef.current) setShowWaitingFallback(true);
    }, WAITING_FALLBACK_MS);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(retryId);
      clearTimeout(fallbackId);
    };
  }, []);

  const dispatch = (msg: MessageFromUI) => {
    (window as unknown as { parent: { postMessage: (payload: unknown) => void } }).parent.postMessage(
      { pluginMessage: msg },
      '*'
    );
  };

  const handleSyncPull = useCallback(() => {
    setSyncConflict(null);
    dispatch({ type: 'PULL_FROM_FILE' });
  }, []);

  const handleSyncOverwrite = useCallback(() => {
    setSyncConflict(null);
    dispatch({ type: 'SYNC_OVERWRITE_CONFIRMED' });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);
  const retryInit = useCallback(() => {
    initAttemptRef.current = 0;
    sendInit();
  }, []);
  const copyVariableNames = useCallback(() => {
    (window as unknown as { parent: { postMessage: (payload: unknown) => void } }).parent.postMessage(
      { pluginMessage: { type: 'COPY_VARIABLE_NAMES_DEBUG' } },
      '*'
    );
  }, []);

  const handleImportTranslations = useCallback((json: string) => {
    dispatch({
      type: 'IMPORT_TRANSLATIONS',
      templateId: templateIdRef.current,
      json,
    });
  }, [dispatch]);

  if (errorMessage) {
    return (
      <div style={fullscreenCenteredStyle}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Error</div>
        <div style={{ marginBottom: 12, color: '#c00' }}>{errorMessage}</div>
        <button type="button" onClick={retryInit} style={{ padding: '8px 16px', fontFamily: 'sans-serif', fontSize: 14, cursor: 'pointer', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 6 }}>
          Retry INIT
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={fullscreenCenteredStyle}>
        {showWaitingFallback ? (
          <>
            <div style={{ marginBottom: 12 }}>UI connected, waiting for main thread…</div>
            <button type="button" onClick={retryInit} style={{ padding: '8px 16px', fontFamily: 'sans-serif', fontSize: 14, cursor: 'pointer', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 6 }}>
              Retry INIT
            </button>
          </>
        ) : (
          'Waiting for plugin state…'
        )}
      </div>
    );
  }

  return (
    <PluginMainContent
      state={state}
      dispatch={dispatch}
      getSystemEmailContent={getSystemEmailContent}
      onImportTranslations={handleImportTranslations}
      copyVariableNames={copyVariableNames}
      toast={toast}
      dismissToast={dismissToast}
      syncConflict={syncConflict}
      handleSyncPull={handleSyncPull}
      handleSyncOverwrite={handleSyncOverwrite}
      setSyncConflictNull={() => setSyncConflict(null)}
    />
  );
}

function PluginMainContent({
  state,
  dispatch,
  getSystemEmailContent,
  onImportTranslations,
  copyVariableNames,
  toast,
  dismissToast,
  syncConflict,
  handleSyncPull,
  handleSyncOverwrite,
  setSyncConflictNull,
}: {
  state: AppState;
  dispatch: (msg: MessageFromUI) => void;
  getSystemEmailContent: (params: { templateId: string; locale: Locale; tone: Tone; variant: Variant }) => EmailContent;
  onImportTranslations: (json: string) => void;
  copyVariableNames: () => void;
  toast: { message: string; variant: 'toast' | 'error' } | null;
  dismissToast: () => void;
  syncConflict: { remoteUpdatedAt: string; remoteUpdatedBy?: string } | null;
  handleSyncPull: () => void;
  handleSyncOverwrite: () => void;
  setSyncConflictNull: () => void;
}) {
  return (
    <>
      <AppView
        state={state}
        dispatch={dispatch}
        getSystemEmailContent={getSystemEmailContent}
        onImportTranslations={onImportTranslations}
      />
      <div style={{ padding: '8px 16px', borderTop: '1px solid #eee', fontSize: 11, color: '#666' }}>
        <button
          type="button"
          onClick={copyVariableNames}
          style={{ background: 'none', border: 'none', color: '#4A4AF4', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          Dev: Copy variable names
        </button>
      </div>
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
      {syncConflict && (
        <SyncConflictModal
          remoteUpdatedAt={syncConflict.remoteUpdatedAt}
          remoteUpdatedBy={syncConflict.remoteUpdatedBy}
          onPull={handleSyncPull}
          onOverwrite={handleSyncOverwrite}
          onCancel={setSyncConflictNull}
        />
      )}
    </>
  );
}

try {
  createRoot(rootEl).render(<PluginBridge />);
  if (typeof console !== 'undefined') console.log('Plugin UI mounted');
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  showErrorOverlay(msg, stack || '', undefined, undefined, undefined);
}
