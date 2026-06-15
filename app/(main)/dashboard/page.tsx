"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DEAL_STAGES, STAGE_COLORS, ACTIVITY_ICONS, ActivityType } from "@/app/types";

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="page">
        <div style={{ color: "var(--text-muted)", paddingTop: 40 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Your CRM at a glance</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Contacts</div>
          <div className="stat-value">{data.totalContacts}</div>
          <div className="stat-sub">in your CRM</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Open Deals</div>
          <div className="stat-value">{data.totalDeals}</div>
          <div className="stat-sub">across all stages</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pipeline Value</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{fmt(data.pipelineValue)}</div>
          <div className="stat-sub">excluding lost</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won Revenue</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>{fmt(data.wonValue)}</div>
          <div className="stat-sub">closed won</div>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-card-title">Pipeline by Stage</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {DEAL_STAGES.map((stage) => {
            const count = data.stageBreakdown[stage] ?? 0;
            return (
              <Link key={stage} href="/pipeline" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "12px 18px", minWidth: 100, textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: STAGE_COLORS[stage] }}>{count}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{stage}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tasks callout */}
      {(data.overdueTasks.length > 0 || data.todayTasks.length > 0) && (
        <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          {data.overdueTasks.length > 0 && (
            <Link href="/tasks?filter=overdue" style={{ flex: 1, minWidth: 200 }}>
              <div style={{ background: "var(--red-bg)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", marginBottom: 2 }}>⚠ OVERDUE TASKS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--red)" }}>{data.overdueTasks.length}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--red)", opacity: 0.7 }}>
                  {data.overdueTasks.slice(0, 2).map((t: any) => t.title).join(", ")}
                  {data.overdueTasks.length > 2 ? ` +${data.overdueTasks.length - 2} more` : ""}
                </div>
              </div>
            </Link>
          )}
          {data.todayTasks.length > 0 && (
            <Link href="/tasks" style={{ flex: 1, minWidth: 200 }}>
              <div style={{ background: "var(--yellow-bg)", border: "1px solid rgba(227,179,65,0.3)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--yellow)", marginBottom: 2 }}>DUE TODAY</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--yellow)" }}>{data.todayTasks.length}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--yellow)", opacity: 0.8 }}>
                  {data.todayTasks.slice(0, 2).map((t: any) => t.title).join(", ")}
                  {data.todayTasks.length > 2 ? ` +${data.todayTasks.length - 2} more` : ""}
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="recent-grid">
        <div className="section-card">
          <div className="section-card-title">Recent Contacts</div>
          <div className="mini-list">
            {data.recentContacts.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No contacts yet</div>
            )}
            {data.recentContacts.map((c: any) => (
              <Link key={c.id} href={`/contacts/${c.id}`}>
                <div className="mini-item">
                  <div>
                    <div className="mini-item-label">{c.firstName} {c.lastName}</div>
                    <div className="mini-item-sub">{c.company ?? "No company"}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(c.createdAt)}</div>
                </div>
              </Link>
            ))}
            <Link href="/contacts" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginTop: 4 }}>
              View all contacts →
            </Link>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-title">Recent Activity</div>
          <div className="mini-list">
            {data.recentActivities.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No activity yet</div>
            )}
            {data.recentActivities.map((a: any) => (
              <div key={a.id} className="mini-item" style={{ cursor: "default", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{ACTIVITY_ICONS[a.type as ActivityType] ?? "📝"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mini-item-label" style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.content}
                  </div>
                  <div className="mini-item-sub">
                    {a.contact ? `${a.contact.firstName} ${a.contact.lastName}` : a.deal?.title ?? "—"} · {timeAgo(a.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <Link href="/activities" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginTop: 4 }}>
              View all activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
