"use client";
import { useState, useEffect } from "react";
import { Deal, DEAL_STAGES, Contact } from "@/app/types";

interface Package { id: string; name: string; price: number; type: string; }

interface Props {
  initial?: Partial<Deal & { packageId?: string }>;
  onClose: () => void;
  onSaved: (d: Deal) => void;
}

export default function DealModal({ initial, onClose, onSaved }: Props) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    value: String(initial?.value ?? ""),
    stage: initial?.stage ?? "Lead",
    contactId: initial?.contactId ?? "",
    packageId: (initial as any)?.packageId ?? "",
    notes: initial?.notes ?? "",
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts").then((r) => r.json()),
      fetch("/api/packages").then((r) => r.json()),
    ]).then(([c, p]) => { setContacts(c); setPackages(p); }).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const selectPackage = (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setForm((f) => ({
        ...f,
        packageId: pkgId,
        value: String(pkg.price),
        title: f.title || pkg.name,
      }));
    } else {
      set("packageId", "");
    }
  };

  const save = async () => {
    if (!form.title.trim()) { setError("Title required"); return; }
    setSaving(true);
    setError("");
    const url = isEdit ? `/api/deals/${initial!.id}` : "/api/deals";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value) || 0, packageId: form.packageId || null }),
    });
    if (!res.ok) { setError("Failed to save"); setSaving(false); return; }
    onSaved(await res.json());
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Deal" : "New Deal"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-stack">
          {packages.length > 0 && (
            <div className="form-group">
              <label className="form-label">Package (optional)</label>
              <select className="field" value={form.packageId} onChange={(e) => selectPackage(e.target.value)}>
                <option value="">— Select a package —</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price.toLocaleString()}{p.type === "monthly" ? "/mo" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Deal Title *</label>
            <input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Enterprise Smartsheet build" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Value ($)</label>
              <input className="field" type="number" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="field" value={form.stage} onChange={(e) => set("stage", e.target.value)}>
                {DEAL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contact</label>
            <select className="field" value={form.contactId} onChange={(e) => set("contactId", e.target.value)}>
              <option value="">— No contact —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}{c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="field" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Deal notes..." />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Deal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
