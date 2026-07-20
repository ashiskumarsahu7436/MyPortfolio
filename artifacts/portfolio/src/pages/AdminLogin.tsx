import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { authApi, session } from "@/lib/api";

const INPUT =
  "w-full rounded-xl border border-border bg-[#0c0c0e] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // If already logged in, skip to dashboard
  useEffect(() => {
    const token = session.get();
    if (!token) { setChecking(false); return; }
    authApi
      .verify(token)
      .then(({ valid }) => {
        if (valid) navigate("/admin");
        else { session.clear(); setChecking(false); }
      })
      .catch(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password) {
      setError("Please enter your User ID and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token } = await authApi.login(userId.trim(), password);
      session.save(token);
      navigate("/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="fixed inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px),
              repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)`,
          }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Portfolio CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">User ID</label>
              <input
                type="text"
                className={INPUT}
                placeholder="Your User ID"
                value={userId}
                onChange={(e) => { setUserId(e.target.value); setError(null); }}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                className={INPUT}
                placeholder="Your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 min-h-11 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Back to portfolio */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
