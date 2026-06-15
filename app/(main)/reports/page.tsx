"use client";
import { useEffect, useState } from "react";

function fmt(n: number) { return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`; }
function pct(n: number) { return `${Math.round(n * 100)}%`; }

interface ReportData {
  totalRevenue: number;
  winRate: number;
  avgDealSize: number;
  totalWon: number;
  totalLost: number;
  monthlyRevenue: { label: string; revenue: number; count: number }[];
  packagePerformance: { name: string; revenue: number; count: number }[];
  stageBreakdown: { stage: string; count: number; value: number }[];
}

const STAGE_COLORS: Record<string, string> = {
  Lead: "#8b949e", Qualified: "#58a6ff", Proposal: "#d2a8ff",
  Negotiation: "#e3b341", Won: "#3fb950", Lost: "#f85149",
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/reports").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="page" style={{ color: "var(--text-muted)" }}>Loading...</div>;

  const maxMonthly = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1);
  const maxPkg = Math.max(...data.packagePerformance.map((p) => p.revenue), 1);
  const maxStage = Math.max(...data.stageBreakdown.map((s) => s.count), 1);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Revenue Reports</div>
          <div className="page-subtitle">Pipeline analytics and performance insights</div>
        </div>
      </div>

      {/* KPI row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Won Revenue</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>{fmt(data.totalRevenue)}</div>
          <div className="stat-sub">{data.totalWon} closed deals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{pct(data.winRate)}</div>
          <div className="stat-sub">{data.totalWon}W · {data.totalLost}L</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Deal Size</div>
          <div className="stat-value">{fmt(data.avgDealSize)}</div>
          <div className="stat-sub">won deals only</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Deals Closed</div>
          <div className="stat-value">{data.totalWon + data.totalLost}</div>
          <div className="stat-sub">all time</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Monthly Revenue */}
        <div className="section-card" style={{ gridColumn: "1 / -1" }}>
          <div className="section-card-title">Monthly Won Revenue (last 12 months)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.monthlyRevenue.map((m) => (
              <div key={m.label} className="report-row">
                <span className="report-label">{m.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(m.revenue / maxMonthly) * 100}%`, background: "var(--accent)" }} />
                </div>
                <span className="report-value">{m.revenue > 0 ? fmt(m.revenue) : "—"}</span>
                {m.count > 0 && <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 50 }}>{m.count} deal{m.count !== 1 ? "s" : ""}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Package Performance */}
        <div className="section-card">
          <div className="section-card-title">Package Performance</div>
          {data.packagePerformance.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No won deals with packages yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.packagePerformance.map((p) => (
                <div key={p.name} className="report-row">
                  <span className="report-label">{p.name}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(p.revenue / maxPkg) * 100}%`, background: "var(--blue)" }} />
                  </div>
                  <span className="report-value">{fmt(p.revenue)}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 40 }}>{p.count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stage Breakdown */}
        <div className="section-card">
          <div className="section-card-title">Pipeline by Stage</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.stageBreakdown.map((s) => (
              <div key={s.stage} className="report-row">
                <span className="report-label" style={{ color: STAGE_COLORS[s.stage] }}>{s.stage}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(s.count / maxStage) * 100}%`, background: STAGE_COLORS[s.stage] }} />
                </div>
                <span className="report-value" style={{ color: "var(--text-muted)", fontWeight: 600 }}>{s.count}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 70, textAlign: "right" }}>
                  {s.value > 0 ? fmt(s.value) : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
