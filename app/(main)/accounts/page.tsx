"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STAGE_COLORS, DealStage } from "@/app/types";

function fmt(n: number) { return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`; }

interface AccountContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  deals: { id: string; value: number; stage: string; title: string }[];
  _count: { activities: number };
}

interface Account {
  name: string;
  contacts: AccountContact[];
  totalDeals: number;
  totalValue: number;
  wonValue: number;
  openDeals: number;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => { setAccounts(d); setLoading(false); });
  }, []);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Accounts</div>
          <div className="page-subtitle">{accounts.length} companies in your CRM</div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      ) : accounts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏢</div>
          <h3>No company accounts yet</h3>
          <p>Add company names to your contacts to see them grouped here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>
          {/* Account list */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contacts</th>
                  <th>Open Deals</th>
                  <th>Pipeline Value</th>
                  <th>Won Revenue</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr
                    key={a.name}
                    onClick={() => setSelected(selected?.name === a.name ? null : a)}
                    style={{ background: selected?.name === a.name ? "var(--accent-bg)" : undefined }}
                  >
                    <td>
                      <div className="td-name">{a.name}</div>
                    </td>
                    <td className="td-muted">{a.contacts.length}</td>
                    <td className="td-muted">{a.openDeals}</td>
                    <td style={{ fontWeight: 600 }}>{a.totalValue > 0 ? fmt(a.totalValue) : "—"}</td>
                    <td style={{ color: "var(--green)", fontWeight: 700 }}>{a.wonValue > 0 ? fmt(a.wonValue) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="detail-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {selected.contacts.length} contact{selected.contacts.length !== 1 ? "s" : ""} · {selected.totalDeals} deal{selected.totalDeals !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Pipeline</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(selected.totalValue)}</div>
                  </div>
                  <div style={{ flex: 1, background: "var(--surface-2)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Won</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--green)" }}>{fmt(selected.wonValue)}</div>
                  </div>
                </div>

                <div className="section-title" style={{ marginBottom: 8 }}>Contacts</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selected.contacts.map((c) => (
                    <Link key={c.id} href={`/contacts/${c.id}`}>
                      <div className="mini-item">
                        <div>
                          <div className="mini-item-label">{c.firstName} {c.lastName}</div>
                          <div className="mini-item-sub">{c.email ?? c.phone ?? "No contact info"}</div>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c._count.activities} activities</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {selected.contacts.flatMap((c) => c.deals).length > 0 && (
                <div className="detail-card">
                  <div className="section-title" style={{ marginBottom: 10 }}>All Deals</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selected.contacts.flatMap((c) =>
                      c.deals.map((d) => (
                        <Link key={d.id} href={`/pipeline/${d.id}`}>
                          <div className="mini-item">
                            <div>
                              <div className="mini-item-label">{d.title}</div>
                              <div className="mini-item-sub">{c.firstName} {c.lastName}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{fmt(d.value)}</div>
                              <span className="stage-badge" style={{
                                background: STAGE_COLORS[d.stage as DealStage] + "22",
                                color: STAGE_COLORS[d.stage as DealStage],
                                fontSize: 10, marginTop: 2, display: "inline-flex",
                              }}>{d.stage}</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
