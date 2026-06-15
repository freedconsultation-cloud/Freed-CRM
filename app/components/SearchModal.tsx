"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { STAGE_COLORS, DealStage } from "@/app/types";

interface Results {
  contacts: { id: string; firstName: string; lastName: string; company?: string; email?: string }[];
  deals: { id: string; title: string; stage: string; value: number; contact?: { firstName: string; lastName: string } | null }[];
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results>({ contacts: [], deals: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!q.trim()) { setResults({ contacts: [], deals: [] }); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const go = (url: string) => { router.push(url); onClose(); };

  const total = results.contacts.length + results.deals.length;

  return (
    <div
      className="modal-overlay"
      style={{ alignItems: "flex-start", paddingTop: 80 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
        width: "100%", maxWidth: 560, overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 16, color: "var(--text-muted)" }}>🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Search contacts, deals..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontSize: 15, color: "var(--foreground)", fontFamily: "inherit",
            }}
          />
          {loading && <div className="spinner-sm" />}
          <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 6px" }}>
            Esc
          </span>
        </div>

        {q.trim() && (
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {total === 0 && !loading && (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No results for "{q}"
              </div>
            )}

            {results.contacts.length > 0 && (
              <div>
                <div style={{ padding: "8px 18px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                  Contacts
                </div>
                {results.contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => go(`/contacts/${c.id}`)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 18px", background: "transparent", border: "none",
                      cursor: "pointer", textAlign: "left", transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>👤</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                        {c.firstName} {c.lastName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {c.company ?? c.email ?? "Contact"}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>→</span>
                  </button>
                ))}
              </div>
            )}

            {results.deals.length > 0 && (
              <div>
                <div style={{ padding: "8px 18px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", borderTop: results.contacts.length > 0 ? "1px solid var(--border)" : undefined, marginTop: results.contacts.length > 0 ? 4 : 0 }}>
                  Deals
                </div>
                {results.deals.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => go(`/pipeline/${d.id}`)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 18px", background: "transparent", border: "none",
                      cursor: "pointer", textAlign: "left", transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>📋</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {d.contact ? `${d.contact.firstName} ${d.contact.lastName} · ` : ""}
                        {fmt(d.value)}
                      </div>
                    </div>
                    <span className="stage-badge" style={{
                      background: STAGE_COLORS[d.stage as DealStage] + "22",
                      color: STAGE_COLORS[d.stage as DealStage],
                      fontSize: 10,
                    }}>
                      {d.stage}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!q.trim() && (
          <div style={{ padding: "20px 18px", display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[{ icon: "👥", label: "Contacts", href: "/contacts" }, { icon: "📋", label: "Pipeline", href: "/pipeline" }, { icon: "📈", label: "Reports", href: "/reports" }, { icon: "🏢", label: "Accounts", href: "/accounts" }].map((s) => (
              <button
                key={s.href}
                onClick={() => go(s.href)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
