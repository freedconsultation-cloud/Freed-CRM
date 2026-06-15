"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Deal, Task, DEAL_STAGES, STAGE_COLORS } from "@/app/types";
import DealModal from "@/app/components/DealModal";
import ActivityFeed from "@/app/components/ActivityFeed";
import TaskList from "@/app/components/TaskList";

function fmt(n: number) { return `$${n.toLocaleString()}`; }

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    const [dealRes, tasksRes] = await Promise.all([
      fetch(`/api/deals/${id}`),
      fetch(`/api/tasks?dealId=${id}`),
    ]);
    if (!dealRes.ok) { router.push("/pipeline"); return; }
    const [dealData, tasksData] = await Promise.all([dealRes.json(), tasksRes.json()]);
    setDeal(dealData);
    setTasks(tasksData);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const deleteDeal = async () => {
    if (!confirm("Delete this deal?")) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    router.push("/pipeline");
  };

  if (!deal) return <div className="page" style={{ color: "var(--text-muted)" }}>Loading...</div>;

  return (
    <div className="page fade-in">
      <Link href="/pipeline" className="back-link">← Pipeline</Link>
      <div className="page-header">
        <div>
          <div className="page-title">{deal.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <span className="stage-badge" style={{ background: STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS] + "22", color: STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS] }}>
              {deal.stage}
            </span>
            {deal.value > 0 && (
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{fmt(deal.value)}</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={deleteDeal}>Delete</button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-card">
          <div className="section-title">Activity</div>
          <ActivityFeed activities={deal.activities} dealId={id} onLogged={load} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="detail-card">
            <div className="section-title">Tasks</div>
            <TaskList tasks={tasks} dealId={id} onChanged={load} compact />
          </div>
          <div className="detail-card">
            <div className="section-title">Details</div>
            <div className="detail-fields">
              <div className="detail-field">
                <span className="detail-field-label">Stage</span>
                <span style={{ color: STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS], fontWeight: 700 }}>{deal.stage}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Value</span>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{fmt(deal.value)}</span>
              </div>
              {deal.contact && (
                <div className="detail-field">
                  <span className="detail-field-label">Contact</span>
                  <Link href={`/contacts/${deal.contact.id}`} style={{ color: "var(--accent)" }}>
                    {deal.contact.firstName} {deal.contact.lastName}
                  </Link>
                </div>
              )}
              {deal.notes && (
                <div className="detail-field" style={{ flexDirection: "column", gap: 4 }}>
                  <span className="detail-field-label">Notes</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{deal.notes}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Move to Stage</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DEAL_STAGES.filter(s => s !== deal.stage).map((stage) => (
                  <button
                    key={stage}
                    className="btn btn-ghost btn-sm"
                    style={{ color: STAGE_COLORS[stage], borderColor: STAGE_COLORS[stage] + "44" }}
                    onClick={async () => {
                      await fetch(`/api/deals/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...deal, stage, contactId: deal.contactId }),
                      });
                      load();
                    }}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <DealModal
          initial={{ ...deal, contactId: deal.contact?.id ?? "" }}
          onClose={() => setEditing(false)}
          onSaved={(updated) => { setDeal((prev: any) => ({ ...prev, ...updated })); setEditing(false); }}
        />
      )}
    </div>
  );
}
