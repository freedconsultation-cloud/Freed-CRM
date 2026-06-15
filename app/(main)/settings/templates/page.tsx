"use client";
import { useEffect, useState } from "react";
import { EmailTemplate } from "@/app/types";

function TemplateModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Partial<EmailTemplate>;
  onClose: () => void;
  onSaved: (t: EmailTemplate) => void;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    subject: initial?.subject ?? "",
    body: initial?.body ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!form.name.trim()) { setError("Name required"); return; }
    setSaving(true);
    const url = isEdit ? `/api/templates/${initial!.id}` : "/api/templates";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError("Failed"); setSaving(false); return; }
    onSaved(await res.json());
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Template" : "New Email Template"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-stack">
          <div className="form-group">
            <label className="form-label">Template Name *</label>
            <input className="field" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. First Touch Outreach" />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Line</label>
            <input className="field" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Quick question about Smartsheet at {{company}}" />
          </div>
          <div className="form-group">
            <label className="form-label">Body</label>
            <textarea
              className="field"
              rows={10}
              value={form.body}
              onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder={`Hi {{firstName}},\n\nI noticed {{company}} might benefit from a more organized approach to project management...`}
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface-2)", borderRadius: 8, padding: "8px 12px" }}>
            Available placeholders: <code>{"{{firstName}}"}</code> <code>{"{{lastName}}"}</code> <code>{"{{fullName}}"}</code> <code>{"{{company}}"}</code> <code>{"{{email}}"}</code>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [modal, setModal] = useState<Partial<EmailTemplate> | null>(null);
  const [preview, setPreview] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/templates");
    setTemplates(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (preview?.id === id) setPreview(null);
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Email Templates</div>
          <div className="page-subtitle">Reusable outreach templates with smart placeholders</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ New Template</button>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      ) : templates.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✉️</div>
          <h3>No templates yet</h3>
          <p>Create reusable email templates to speed up outreach. Use {"{{firstName}}"}, {"{{company}}"} etc. for personalization.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr 420px" : "1fr", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {templates.map((t) => (
              <div
                key={t.id}
                className="detail-card"
                style={{ cursor: "pointer", borderColor: preview?.id === t.id ? "var(--accent)" : undefined }}
                onClick={() => setPreview(preview?.id === t.id ? null : t)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{t.name}</div>
                    {t.subject && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Subject: {t.subject}</div>}
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {t.body}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setModal(t); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); remove(t.id); }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {preview && (
            <div className="detail-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Preview</div>
                <button className="modal-close" onClick={() => setPreview(null)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div className="form-label" style={{ marginBottom: 4 }}>Name</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{preview.name}</div>
                </div>
                {preview.subject && (
                  <div>
                    <div className="form-label" style={{ marginBottom: 4 }}>Subject</div>
                    <div style={{ fontSize: 13, color: "var(--foreground)" }}>{preview.subject}</div>
                  </div>
                )}
                <div>
                  <div className="form-label" style={{ marginBottom: 4 }}>Body</div>
                  <div style={{
                    background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8,
                    padding: "12px", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--foreground)",
                    maxHeight: 360, overflowY: "auto",
                  }}>
                    {preview.body}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Use this template from any contact's profile — placeholders are auto-filled.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {modal !== null && (
        <TemplateModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={(t) => {
            setTemplates((prev) => modal.id ? prev.map((x) => x.id === t.id ? t : x) : [t, ...prev]);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
