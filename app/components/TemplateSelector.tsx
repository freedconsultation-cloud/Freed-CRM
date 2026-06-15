"use client";
import { useEffect, useState } from "react";
import { EmailTemplate } from "@/app/types";

interface Props {
  contact: { firstName: string; lastName: string; company?: string | null; email?: string | null };
  onClose: () => void;
}

function substitute(text: string, contact: Props["contact"]): string {
  return text
    .replace(/\{\{firstName\}\}/g, contact.firstName)
    .replace(/\{\{lastName\}\}/g, contact.lastName)
    .replace(/\{\{fullName\}\}/g, `${contact.firstName} ${contact.lastName}`)
    .replace(/\{\{company\}\}/g, contact.company ?? "your company")
    .replace(/\{\{email\}\}/g, contact.email ?? "");
}

export default function TemplateSelector({ contact, onClose }: Props) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBody, setAiBody] = useState("");

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then(setTemplates);
  }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const personalizeWithAI = async () => {
    if (!selected) return;
    setAiLoading(true);
    setAiBody("");
    const context = `Contact: ${contact.firstName} ${contact.lastName}, Company: ${contact.company ?? "N/A"}, Email: ${contact.email ?? "N/A"}
Template to personalize:
Subject: ${selected.subject}
Body: ${selected.body}`;
    const res = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "email", context }),
    });
    const data = await res.json();
    setAiBody(data.text ?? "");
    setAiLoading(false);
  };

  const displayBody = aiBody || (selected ? substitute(selected.body, contact) : "");

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">✉️ Email Templates</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 16, minHeight: 340 }}>
          {/* Template list */}
          <div style={{ width: 180, flexShrink: 0, borderRight: "1px solid var(--border)", paddingRight: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="form-label" style={{ marginBottom: 8 }}>Templates</div>
            {templates.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No templates yet. Create them in Settings → Templates.</div>
            )}
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelected(t); setAiBody(""); }}
                style={{
                  padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
                  background: selected?.id === t.id ? "var(--accent-bg)" : "transparent",
                  color: selected?.id === t.id ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${selected?.id === t.id ? "var(--accent)" : "transparent"}`,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {!selected ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
                Select a template
              </div>
            ) : (
              <>
                <div>
                  <div className="form-label" style={{ marginBottom: 4 }}>Subject</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                    {substitute(selected.subject, contact)}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div className="form-label">Body</div>
                    {aiBody && <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>✨ AI personalized</span>}
                  </div>
                  <div style={{
                    background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8,
                    padding: 12, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
                    color: "var(--foreground)", maxHeight: 220, overflowY: "auto",
                  }}>
                    {aiLoading ? (
                      <span style={{ color: "var(--text-muted)" }}>Personalizing with AI...</span>
                    ) : displayBody}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary btn-sm" onClick={personalizeWithAI} disabled={aiLoading}>
                    {aiLoading ? "..." : "✨ AI Personalize"}
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => copy(`Subject: ${substitute(selected.subject, contact)}\n\n${displayBody}`)}
                  >
                    {copied ? "✓ Copied!" : "Copy Email"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
