"use client";
import { useState } from "react";
import { Contact } from "@/app/types";

interface Props {
  initial?: Partial<Contact>;
  onClose: () => void;
  onSaved: (c: Contact) => void;
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
  });
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
            <label className="form-label">Tags (comma separated)</label>
            <input className="field" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="prospect, enterprise, warm" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="field" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any notes about this contact..." />
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
