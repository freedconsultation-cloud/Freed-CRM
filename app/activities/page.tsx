"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ActivityType, ACTIVITY_ICONS } from "@/app/types";

function timeAgo(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities?limit=100")
      .then((r) => r.json())
      .then((d) => { setActivities(d); setLoading(false); });
  }, []);

  const visible = filter === "all" ? activities : activities.filter((a) => a.type === filter);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Activity Log</div>
          <div className="page-subtitle">{activities.length} total entries</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "note", "call", "email", "meeting"].map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${filter === t ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(t)}
          >
            {t !== "all" ? `${ACTIVITY_ICONS[t as ActivityType]} ` : ""}{t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🕐</div>
          <h3>No activities yet</h3>
          <p>Activities are logged from contact and deal pages.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="activity-feed" style={{ padding: 20 }}>
            {visible.map((a) => (
              <div key={a.id} className="activity-item">
                <div className="activity-icon">{ACTIVITY_ICONS[a.type as ActivityType] ?? "📝"}</div>
                <div className="activity-body">
                  <div className="activity-meta">
                    <strong style={{ color: "var(--foreground)", textTransform: "capitalize" }}>{a.type}</strong>
                    {" · "}
                    {a.contact && (
                      <Link href={`/contacts/${a.contact.id}`} style={{ color: "var(--accent)" }}>
                        {a.contact.firstName} {a.contact.lastName}
                      </Link>
                    )}
                    {a.deal && (
                      <>
                        {a.contact && " · "}
                        <Link href={`/pipeline/${a.deal.id}`} style={{ color: "var(--blue)" }}>
                          {a.deal.title}
                        </Link>
                      </>
                    )}
                    {" · "}
                    {timeAgo(a.createdAt)}
                  </div>
                  <div className="activity-content">{a.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
