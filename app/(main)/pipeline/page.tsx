"use client";
import { useEffect, useState, useCallback } from "react";
import { Deal, DealStage, DEAL_STAGES, STAGE_COLORS } from "@/app/types";
import DealModal from "@/app/components/DealModal";
import WinLossModal from "@/app/components/WinLossModal";

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function daysInStage(stageChangedAt: string | null | undefined, createdAt: string | Date): number {
  const since = stageChangedAt ? new Date(stageChangedAt) : new Date(createdAt);
  return Math.floor((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));
}

function AgeBadge({ days }: { days: number }) {
  if (days < 8) return null;
  const color = days >= 15 ? "var(--red)" : "var(--yellow)";
  const bg = days >= 15 ? "var(--red-bg)" : "var(--yellow-bg)";
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 10, background: bg, color }}>
      {days}d
    </span>
  );
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<DealStage | null>(null);
  const [winLossTarget, setWinLossTarget] = useState<{ dealId: string; stage: "Won" | "Lost" } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/deals");
    setDeals(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const byStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);
  const stageTotal = (stage: DealStage) => byStage(stage).reduce((s, d) => s + d.value, 0);

  const moveToStage = async (dealId: string, stage: DealStage, reason = "") => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage } : d));
    await fetch(`/api/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...deal, stage, contactId: deal.contact?.id ?? deal.contactId, closeReason: reason }),
    });
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("dealId");
    if (id) {
      if (stage === "Won" || stage === "Lost") setWinLossTarget({ dealId: id, stage });
      else moveToStage(id, stage);
    }
    setDragging(null);
    setOver(null);
  };

  return (
    <div className="page fade-in" style={{ maxWidth: "none" }}>
      <div className="page-header">
        <div>
          <div className="page-title">Pipeline</div>
          <div className="page-subtitle">{deals.filter(d => d.stage !== "Won" && d.stage !== "Lost").length} open deals</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Deal</button>
      </div>

      <div className="pipeline-board">
        {DEAL_STAGES.map((stage) => {
          const stageDeal = byStage(stage);
          return (
            <div key={stage} className="pipeline-col">
              <div className="pipeline-col-header">
                <div className="pipeline-col-title" style={{ color: STAGE_COLORS[stage], fontSize: 11 }}>{stage}</div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {stageDeal.length > 0 && (
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{fmt(stageTotal(stage))}</span>
                  )}
                  <span className="pipeline-col-count">{stageDeal.length}</span>
                </div>
              </div>

              <div
                className={`pipeline-drop-zone ${over === stage ? "over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setOver(stage); }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => handleDrop(e, stage)}
                style={{ display: "flex", flexDirection: "column", gap: 8, padding: 4 }}
              >
                {stageDeal.map((deal) => {
                  const days = daysInStage(deal.stageChangedAt as string | null, deal.createdAt);
                  return (
                    <div
                      key={deal.id}
                      className={`deal-card ${dragging === deal.id ? "dragging" : ""}`}
                      style={{ position: "relative", overflow: "hidden" }}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("dealId", deal.id); setDragging(deal.id); }}
                      onDragEnd={() => setDragging(null)}
                      onClick={() => window.location.href = `/pipeline/${deal.id}`}
                    >
                      <div style={{ width: 3, height: "100%", position: "absolute", left: 0, top: 0, borderRadius: "10px 0 0 10px", background: STAGE_COLORS[stage] }} />
                      <div style={{ paddingLeft: 6 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4, marginBottom: 4 }}>
                          <div className="deal-card-title" style={{ fontSize: 12, flex: 1 }}>{deal.title}</div>
                          <AgeBadge days={days} />
                        </div>
                        {deal.contact && (
                          <div className="deal-card-contact" style={{ fontSize: 11 }}>
                            {deal.contact.firstName} {deal.contact.lastName}
                            {deal.contact.company ? ` · ${deal.contact.company}` : ""}
                          </div>
                        )}
                        {deal.value > 0 && <div className="deal-card-value" style={{ fontSize: 12 }}>{fmt(deal.value)}</div>}
                      </div>
                    </div>
                  );
                })}
                {stageDeal.length === 0 && (
                  <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 11 }}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <DealModal
          onClose={() => setShowModal(false)}
          onSaved={(d) => { setDeals((prev) => [d, ...prev]); setShowModal(false); }}
        />
      )}
      {editDeal && (
        <DealModal
          initial={{ ...editDeal, packageId: editDeal.packageId ?? undefined }}
          onClose={() => setEditDeal(null)}
          onSaved={(d) => { setDeals((prev) => prev.map((x) => x.id === d.id ? d : x)); setEditDeal(null); }}
        />
      )}
      {winLossTarget && (
        <WinLossModal
          stage={winLossTarget.stage}
          dealTitle={deals.find((d) => d.id === winLossTarget.dealId)?.title ?? ""}
          onConfirm={(reason) => { moveToStage(winLossTarget.dealId, winLossTarget.stage, reason); setWinLossTarget(null); }}
          onCancel={() => setWinLossTarget(null)}
        />
      )}
    </div>
  );
}
