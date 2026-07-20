import { useState, useEffect, useRef } from "react";
import { adminApi, type Profile } from "@/lib/adminApi";

const INPUT =
  "w-full rounded-xl border border-border bg-[#0c0c0e] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";
const TEXTAREA = `${INPUT} resize-none leading-7`;

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props { token: string }

const BLANK: Omit<Profile, "id" | "updated_at"> = {
  full_name: "", tagline: "", bio: "", email: "",
  github_url: "", linkedin_url: "", photo_url: "",
  focus: "", philosophy: "", tech_stack: [],
};

export function ProfileEditor({ token }: Props) {
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [tagInput, setTagInput] = useState("");
  const tagRef = useRef<HTMLInputElement>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    adminApi.profile.get(token).then(p => {
      setForm({
        full_name: p.full_name, tagline: p.tagline, bio: p.bio, email: p.email,
        github_url: p.github_url, linkedin_url: p.linkedin_url, photo_url: p.photo_url,
        focus: p.focus, philosophy: p.philosophy,
        tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const set = (key: keyof typeof form, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tech_stack.includes(t)) {
      setForm(f => ({ ...f, tech_stack: [...f.tech_stack, t] }));
    }
    setTagInput("");
    tagRef.current?.focus();
  };

  const removeTag = (tag: string) =>
    setForm(f => ({ ...f, tech_stack: f.tech_stack.filter(t => t !== tag) }));

  const handleSave = async () => {
    setSaveState("saving");
    setErrorMsg("");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    try {
      await adminApi.profile.update(token, form);
      setSaveState("saved");
      savedTimer.current = setTimeout(() => setSaveState("idle"), 3000);
    } catch (e) {
      setErrorMsg((e as Error).message);
      setSaveState("error");
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Controls your name, bio, contact info, and tech stack across the portfolio.</p>
        </div>
        <SaveButton state={saveState} onClick={handleSave} />
      </div>

      {saveState === "error" && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {errorMsg || "Failed to save. Please try again."}
        </div>
      )}

      <div className="space-y-6">
        {/* Identity */}
        <Section title="Identity" description="Shown in the Hero section and page title.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input className={INPUT} placeholder="Ashis Kumar Sahu" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
            </Field>
            <Field label="Email">
              <input className={INPUT} type="email" placeholder="ashis@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
          </div>
          <Field label="Tagline" hint="Main subtitle shown below your name">
            <textarea className={TEXTAREA} rows={2} placeholder="I design and build scalable web applications…" value={form.tagline} onChange={e => set("tagline", e.target.value)} />
          </Field>
        </Section>

        {/* Social links */}
        <Section title="Social Links" description="Used in the Contact section.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="GitHub URL">
              <input className={INPUT} placeholder="https://github.com/ashis" value={form.github_url} onChange={e => set("github_url", e.target.value)} />
            </Field>
            <Field label="LinkedIn URL">
              <input className={INPUT} placeholder="https://linkedin.com/in/ashis" value={form.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} />
            </Field>
          </div>
          <Field label="Photo URL" hint="Direct link to your profile photo (JPG, PNG, WebP)">
            <input className={INPUT} placeholder="https://..." value={form.photo_url} onChange={e => set("photo_url", e.target.value)} />
            {form.photo_url && (
              <img src={form.photo_url} alt="Profile preview" className="mt-2 w-16 h-16 rounded-full object-cover border border-border" onError={e => (e.currentTarget.style.display = "none")} />
            )}
          </Field>
        </Section>

        {/* About content */}
        <Section title="About Content" description="Fills in the About section cards.">
          <Field label="Bio — Who I am">
            <textarea className={TEXTAREA} rows={3} placeholder="I am a full stack developer focused on…" value={form.bio} onChange={e => set("bio", e.target.value)} />
          </Field>
          <Field label="Current Focus">
            <textarea className={TEXTAREA} rows={2} placeholder="I am currently focused on AI-powered applications…" value={form.focus} onChange={e => set("focus", e.target.value)} />
          </Field>
          <Field label="Engineering Philosophy">
            <textarea className={TEXTAREA} rows={2} placeholder="I care about systems that are scalable…" value={form.philosophy} onChange={e => set("philosophy", e.target.value)} />
          </Field>
        </Section>

        {/* Tech stack */}
        <Section title="Tech Stack" description="Shown as colored tags in the About section and as a badge in Hero.">
          <div className="flex flex-wrap gap-2 mb-3">
            {form.tech_stack.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-mono text-foreground">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-red-400 transition-colors ml-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {form.tech_stack.length === 0 && (
              <p className="text-sm text-muted-foreground">No technologies added yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={tagRef}
              className={INPUT + " flex-1"}
              placeholder="Add a technology…"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            />
            <button
              onClick={addTag}
              className="px-4 py-3 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors flex-shrink-0"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Press Enter or click Add. Drag to reorder coming soon.</p>
        </Section>
      </div>

      {/* Bottom save */}
      <div className="mt-8 flex justify-end">
        <SaveButton state={saveState} onClick={handleSave} />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="pb-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      className={`min-h-10 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
        state === "saved"
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          : state === "error"
          ? "bg-red-500/10 text-red-400 border border-red-500/30"
          : "bg-primary text-primary-foreground hover:opacity-90"
      } disabled:opacity-50`}
    >
      {state === "saving" && <span className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />}
      {state === "saved" && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Retry" : "Save Profile"}
    </button>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-secondary rounded-2xl w-1/3" />
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 bg-secondary rounded w-1/4" />
          <div className="h-10 bg-secondary rounded-xl" />
          <div className="h-10 bg-secondary rounded-xl" />
        </div>
      ))}
    </div>
  );
}
