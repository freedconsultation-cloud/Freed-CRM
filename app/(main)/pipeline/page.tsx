"use client";
import { useEffect, useState, useCallback } from "react";
import { Deal, DealStage, DEAL_STAGES, STAGE_COLORS } from "@/app/types";
import DealModal from "@/app/components/DealModal";
import Link from "next/link";

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<DealStage | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/deals");
    setDeals(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const byStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);

  const stageTotal = (stage: DealStage) =>
    byStage(stage).reduce((s, d) => s + d.value, 0);

  const moveToStage = async (dealId: string, stage: DealStage) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage } : d));
    await fetch(`/api/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...deal, stage, contactId: deal.contactId }),
    });
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("dealId");
    if (id) moveToStage(id, stage);
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
          const stageDue = byStage(stage);
          return (
            <div key={stage} className="pipeline-col">
              <div className="pipeline-col-header">
                <div className="pipeline-col-title" style={{ color: STAGE_COLORS[stage] }}>{stage}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {stageDue.length > 0 && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmt(stageTotal(stage))}</span>
                  )}
                  <span className="pipeline-col-count">{stageDue.length}</span>
                </div>
              </div>

              <div
                className={`pipeline-drop-zone ${over === stage ? "over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setOver(stage); }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => handleDrop(e, stage)}
                style={{ display: "flex", flexDirection: "column", gap: 8, padding: 4 }}
              >
                {stageDue.map((deal) => (
                  <div
                    key={deal.id}
                    className={`deal-card ${dragging === deal.id ? "dragging" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("dealId", deal.id);
                      setDragging(deal.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => setEditDeal(deal)}
                  >
                    <div
                      style={{ width: 3, height: "100%", position: "absolute", left: 0, top: 0, borderRadius: "10px 0 0 10px", background: STAGE_COLORS[stage] }}
                    />
                    <div style={{ position: "relative" }}>
                      <div className="deal-card-title">{deal.title}</div>
                      {deal.contact && (
                        <div className="deal-card-contact">
                          {deal.contact.firstName} {deal.contact.lastName}
                          {deal.contact.company ? ` · ${deal.contact.company}` : ""}
                        </div>
                      )}
                      {deal.value > 0 && <div className="deal-card-value">{fmt(deal.value)}</div>}
                    </div>
                  </div>
                ))}

                {stageDue.length === 0 && (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
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
          initial={editDeal}
          onClose={() => setEditDeal(null)}
          onSaved={(d) => { setDeals((prev) => prev.map((x) => x.id === d.id ? d : x)); setEditDeal(null); }}
        />
      )}
    </div>
  );
}
