"use client";
import { useState } from "react";

interface Props {
  dealId: string;
  dealTitle: string;
  onClose: () => void;
}

export default function ProposalGenerator({ dealId, dealTitle, onClose }: Props) {
  const [notes, setNotes] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setProposal("");
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId, notes }),
    });
    const data = await res.json();
    setProposal(data.proposal ?? data.error ?? "Generation failed");
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(proposal).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const download = () => {
    const blob = new Blob([proposal], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dealTitle.replace(/[^a-z0-9]/gi, "_")}_proposal.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <div className="modal-title">✨ Generate Proposal</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!proposal ? (
          <div className="form-stack">
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Claude will write a full consulting proposal for <strong style={{ color: "var(--foreground)" }}>{dealTitle}</strong> using the deal's contact, package, and notes.
            </div>
            <div className="form-group">
              <label className="form-label">Additional context (optional)</label>
              <textarea
                className="field"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific pain points, goals, anything to personalise the proposal..."
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={generate} disabled={loading}>
                {loading ? (
                  <><span className="spinner-sm" /> Generating...</>
                ) : "Generate Proposal"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setProposal("")}>Regenerate</button>
              <button className="btn btn-secondary btn-sm" onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
              <button className="btn btn-primary btn-sm" onClick={download}>Download .txt</button>
            </div>
            <div style={{
              background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10,
              padding: 20, fontFamily: "monospace", fontSize: 13, lineHeight: 1.7,
              whiteSpace: "pre-wrap", maxHeight: 520, overflowY: "auto", color: "var(--foreground)",
            }}>
              {proposal}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
