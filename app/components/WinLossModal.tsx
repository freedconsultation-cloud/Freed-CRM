"use client";
import { useState } from "react";
import { DealStage, STAGE_COLORS } from "@/app/types";

const WIN_REASONS = ["Strong fit", "Competitive pricing", "Referral", "Brand reputation", "Fast response", "Other"];
const LOSS_REASONS = ["Price too high", "Went with competitor", "No budget", "Bad timing", "No response", "Project cancelled", "Other"];

interface Props {
  stage: "Won" | "Lost";
  dealTitle: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function WinLossModal({ stage, dealTitle, onConfirm, onCancel }: Props) {
  const reasons = stage === "Won" ? WIN_REASONS : LOSS_REASONS;
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const color = STAGE_COLORS[stage];

  const finalReason = selected === "Other" ? custom.trim() : selected;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{stage === "Won" ? "🎉" : "😔"}</span>
            <div>
              <div className="modal-title" style={{ color }}>Mark as {stage}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{dealTitle}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="form-stack">
          <div>
            <div className="form-label" style={{ marginBottom: 10 }}>
              {stage === "Won" ? "Why did you win?" : "Why was this lost?"} (optional)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelected(selected === r ? "" : r)}
                  style={{
                    padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: selected === r ? color + "22" : "var(--surface-2)",
                    color: selected === r ? color : "var(--text-muted)",
                    border: `1px solid ${selected === r ? color + "88" : "var(--border)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {selected === "Other" && (
            <input
              className="field"
              placeholder="Describe the reason..."
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              autoFocus
            />
          )}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ background: color }}
              onClick={() => onConfirm(finalReason)}
            >
              Confirm {stage}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
