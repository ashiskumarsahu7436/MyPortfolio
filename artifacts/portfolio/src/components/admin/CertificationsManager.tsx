import { useState, useEffect } from "react";
import { adminApi, type Certification } from "@/lib/adminApi";

const INPUT =
  "w-full rounded-xl border border-border bg-[#0c0c0e] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow";

const BLANK: Omit<Certification, "id" | "created_at" | "updated_at"> = {
  title: "", issuer: "", issue_date: null, expiry_date: null,
  credential_url: "", badge_url: "", sort_order: 0, published: true,
};

interface Props { token: string }

export function CertificationsManager({ token }: Props) {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [editForm, setEditForm] = useState<Omit<Certification, "id" | "created_at" | "updated_at">>(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState("");

  const load = () => {
    setLoading(true);
    adminApi.certifications.list(token)
      .then(setCerts)
      .catch(() => setGlobalError("Failed to load certifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const openEdit = (c: Certification) => {
    setEditingId(c.id);
    setEditForm({
      title: c.title, issuer: c.issuer,
      issue_date: c.issue_date, expiry_date: c.expiry_date,
      credential_url: c.credential_url, badge_url: c.badge_url,
      sort_order: c.sort_order, published: c.published,
    });
  };

  const openNew = () => {
    setEditingId("new");
    setEditForm({ ...BLANK, sort_order: certs.length });
  };

  const cancelEdit = () => setEditingId(null);

  const setF = (key: keyof typeof editForm, value: unknown) =>
    setEditForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      if (editingId === "new") {
        const created = await adminApi.certifications.create(token, editForm);
        setCerts(cs => [...cs, created]);
      } else if (typeof editingId === "number") {
        const updated = await adminApi.certifications.update(token, editingId, editForm);
        setCerts(cs => cs.map(c => c.id === editingId ? updated : c));
      }
      setEditingId(null);
    } catch (e) {
      setGlobalError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (c: Certification) => {
    const updated = await adminApi.certifications.update(token, c.id, { published: !c.published });
    setCerts(cs => cs.map(x => x.id === c.id ? updated : x));
  };

  const handleDelete = async (id: number) => {
    await adminApi.certifications.remove(token, id);
    setCerts(cs => cs.filter(c => c.id !== id));
    setDeleteConfirm(null);
    if (editingId === id) setEditingId(null);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...certs];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const orders = next.map((c, i) => ({ id: c.id, sort_order: i }));
    setCerts(next.map((c, i) => ({ ...c, sort_order: i })));
    await adminApi.certifications.reorder(token, orders);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certifications &amp; Licenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add professional certifications — they appear on your portfolio only when at least one is published.
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
            Add Certification
          </button>
        )}
      </div>

      {globalError && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      {/* New form */}
      {editingId === "new" && (
        <div className="mb-6">
          <EditForm
            form={editForm} setF={setF}
            saving={saving} onSave={handleSave} onCancel={cancelEdit}
            isNew
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No certifications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Click "Add Certification" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert, index) => (
            <div key={cert.id}>
              <div className={`rounded-2xl border bg-card transition-colors ${editingId === cert.id ? "border-primary/40" : "border-border hover:border-border/80"}`}>
                {/* Card row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    </button>
                    <button onClick={() => move(index, 1)} disabled={index === certs.length - 1} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                  </div>

                  {/* Badge thumbnail */}
                  {cert.badge_url ? (
                    <img src={cert.badge_url} alt="" className="w-9 h-9 rounded-lg object-contain bg-secondary flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{cert.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{cert.issuer || "—"}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => togglePublished(cert)}
                      title={cert.published ? "Published — click to hide" : "Hidden — click to publish"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${cert.published ? "bg-primary" : "bg-secondary"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${cert.published ? "translate-x-4" : "translate-x-1"}`} />
                    </button>

                    <button
                      onClick={() => editingId === cert.id ? cancelEdit() : openEdit(cert)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>

                    {deleteConfirm === cert.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(cert.id)} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/20 transition-colors">Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(cert.id)} className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline edit */}
                {editingId === cert.id && (
                  <div className="border-t border-border p-4">
                    <EditForm
                      form={editForm} setF={setF}
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
  form, setF, saving, onSave, onCancel, isNew,
}: {
  form: Omit<Certification, "id" | "created_at" | "updated_at">;
  setF: (key: keyof typeof form, value: unknown) => void;
  saving: boolean; onSave: () => void; onCancel: () => void;
  isNew?: boolean;
}) {
  return (
    <div className={isNew ? "rounded-2xl border border-primary/30 bg-card p-6 space-y-4" : "space-y-4"}>
      {isNew && <p className="text-sm font-semibold text-foreground">New Certification</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Certificate Title *</label>
          <input className={INPUT} placeholder="e.g. AWS Certified Solutions Architect" value={form.title} onChange={e => setF("title", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Issuing Organisation</label>
          <input className={INPUT} placeholder="e.g. Amazon Web Services" value={form.issuer} onChange={e => setF("issuer", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Issue Date</label>
          <input type="date" className={INPUT} value={form.issue_date ?? ""} onChange={e => setF("issue_date", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Expiry Date <span className="normal-case opacity-50">(leave blank if no expiry)</span></label>
          <input type="date" className={INPUT} value={form.expiry_date ?? ""} onChange={e => setF("expiry_date", e.target.value || null)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Credential / Verify URL</label>
          <input className={INPUT} placeholder="https://…" value={form.credential_url} onChange={e => setF("credential_url", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Badge Image URL</label>
          <input className={INPUT} placeholder="https://… (PNG / SVG logo)" value={form.badge_url} onChange={e => setF("badge_url", e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Visibility</label>
        <div className="flex items-center gap-3 h-[46px] px-4 rounded-xl border border-border bg-[#0c0c0e] w-fit">
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

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          {saving ? "Saving…" : isNew ? "Add Certification" : "Save Changes"}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-border bg-transparent text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
