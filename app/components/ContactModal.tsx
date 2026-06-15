"use client";
import { useState } from "react";
import { Contact, LEAD_SOURCES, SM_PLANS, SM_USERS, SM_INTEGRATIONS } from "@/app/types";

interface Props {
  initial?: Partial<Contact>;
  onClose: () => void;
  onSaved: (c: Contact) => void;
}

function PillSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => (
        <button
          key={o} type="button"
          onClick={() => onChange(value === o ? "" : o)}
          style={{
            padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: value === o ? "var(--accent-bg)" : "var(--surface-2)",
            color: value === o ? "var(--accent)" : "var(--text-muted)",
            border: `1px solid ${value === o ? "var(--accent)" : "var(--border)"}`,
          }}
        >{o}</button>
      ))}
    </div>
  );
}

function MultiPill({ values, onChange, options }: { values: string[]; onChange: (v: string[]) => void; options: string[] }) {
  const toggle = (o: string) => onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => (
        <button
          key={o} type="button"
          onClick={() => toggle(o)}
          style={{
            padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: values.includes(o) ? "var(--blue-bg)" : "var(--surface-2)",
            color: values.includes(o) ? "var(--blue)" : "var(--text-muted)",
            border: `1px solid ${values.includes(o) ? "var(--blue)" : "var(--border)"}`,
          }}
        >{o}</button>
      ))}
    </div>
  );
}

export default function ContactModal({ initial, onClose, onSaved }: Props) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    company: initial?.company ?? "",
    notes: initial?.notes ?? "",
    tags: (initial?.tags ?? []).join(", "),
    source: initial?.source ?? "",
    smPlan: initial?.smPlan ?? "",
    smUsers: initial?.smUsers ?? "",
    smIntegrations: (initial?.smIntegrations ?? []) as string[],
  });
  const [showQual, setShowQual] = useState(!!(initial?.smPlan || initial?.smUsers || (initial?.smIntegrations ?? []).length));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.firstName.trim()) { setError("First name required"); return; }
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const url = isEdit ? `/api/contacts/${initial!.id}` : "/api/contacts";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { setError("Failed to save"); setSaving(false); return; }
    onSaved(await res.json());
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Contact" : "New Contact"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-stack">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="field" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Jane" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="field" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Smith" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="field" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Lead Source</label>
            <select className="field" value={form.source} onChange={(e) => set("source", e.target.value)}>
              <option value="">— Unknown —</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input className="field" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="prospect, enterprise, warm" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="field" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any notes about this contact..." />
          </div>

          {/* Smartsheet Qualification */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <button
              type="button"
              onClick={() => setShowQual(!showQual)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              <span style={{ fontSize: 10 }}>{showQual ? "▼" : "▶"}</span>
              Smartsheet Qualification
            </button>
            {showQual && (
              <div className="form-stack" style={{ marginTop: 12 }}>
                <div className="form-group">
                  <label className="form-label">Current Plan</label>
                  <PillSelect value={form.smPlan} onChange={(v) => set("smPlan", v)} options={SM_PLANS} />
                </div>
                <div className="form-group">
                  <label className="form-label">Team Size (Smartsheet users)</label>
                  <PillSelect value={form.smUsers} onChange={(v) => set("smUsers", v)} options={SM_USERS} />
                </div>
                <div className="form-group">
                  <label className="form-label">Integrations Needed</label>
                  <MultiPill
                    values={form.smIntegrations}
                    onChange={(v) => setForm((f) => ({ ...f, smIntegrations: v }))}
                    options={SM_INTEGRATIONS}
                  />
                </div>
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Contact"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
