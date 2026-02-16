import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'x_f';
const STORAGE_VALUE = '1';

// Expected SHA-256 hash of the password — not the password itself (so it never appears in sources).
// Stored as two parts to avoid a single searchable string.
const HASH_A = '7c1d6967b0dc2ec16383c95945a64f9b';
const HASH_B = '6d46dda9e962a5a6e6119b49c4baba12';

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function check(input: string): Promise<boolean> {
  return sha256Hex(input).then((h) => h === HASH_A + HASH_B);
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(STORAGE_KEY) === STORAGE_VALUE);
    } catch {
      setUnlocked(false);
    }
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!password.trim()) return;
      setSubmitting(true);
      try {
        const ok = await check(password);
        if (ok) {
          try {
            sessionStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
          } catch {}
          setUnlocked(true);
        } else {
          setError('Incorrect password.');
        }
      } catch {
        setError('Something went wrong.');
      } finally {
        setSubmitting(false);
      }
    },
    [password]
  );

  if (unlocked === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="text-zinc-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-lg border border-zinc-200 p-8">
        <h1 className="text-lg font-semibold text-zinc-900 mb-1">Access required</h1>
        <p className="text-sm text-zinc-500 mb-6">Enter the password to continue.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
