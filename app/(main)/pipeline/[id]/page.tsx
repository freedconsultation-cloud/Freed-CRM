"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Deal, DealStage, Task, DEAL_STAGES, STAGE_COLORS } from "@/app/types";
import DealModal from "@/app/components/DealModal";
import ActivityFeed from "@/app/components/ActivityFeed";
import TaskList from "@/app/components/TaskList";
import MilestoneTracker from "@/app/components/MilestoneTracker";
import ProposalGenerator from "@/app/components/ProposalGenerator";
import WinLossModal from "@/app/components/WinLossModal";

function fmt(n: number) { return `$${n.toLocaleString()}`; }

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [winLossStage, setWinLossStage] = useState<"Won" | "Lost" | null>(null);

  const load = useCallback(async () => {
    const [dealRes, tasksRes] = await Promise.all([
      fetch(`/api/deals/${id}`),
      fetch(`/api/tasks?dealId=${id}`),
    ]);
    if (!dealRes.ok) { router.push("/pipeline"); return; }
    const [dealData, tasksData] = await Promise.all([dealRes.json(), tasksRes.json()]);
    setDeal(dealData);
    setTasks(tasksData);

    if (dealData.stage === "Won") {
      const msRes = await fetch(`/api/milestones?dealId=${id}`);
      const msData = await msRes.json();
      if (msData.length === 0) {
        const created = await fetch("/api/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId: id }),
        });
        setMilestones(await created.json());
      } else {
        setMilestones(msData);
      }
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const moveToStage = async (stage: DealStage, reason = "") => {
    await fetch(`/api/deals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...deal, stage, contactId: deal.contact?.id ?? null, packageId: deal.package?.id ?? null, closeReason: reason }),
    });
    load();
  };

  const handleStageClick = (stage: DealStage) => {
    if (stage === "Won" || stage === "Lost") {
      setWinLossStage(stage);
    } else {
      moveToStage(stage);
    }
  };

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
            {deal.value > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{fmt(deal.value)}</span>}
            {deal.package && (
              <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 20, padding: "2px 10px" }}>
                📦 {deal.package.name}
              </span>
            )}
            {deal.closeReason && (
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>· {deal.closeReason}</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowProposal(true)}>✨ Proposal</button>
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={deleteDeal}>Delete</button>
        </div>
      </div>

      <div className="detail-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {deal.stage === "Won" && milestones.length > 0 && (
            <div className="detail-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Project Milestones</div>
                <span style={{ fontSize: 11, background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(63,185,80,0.3)", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>
                  ACTIVE PROJECT
                </span>
              </div>
              <MilestoneTracker milestones={milestones} onChanged={() => fetch(`/api/milestones?dealId=${id}`).then(r => r.json()).then(setMilestones)} />
            </div>
          )}

          <div className="detail-card">
            <div className="section-title">Activity</div>
            <ActivityFeed activities={deal.activities} dealId={id} onLogged={load} />
          </div>
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
              {deal.package && (
                <div className="detail-field">
                  <span className="detail-field-label">Package</span>
                  <span>{deal.package.name} · {fmt(deal.package.price)}</span>
                </div>
              )}
              {deal.closeReason && (
                <div className="detail-field">
                  <span className="detail-field-label">Reason</span>
                  <span style={{ color: "var(--text-muted)" }}>{deal.closeReason}</span>
                </div>
              )}
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
                    onClick={() => handleStageClick(stage)}
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
          initial={{ ...deal, contactId: deal.contact?.id ?? "", packageId: deal.package?.id ?? "" }}
          onClose={() => setEditing(false)}
          onSaved={(updated) => { setDeal((prev: any) => ({ ...prev, ...updated })); setEditing(false); load(); }}
        />
      )}
      {showProposal && (
        <ProposalGenerator dealId={id} dealTitle={deal.title} onClose={() => setShowProposal(false)} />
      )}
      {winLossStage && (
        <WinLossModal
          stage={winLossStage}
          dealTitle={deal.title}
          onConfirm={(reason) => { moveToStage(winLossStage, reason); setWinLossStage(null); }}
          onCancel={() => setWinLossStage(null)}
        />
      )}
    </div>
  );
}
