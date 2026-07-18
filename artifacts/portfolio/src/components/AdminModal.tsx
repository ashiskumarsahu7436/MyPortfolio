import { useEffect, useRef, useState, useCallback } from "react";
import { authApi, session } from "@/lib/api";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (token: string) => void;
}

type Mode = "loading" | "setup" | "login" | "reset";

interface FieldState {
  userId: string;
  password: string;
  confirmPassword: string;
  newUserId: string;
  newPassword: string;
  confirmNewPassword: string;
}

const emptyFields: FieldState = {
  userId: "",
  password: "",
  confirmPassword: "",
  newUserId: "",
  newPassword: "",
  confirmNewPassword: "",
};

// Shared input style
const INPUT =
  "bg-[#0c0c0e] border border-border rounded-xl px-4 py-3 text-sm w-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";

export function AdminModal({ isOpen, onClose, onAuthenticated }: AdminModalProps) {
  const [mode, setMode] = useState<Mode>("loading");
  const [fields, setFields] = useState<FieldState>(emptyFields);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check setup status whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setFields(emptyFields);
    setLoading(false);
    setMode("loading");

    authApi
      .status()
      .then(({ setup }) => setMode(setup ? "login" : "setup"))
      .catch(() => setMode("login")); // fall back to login if network issue
  }, [isOpen]);

  // ESC key + body scroll lock
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const set = useCallback((key: keyof FieldState, value: string) => {
    setError(null);
    setFields((f) => ({ ...f, [key]: value }));
  }, []);

  const handleSuccess = useCallback(
    (token: string) => {
      session.save(token);
      onAuthenticated(token);
      onClose();
    },
    [onAuthenticated, onClose]
  );

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.userId.trim().length < 3) {
      setError("User ID must be at least 3 characters.");
      return;
    }
    if (fields.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (fields.password !== fields.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token } = await authApi.setup(fields.userId.trim(), fields.password);
      handleSuccess(token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.userId || !fields.password) {
      setError("Please enter your User ID and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token } = await authApi.login(fields.userId.trim(), fields.password);
      handleSuccess(token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.userId || !fields.password) {
      setError("Please enter your current credentials.");
      return;
    }
    if (fields.newUserId.trim().length < 3) {
      setError("New User ID must be at least 3 characters.");
      return;
    }
    if (fields.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (fields.newPassword !== fields.confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token } = await authApi.reset(
        fields.userId.trim(),
        fields.password,
        fields.newUserId.trim(),
        fields.newPassword
      );
      handleSuccess(token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl"
      >
        {/* ── LOADING ── */}
        {mode === "loading" && (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Checking credentials…</p>
          </div>
        )}

        {/* ── SETUP (first run) ── */}
        {mode === "setup" && (
          <>
            <h2 className="font-semibold text-lg text-foreground">Set up admin access</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Create your User ID and password. You'll need them every time you log in.
            </p>
            <form onSubmit={handleSetup} className="flex flex-col gap-4">
              <Field label="User ID" hint="min. 3 characters">
                <input
                  type="text"
                  className={INPUT}
                  placeholder="e.g. ashis"
                  value={fields.userId}
                  onChange={(e) => set("userId", e.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="Password" hint="min. 8 characters">
                <input
                  type="password"
                  className={INPUT}
                  placeholder="Choose a strong password"
                  value={fields.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </Field>
              <Field label="Confirm password">
                <input
                  type="password"
                  className={INPUT}
                  placeholder="Repeat your password"
                  value={fields.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                />
              </Field>
              <ErrorBanner message={error} />
              <Actions onCancel={onClose} submitLabel="Create account" loading={loading} />
            </form>
          </>
        )}

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <>
            <h2 className="font-semibold text-lg text-foreground">Admin access</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Enter your credentials to access the dashboard.
            </p>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Field label="User ID">
                <input
                  type="text"
                  className={INPUT}
                  placeholder="Your User ID"
                  value={fields.userId}
                  onChange={(e) => set("userId", e.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  className={INPUT}
                  placeholder="Your password"
                  value={fields.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </Field>
              <ErrorBanner message={error} />
              <Actions onCancel={onClose} submitLabel="Sign in" loading={loading} />
            </form>
            <button
              type="button"
              onClick={() => { setMode("reset"); setError(null); setFields(emptyFields); }}
              className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Change credentials
            </button>
          </>
        )}

        {/* ── RESET ── */}
        {mode === "reset" && (
          <>
            <h2 className="font-semibold text-lg text-foreground">Change credentials</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Verify your current credentials, then set a new User ID and password.
            </p>
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Current credentials
              </p>
              <Field label="Current User ID">
                <input
                  type="text"
                  className={INPUT}
                  placeholder="Your current User ID"
                  value={fields.userId}
                  onChange={(e) => set("userId", e.target.value)}
                  autoFocus
                />
              </Field>
              <Field label="Current password">
                <input
                  type="password"
                  className={INPUT}
                  placeholder="Your current password"
                  value={fields.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </Field>

              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2">
                New credentials
              </p>
              <Field label="New User ID" hint="min. 3 characters">
                <input
                  type="text"
                  className={INPUT}
                  placeholder="New User ID"
                  value={fields.newUserId}
                  onChange={(e) => set("newUserId", e.target.value)}
                />
              </Field>
              <Field label="New password" hint="min. 8 characters">
                <input
                  type="password"
                  className={INPUT}
                  placeholder="New password"
                  value={fields.newPassword}
                  onChange={(e) => set("newPassword", e.target.value)}
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  className={INPUT}
                  placeholder="Repeat new password"
                  value={fields.confirmNewPassword}
                  onChange={(e) => set("confirmNewPassword", e.target.value)}
                />
              </Field>

              <ErrorBanner message={error} />
              <Actions onCancel={() => { setMode("login"); setError(null); setFields(emptyFields); }} submitLabel="Update credentials" loading={loading} />
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Small reusable sub-components ── */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  );
}

function Actions({
  onCancel,
  submitLabel,
  loading,
}: {
  onCancel: () => void;
  submitLabel: string;
  loading: boolean;
}) {
  return (
    <div className="mt-2 flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="border border-border bg-transparent text-foreground rounded-xl px-4 py-3 text-sm font-medium flex-1 transition-colors hover:bg-white/5 disabled:opacity-40"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-primary-foreground rounded-xl px-4 py-3 text-sm font-semibold flex-1 transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && (
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
        )}
        {submitLabel}
      </button>
    </div>
  );
}
