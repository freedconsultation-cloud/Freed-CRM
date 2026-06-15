"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Contact, Deal, Activity, Task, STAGE_COLORS, ACTIVITY_ICONS, ActivityType, SM_PLANS, SM_USERS, SM_INTEGRATIONS } from "@/app/types";
import ContactModal from "@/app/components/ContactModal";
import ActivityFeed from "@/app/components/ActivityFeed";
import TaskList from "@/app/components/TaskList";
import TemplateSelector from "@/app/components/TemplateSelector";

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editing, setEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async () => {
    const [contactRes, tasksRes] = await Promise.all([
      fetch(`/api/contacts/${id}`),
      fetch(`/api/tasks?contactId=${id}`),
    ]);
    if (!contactRes.ok) { router.push("/contacts"); return; }
    const [contactData, tasksData] = await Promise.all([contactRes.json(), tasksRes.json()]);
    setContact(contactData);
    setTasks(tasksData);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const askAi = async (type: string) => {
    if (!contact) return;
    setAiLoading(true);
    setAiResult("");
    const context = `Contact: ${contact.firstName} ${contact.lastName}, Company: ${contact.company ?? "N/A"}, Email: ${contact.email ?? "N/A"}
Notes: ${contact.notes}
Recent activities: ${contact.activities.slice(0, 5).map((a: Activity) => `[${a.type}] ${a.content}`).join("; ")}
Open deals: ${contact.deals.map((d: Deal) => `${d.title} (${d.stage}, ${fmt(d.value)})`).join(", ") || "none"}`;
    const res = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, context }),
    });
    const data = await res.json();
    setAiResult(data.text ?? data.error ?? "");
    setAiLoading(false);
  };

  const deleteContact = async () => {
    if (!confirm("Delete this contact? All deals and activities will be removed.")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    router.push("/contacts");
  };

  if (!contact) {
    return <div className="page" style={{ color: "var(--text-muted)" }}>Loading...</div>;
  }

  const smIntegrations: string[] = contact.smIntegrations ?? [];
  const hasQualData = contact.smPlan || contact.smUsers || smIntegrations.length > 0;

  return (
    <div className="page fade-in">
      <Link href="/contacts" className="back-link">← Contacts</Link>
      <div className="page-header">
        <div>
          <div className="page-title">{contact.firstName} {contact.lastName}</div>
          {contact.company && (
            <Link href="/accounts" className="page-subtitle" style={{ color: "var(--accent)", fontWeight: 600 }}>
              🏢 {contact.company}
            </Link>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={deleteContact}>Delete</button>
        </div>
      </div>

      <div className="detail-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* AI Tools */}
          <div className="detail-card">
            <div className="section-title">AI Tools</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => askAi("email")} disabled={aiLoading}>✉️ Draft Email</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowTemplates(true)}>📄 Templates</button>
              <button className="btn btn-secondary btn-sm" onClick={() => askAi("summary")} disabled={aiLoading}>📋 Summarize</button>
              <button className="btn btn-secondary btn-sm" onClick={() => askAi("nextStep")} disabled={aiLoading}>🎯 Next Step</button>
            </div>
            {aiLoading && <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>Thinking...</div>}
            {aiResult && (
              <div className="ai-box" style={{ marginTop: 12 }}>
                <div className="ai-box-header">✨ Claude</div>
                <div className="ai-box-body">{aiResult}</div>
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="detail-card">
            <div className="section-title">Tasks</div>
            <TaskList tasks={tasks} contactId={id} onChanged={load} compact />
          </div>

          {/* Activity */}
          <div className="detail-card">
            <div className="section-title">Activity</div>
            <ActivityFeed activities={contact.activities} contactId={id} onLogged={load} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Info */}
          <div className="detail-card">
            <div className="section-title">Info</div>
            <div className="detail-fields">
              {contact.email && (
                <div className="detail-field">
                  <span className="detail-field-label">Email</span>
                  <a href={`mailto:${contact.email}`} style={{ color: "var(--accent)" }}>{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="detail-field">
                  <span className="detail-field-label">Phone</span>
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.company && (
                <div className="detail-field">
                  <span className="detail-field-label">Company</span>
                  <span>{contact.company}</span>
                </div>
              )}
              {contact.source && (
                <div className="detail-field">
                  <span className="detail-field-label">Source</span>
                  <span style={{ color: "var(--text-muted)" }}>{contact.source}</span>
                </div>
              )}
              {contact.notes && (
                <div className="detail-field" style={{ flexDirection: "column", gap: 4 }}>
                  <span className="detail-field-label">Notes</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{contact.notes}</span>
                </div>
              )}
              {(contact.tags as string[]).length > 0 && (
                <div className="detail-field" style={{ flexDirection: "column", gap: 4 }}>
                  <span className="detail-field-label">Tags</span>
                  <div className="tags-row">
                    {(contact.tags as string[]).map((t: string) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Smartsheet Qualification */}
          {hasQualData && (
            <div className="detail-card">
              <div className="section-title">Smartsheet Qualification</div>
              <div className="detail-fields">
                {contact.smPlan && (
                  <div className="detail-field">
                    <span className="detail-field-label">Plan</span>
                    <span className="tag" style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>{contact.smPlan}</span>
                  </div>
                )}
                {contact.smUsers && (
                  <div className="detail-field">
                    <span className="detail-field-label">Users</span>
                    <span>{contact.smUsers}</span>
                  </div>
                )}
                {smIntegrations.length > 0 && (
                  <div className="detail-field" style={{ flexDirection: "column", gap: 6 }}>
                    <span className="detail-field-label">Integrations</span>
                    <div className="tags-row">
                      {smIntegrations.map((i: string) => (
                        <span key={i} className="tag" style={{ color: "var(--blue)", borderColor: "var(--blue)" }}>{i}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deals */}
          <div className="detail-card">
            <div className="section-title">Deals ({contact.deals.length})</div>
            {contact.deals.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No deals linked</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {contact.deals.map((d: Deal) => (
                  <Link key={d.id} href={`/pipeline/${d.id}`}>
                    <div className="mini-item">
                      <div>
                        <div className="mini-item-label">{d.title}</div>
                        <div className="mini-item-sub">{fmt(d.value)}</div>
                      </div>
                      <span className="stage-badge" style={{ background: STAGE_COLORS[d.stage] + "22", color: STAGE_COLORS[d.stage], fontSize: 10 }}>
                        {d.stage}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <ContactModal
          initial={{ ...contact, tags: contact.tags as string[], smIntegrations: contact.smIntegrations ?? [] }}
          onClose={() => setEditing(false)}
          onSaved={(updated) => { setContact((prev: any) => ({ ...prev, ...updated })); setEditing(false); }}
        />
      )}
      {showTemplates && (
        <TemplateSelector
          contact={{ firstName: contact.firstName, lastName: contact.lastName, company: contact.company, email: contact.email }}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
