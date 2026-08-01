import { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }
      onLoginSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-tokyo-surface border-tokyo-border w-full max-w-sm rounded-xl border p-8 shadow-lg">

        <div className="mb-8 text-center">
          {/* A placeholder for your MC logo */}
          <div className="bg-tokyo-bg border-tokyo-border mx-auto mb-4 flex h-16 w-fit items-center justify-center rounded-lg border px-4">
            <span className="text-tokyo-accent font-bold">Atlantis</span>
          </div>
          <h1 className="text-tokyo-fg text-2xl font-bold">Admin Access</h1>
          <p className="text-tokyo-fg/70 mt-1 text-sm">Enter password to manage server</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              placeholder="Password"
              className="bg-tokyo-bg border-tokyo-border text-tokyo-fg focus:border-tokyo-accent focus:ring-tokyo-accent/20 w-full rounded-md border px-4 py-3 outline-none transition-all focus:ring-2"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-tokyo-error/10 border-tokyo-error text-tokyo-error rounded-md border p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-tokyo-accent text-tokyo-bg w-full rounded-md py-3 font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
