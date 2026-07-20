import { useState, useEffect, useRef } from "react";
import { adminApi, type Resume } from "@/lib/adminApi";

const INPUT =
  "w-full rounded-xl border border-border bg-[#0c0c0e] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props { token: string }

export function ResumeManager({ token }: Props) {
  const [fileUrl, setFileUrl] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    adminApi.resume.get(token)
      .then(r => {
        setFileUrl(r.file_url ?? "");
        setLastUpdated(r.last_updated ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaveState("saving");
    setErrorMsg("");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    try {
      await adminApi.resume.update(token, {
        file_url: fileUrl,
        last_updated: lastUpdated || null,
      });
      setSaveState("saved");
      savedTimer.current = setTimeout(() => setSaveState("idle"), 3000);
    } catch (e) {
      setErrorMsg((e as Error).message);
      setSaveState("error");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-secondary rounded-2xl w-1/3" />
        <div className="h-48 bg-secondary rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the public resume download link and update date shown on your portfolio.
          </p>
        </div>
      </div>

      {saveState === "error" && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {errorMsg || "Failed to save. Please try again."}
        </div>
      )}

      <div className="space-y-6">
        {/* File URL */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="pb-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Resume File</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a direct link to your PDF. Use Google Drive, Dropbox, or any file host that allows direct download.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">File URL</label>
            <input
              className={INPUT}
              type="url"
              placeholder="https://drive.google.com/uc?export=download&id=…"
              value={fileUrl}
              onChange={e => setFileUrl(e.target.value)}
            />
          </div>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Test link
            </a>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Last Updated Date</label>
            <input
              className={INPUT}
              type="date"
              value={lastUpdated}
              onChange={e => setLastUpdated(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Shown on the portfolio resume section as the update date.</p>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Tips for hosting your resume</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">Google Drive:</strong> Upload PDF → Share → Anyone with link → Copy link, then change <code className="text-xs bg-secondary px-1 rounded">/view</code> to <code className="text-xs bg-secondary px-1 rounded">/export?format=pdf</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">Dropbox:</strong> Upload PDF → Share → Copy link, then change <code className="text-xs bg-secondary px-1 rounded">dl=0</code> to <code className="text-xs bg-secondary px-1 rounded">dl=1</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">GitHub:</strong> Upload to a public repo, use the raw file URL.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Save */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className={`min-h-10 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            saveState === "saved"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : saveState === "error"
              ? "bg-red-500/10 text-red-400 border border-red-500/30"
              : "bg-primary text-primary-foreground hover:opacity-90"
          } disabled:opacity-50`}
        >
          {saveState === "saving" && <span className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />}
          {saveState === "saved" && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Retry" : "Save Resume"}
        </button>
      </div>
    </div>
  );
}
