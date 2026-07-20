import { useState, useEffect, useRef } from "react";
import { adminApi, type Project } from "@/lib/adminApi";

const INPUT =
  "w-full rounded-xl border border-border bg-[#0c0c0e] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";
const TEXTAREA = `${INPUT} resize-none leading-7`;
const SELECT =
  "w-full rounded-xl border border-border bg-[#0c0c0e] px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";

const STATUS_STYLES: Record<string, string> = {
  "Completed":   "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Planned":     "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

const BLANK_PROJECT: Omit<Project, "id" | "created_at" | "updated_at"> = {
  title: "", description: "", tech_stack: [], live_url: "", github_url: "",
  thumbnail: "", sort_order: 0, published: true, status: "In Progress", label: "",
};

interface Props { token: string }

export function ProjectsManager({ token }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [editForm, setEditForm] = useState<Omit<Project, "id" | "created_at" | "updated_at">>(BLANK_PROJECT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState("");
  const tagRef = useRef<HTMLInputElement>(null);
  const [globalError, setGlobalError] = useState("");

  const load = () => {
    setLoading(true);
    adminApi.projects.list(token)
      .then(setProjects)
      .catch(() => setGlobalError("Failed to load projects."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title, description: p.description, tech_stack: [...p.tech_stack],
      live_url: p.live_url, github_url: p.github_url, thumbnail: p.thumbnail,
      sort_order: p.sort_order, published: p.published, status: p.status, label: p.label,
    });
    setTagInput("");
  };

  const openNew = () => {
    setEditingId("new");
    setEditForm({ ...BLANK_PROJECT, sort_order: projects.length });
    setTagInput("");
  };

  const cancelEdit = () => { setEditingId(null); setTagInput(""); };

  const setF = (key: keyof typeof editForm, value: unknown) =>
    setEditForm(f => ({ ...f, [key]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !editForm.tech_stack.includes(t))
      setF("tech_stack", [...editForm.tech_stack, t]);
    setTagInput("");
    tagRef.current?.focus();
  };
  const removeTag = (t: string) => setF("tech_stack", editForm.tech_stack.filter(x => x !== t));

  const handleSave = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      if (editingId === "new") {
        const created = await adminApi.projects.create(token, editForm);
        setProjects(ps => [...ps, created]);
      } else if (typeof editingId === "number") {
        const updated = await adminApi.projects.update(token, editingId, editForm);
        setProjects(ps => ps.map(p => p.id === editingId ? updated : p));
      }
      setEditingId(null);
    } catch (e) {
      setGlobalError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (p: Project) => {
    const updated = await adminApi.projects.update(token, p.id, { published: !p.published });
    setProjects(ps => ps.map(x => x.id === p.id ? updated : x));
  };

  const handleDelete = async (id: number) => {
    await adminApi.projects.remove(token, id);
    setProjects(ps => ps.filter(p => p.id !== id));
    setDeleteConfirm(null);
    if (editingId === id) setEditingId(null);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...projects];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const orders = next.map((p, i) => ({ id: p.id, sort_order: i }));
    setProjects(next.map((p, i) => ({ ...p, sort_order: i })));
    await adminApi.projects.reorder(token, orders);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your portfolio projects — add, edit, reorder, or toggle visibility.
          </p>
        </div>
        {editingId !== "new" && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Project
          </button>
        )}
      </div>

      {globalError && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      {/* New project form */}
      {editingId === "new" && (
        <div className="mb-6">
          <EditForm
            form={editForm} setF={setF}
            tagInput={tagInput} setTagInput={setTagInput}
            tagRef={tagRef} addTag={addTag} removeTag={removeTag}
            saving={saving} onSave={handleSave} onCancel={cancelEdit}
            isNew
          />
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Click "Add Project" to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={project.id}>
              <div className={`rounded-2xl border bg-card transition-colors ${editingId === project.id ? "border-primary/40" : "border-border hover:border-border/80"}`}>
                {/* Card header row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    </button>
                    <button onClick={() => move(index, 1)} disabled={index === projects.length - 1} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium flex-shrink-0 ${STATUS_STYLES[project.status] ?? "bg-secondary text-muted-foreground border-border"}`}>
                        {project.status}
                      </span>
                      {project.label && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-mono text-muted-foreground flex-shrink-0">{project.label}</span>
                      )}
                    </div>
                    {project.tech_stack.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground truncate">{project.tech_stack.slice(0, 4).join(", ")}{project.tech_stack.length > 4 ? ` +${project.tech_stack.length - 4}` : ""}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Published toggle */}
                    <button
                      onClick={() => togglePublished(project)}
                      title={project.published ? "Published — click to hide" : "Hidden — click to publish"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${project.published ? "bg-primary" : "bg-secondary"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${project.published ? "translate-x-4" : "translate-x-1"}`} />
                    </button>

                    <button
                      onClick={() => editingId === project.id ? cancelEdit() : openEdit(project)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>

                    {deleteConfirm === project.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(project.id)} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/20 transition-colors">Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(project.id)} className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline edit form */}
                {editingId === project.id && (
                  <div className="border-t border-border p-4">
                    <EditForm
                      form={editForm} setF={setF}
                      tagInput={tagInput} setTagInput={setTagInput}
                      tagRef={tagRef} addTag={addTag} removeTag={removeTag}
                      saving={saving} onSave={handleSave} onCancel={cancelEdit}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditForm({
  form, setF, tagInput, setTagInput, tagRef, addTag, removeTag,
  saving, onSave, onCancel, isNew,
}: {
  form: Omit<Project, "id" | "created_at" | "updated_at">;
  setF: (key: keyof typeof form, value: unknown) => void;
  tagInput: string; setTagInput: (v: string) => void;
  tagRef: React.RefObject<HTMLInputElement | null>;
  addTag: () => void; removeTag: (t: string) => void;
  saving: boolean; onSave: () => void; onCancel: () => void;
  isNew?: boolean;
}) {
  return (
    <div className={isNew ? "rounded-2xl border border-primary/30 bg-card p-6 space-y-4" : "space-y-4"}>
      {isNew && <p className="text-sm font-semibold text-foreground">New Project</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Title *</label>
          <input className={INPUT} placeholder="Project name" value={form.title} onChange={e => setF("title", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Label</label>
          <input className={INPUT} placeholder="AI, CMS, ML, WEB…" value={form.label} onChange={e => setF("label", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Status</label>
          <select className={SELECT} value={form.status} onChange={e => setF("status", e.target.value)}>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Planned</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Visibility</label>
          <div className="flex items-center gap-3 h-[46px] px-4 rounded-xl border border-border bg-[#0c0c0e]">
            <button
              type="button"
              onClick={() => setF("published", !form.published)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.published ? "bg-primary" : "bg-secondary"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${form.published ? "translate-x-4" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-foreground">{form.published ? "Published" : "Hidden"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Description</label>
        <textarea className={TEXTAREA} rows={3} placeholder="What does this project do?" value={form.description} onChange={e => setF("description", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">GitHub URL</label>
          <input className={INPUT} placeholder="https://github.com/…" value={form.github_url} onChange={e => setF("github_url", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Live URL</label>
          <input className={INPUT} placeholder="https://…" value={form.live_url} onChange={e => setF("live_url", e.target.value)} />
        </div>
      </div>

      {/* Tech tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tech Stack</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.tech_stack.map(t => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-mono text-foreground">
              {t}
              <button onClick={() => removeTag(t)} className="text-muted-foreground hover:text-red-400 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input ref={tagRef} className={INPUT + " flex-1"} placeholder="e.g. React" value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
          <button onClick={addTag} className="px-4 py-3 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">Add</button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          {saving ? "Saving…" : isNew ? "Create Project" : "Save Changes"}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border bg-transparent text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
