"use client";
import { useEffect, useState } from "react";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  _count?: { deals: number };
}

function fmt(n: number) { return `$${n.toLocaleString()}`; }

function PackageModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Partial<Package>;
  onClose: () => void;
  onSaved: (p: Package) => void;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: String(initial?.price ?? ""),
    type: initial?.type ?? "fixed",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!form.name.trim()) { setError("Name required"); return; }
    setSaving(true);
    const url = isEdit ? `/api/packages/${initial!.id}` : "/api/packages";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) || 0 }),
    });
    if (!res.ok) { setError("Failed"); setSaving(false); return; }
    onSaved(await res.json());
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Package" : "New Package"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-stack">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="field" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Smartsheet Starter" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="field" rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's included in this package..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input className="field" type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Billing</label>
              <select className="field" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="fixed">One-time</option>
                <option value="monthly">Monthly retainer</option>
              </select>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save" : "Create Package"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [modal, setModal] = useState<Partial<Package> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/packages");
    setPackages(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    await fetch(`/api/packages/${id}`, { method: "DELETE" });
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Service Packages</div>
          <div className="page-subtitle">Define your Smartsheet consulting offerings</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ New Package</button>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      ) : packages.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <h3>No packages yet</h3>
          <p>Create your standard consulting packages to attach to deals.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {packages.map((p) => (
            <div key={p.id} className="detail-card" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: p.type === "monthly" ? "var(--blue-bg)" : "var(--accent-bg)",
                    color: p.type === "monthly" ? "var(--blue)" : "var(--accent)",
                  }}>
                    {p.type === "monthly" ? "Retainer" : "One-time"}
                  </span>
                </div>
                {p.description && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, lineHeight: 1.5 }}>{p.description}</div>}
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{p._count?.deals ?? 0} deals</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>
                  {fmt(p.price)}{p.type === "monthly" ? "/mo" : ""}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <PackageModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={(p) => {
            setPackages((prev) =>
              modal.id ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]
            );
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
