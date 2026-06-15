"use client";
import { useState } from "react";
import { Activity, ActivityType, ACTIVITY_ICONS } from "@/app/types";
import Link from "next/link";

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  activities: Activity[];
  contactId?: string;
  dealId?: string;
  onLogged?: () => void;
}

export default function ActivityFeed({ activities, contactId, dealId, onLogged }: Props) {
  const [type, setType] = useState<ActivityType>("note");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const log = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content: content.trim(), contactId, dealId }),
    });
    setContent("");
    setSaving(false);
    onLogged?.();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="log-form">
        <div className="type-tabs">
          {(["note", "call", "email", "meeting"] as ActivityType[]).map((t) => (
            <button key={t} className={`type-tab ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
              {ACTIVITY_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <textarea
          className="field"
          rows={3}
          placeholder={`Log a ${type}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={log} disabled={saving || !content.trim()}>
            {saving ? "Saving..." : "Log Activity"}
          </button>
        </div>
      </div>

      <div className="activity-feed">
        {activities.length === 0 && (
          <div className="empty" style={{ padding: "24px 0" }}>
            <div>No activities yet</div>
          </div>
        )}
        {activities.map((a) => (
          <div key={a.id} className="activity-item fade-in">
            <div className="activity-icon">{ACTIVITY_ICONS[a.type as ActivityType] ?? "📝"}</div>
            <div className="activity-body">
              <div className="activity-meta">
                {a.type} · {timeAgo(a.createdAt)}
                {a.contact && !contactId && (
                  <Link href={`/contacts/${a.contact.id}`} className="activity-link" style={{ marginLeft: 6 }}>
                    {a.contact.firstName} {a.contact.lastName}
                  </Link>
                )}
                {a.deal && !dealId && (
                  <Link href={`/pipeline/${a.deal.id}`} className="activity-link" style={{ marginLeft: 6 }}>
                    {a.deal.title}
                  </Link>
                )}
              </div>
              <div className="activity-content">{a.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
