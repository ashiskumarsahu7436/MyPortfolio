import { useState } from "react";
import { authApi, session } from "@/lib/api";

const INPUT =
  "w-full rounded-xl border border-border bg-[#0c0c0e] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  token: string;
  onLogout: () => void;
}

export function PasswordReset({ onLogout }: Props) {
  const [form, setForm] = useState({
    userId: "", password: "",
    newUserId: "", newPassword: "", confirmNewPassword: "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (saveState === "error") setSaveState("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.userId.trim() || !form.password) {
      setErrorMsg("Please enter your current credentials.");
      setSaveState("error");
      return;
    }
    if (form.newUserId.trim().length < 3) {
      setErrorMsg("New User ID must be at least 3 characters.");
      setSaveState("error");
      return;
    }
    if (form.newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters.");
      setSaveState("error");
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      setErrorMsg("New passwords do not match.");
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    try {
      const { token } = await authApi.reset(
        form.userId.trim(), form.password,
        form.newUserId.trim(), form.newPassword
      );
      session.save(token);
      setSaveState("saved");
      setForm({ userId: "", password: "", newUserId: "", newPassword: "", confirmNewPassword: "" });
    } catch (e) {
      setErrorMsg((e as Error).message);
      setSaveState("error");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Change your admin credentials. You will be signed out after any successful change.
        </p>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Change credentials */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="pb-4 border-b border-border mb-4">
            <h3 className="text-base font-semibold text-foreground">Change Credentials</h3>
            <p className="mt-1 text-sm text-muted-foreground">Verify your current credentials, then set new ones.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current credentials</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Current User ID</label>
              <input className={INPUT} type="text" placeholder="Your current User ID" value={form.userId} onChange={e => set("userId", e.target.value)} autoComplete="username" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <input className={INPUT} type="password" placeholder="Your current password" value={form.password} onChange={e => set("password", e.target.value)} autoComplete="current-password" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-2">New credentials</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">New User ID <span className="text-muted-foreground font-normal text-xs">min. 3 characters</span></label>
              <input className={INPUT} type="text" placeholder="New User ID" value={form.newUserId} onChange={e => set("newUserId", e.target.value)} autoComplete="new-username" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">New Password <span className="text-muted-foreground font-normal text-xs">min. 8 characters</span></label>
              <input className={INPUT} type="password" placeholder="New password" value={form.newPassword} onChange={e => set("newPassword", e.target.value)} autoComplete="new-password" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <input className={INPUT} type="password" placeholder="Repeat new password" value={form.confirmNewPassword} onChange={e => set("confirmNewPassword", e.target.value)} autoComplete="new-password" />
            </div>

            {saveState === "error" && errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            {saveState === "saved" && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Credentials updated! You can now log in with your new credentials.
              </div>
            )}

            <button
              type="submit"
              disabled={saveState === "saving"}
              className="w-full min-h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
            >
              {saveState === "saving" && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              {saveState === "saving" ? "Updating…" : "Update Credentials"}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="text-base font-semibold text-foreground mb-1">Sign Out</h3>
          <p className="text-sm text-muted-foreground mb-4">Sign out from the admin panel on this device.</p>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
