"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Contact } from "@/app/types";
import ContactModal from "@/app/components/ContactModal";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/contacts?q=${encodeURIComponent(q)}`);
    setContacts(await res.json());
    setLoading(false);
  }, [q]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Contacts</div>
          <div className="page-subtitle">{contacts.length} total</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Contact</button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input
            className="field search-input"
            placeholder="Search name, email, company..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <h3>{q ? "No results found" : "No contacts yet"}</h3>
            <p>{q ? "Try a different search" : "Add your first contact to get started."}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Tags</th>
                <th>Deals</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} onClick={() => window.location.href = `/contacts/${c.id}`}>
                  <td className="td-name">{c.firstName} {c.lastName}</td>
                  <td className="td-muted">{c.company ?? "—"}</td>
                  <td className="td-muted">{c.email ?? "—"}</td>
                  <td className="td-muted">{c.phone ?? "—"}</td>
                  <td>
                    <div className="tags-row">
                      {(c.tags as string[]).slice(0, 3).map((t) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="td-muted">{c._count?.deals ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ContactModal
          onClose={() => setShowModal(false)}
          onSaved={(c) => { setContacts((prev) => [c, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
