"use client";
import { useState } from "react";

interface Milestone {
  id: string;
  name: string;
  order: number;
  status: "pending" | "active" | "complete";
  notes: string;
  completedAt?: string | null;
}

const STATUS_STYLE = {
  pending:  { bg: "var(--surface-2)", border: "var(--border)", color: "var(--text-muted)", icon: "○" },
  active:   { bg: "var(--yellow-bg)", border: "rgba(227,179,65,0.4)", color: "var(--yellow)", icon: "◉" },
  complete: { bg: "var(--green-bg)",  border: "rgba(63,185,80,0.4)",  color: "var(--green)",  icon: "✓" },
};

export default function MilestoneTracker({
  milestones: initial,
  onChanged,
}: {
  milestones: Milestone[];
  onChanged?: () => void;
}) {
  const [milestones, setMilestones] = useState<Milestone[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const update = async (m: Milestone, status: Milestone["status"]) => {
    setSaving(m.id);
    const notes = editNotes[m.id] ?? m.notes;
    const res = await fetch(`/api/milestones/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    const updated = await res.json();
    setMilestones((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
    setSaving(null);
    onChanged?.();
  };

  const saveNotes = async (m: Milestone) => {
    setSaving(m.id);
    await fetch(`/api/milestones/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: m.status, notes: editNotes[m.id] ?? m.notes }),
    });
    setMilestones((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, notes: editNotes[m.id] ?? x.notes } : x))
    );
    setSaving(null);
  };

  const complete = milestones.filter((m) => m.status === "complete").length;
  const pct = Math.round((complete / milestones.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
          <span>{complete} of {milestones.length} phases complete</span>
          <span style={{ fontWeight: 700, color: pct === 100 ? "var(--green)" : "var(--foreground)" }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--yellow)", borderRadius: 3, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {milestones.map((m) => {
        const s = STATUS_STYLE[m.status];
        const isExpanded = expandedId === m.id;
        return (
          <div key={m.id} style={{ border: `1px solid ${s.border}`, borderRadius: 10, background: s.bg, overflow: "hidden" }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}
              onClick={() => setExpandedId(isExpanded ? null : m.id)}
            >
              <span style={{ fontSize: 16, color: s.color, width: 20, textAlign: "center", flexShrink: 0 }}>{s.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, flex: 1, color: m.status === "pending" ? "var(--text-muted)" : "var(--foreground)" }}>
                {m.name}
              </span>
              {m.status !== "complete" && (
                <div style={{ display: "flex", gap: 6 }}>
                  {m.status === "pending" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11 }}
                      onClick={(e) => { e.stopPropagation(); update(m, "active"); }}
                      disabled={saving === m.id}
                    >
                      Start
                    </button>
                  )}
                  {m.status === "active" && (
                    <button
                      className="btn btn-sm"
                      style={{ background: "var(--green)", color: "#fff", fontSize: 11 }}
                      onClick={(e) => { e.stopPropagation(); update(m, "complete"); }}
                      disabled={saving === m.id}
                    >
                      Complete ✓
                    </button>
                  )}
                </div>
              )}
              {m.status === "complete" && m.completedAt && (
                <span style={{ fontSize: 11, color: "var(--green)" }}>
                  {new Date(m.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{isExpanded ? "▲" : "▼"}</span>
            </div>

            {isExpanded && (
              <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${s.border}` }}>
                <div style={{ paddingTop: 10 }}>
                  <textarea
                    className="field"
                    rows={3}
                    placeholder="Phase notes..."
                    defaultValue={m.notes}
                    onChange={(e) => setEditNotes((prev) => ({ ...prev, [m.id]: e.target.value }))}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => saveNotes(m)}
                      disabled={saving === m.id}
                    >
                      {saving === m.id ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
