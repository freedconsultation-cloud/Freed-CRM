"use client";
import { useState } from "react";
import Link from "next/link";
import { Task } from "@/app/types";

function formatDue(d: Date | string | null | undefined) {
  if (!d) return null;
  const date = new Date(d);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: "var(--red)" };
  if (diffDays === 0) return { label: "Due today", color: "var(--yellow)" };
  if (diffDays === 1) return { label: "Due tomorrow", color: "var(--yellow)" };
  return { label: `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, color: "var(--text-muted)" };
}

interface Props {
  tasks: Task[];
  contactId?: string;
  dealId?: string;
  onChanged?: () => void;
  compact?: boolean;
}

export default function TaskList({ tasks: initial, contactId, dealId, onChanged, compact }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    onChanged?.();
  };

  const remove = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    onChanged?.();
  };

  const add = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        dueDate: newDue || null,
        contactId: contactId || null,
        dealId: dealId || null,
      }),
    });
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    setNewTitle("");
    setNewDue("");
    setAdding(false);
    setSaving(false);
    onChanged?.();
  };

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Add task */}
      {adding ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="field"
            style={{ flex: 1, minWidth: 160 }}
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            autoFocus
          />
          <input
            className="field"
            type="date"
            style={{ width: 140 }}
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={add} disabled={saving || !newTitle.trim()}>
            {saving ? "..." : "Add"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(false); setNewTitle(""); setNewDue(""); }}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setAdding(true)}>
          + Add task
        </button>
      )}

      {tasks.length === 0 && !adding && (
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No tasks yet</div>
      )}

      {open.map((task) => {
        const due = formatDue(task.dueDate);
        return (
          <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <button
              onClick={() => toggle(task)}
              style={{
                width: 18, height: 18, borderRadius: 4, border: "2px solid var(--border)",
                background: "transparent", flexShrink: 0, marginTop: 2, cursor: "pointer",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                {due && <span style={{ fontSize: 11, color: due.color, fontWeight: 600 }}>{due.label}</span>}
                {!compact && task.contact && (
                  <Link href={`/contacts/${task.contact.id}`} style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {task.contact.firstName} {task.contact.lastName}
                  </Link>
                )}
                {!compact && task.deal && (
                  <Link href={`/pipeline/${task.deal.id}`} style={{ fontSize: 11, color: "var(--blue)" }}>
                    {task.deal.title}
                  </Link>
                )}
              </div>
            </div>
            <button
              onClick={() => remove(task.id)}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 14, cursor: "pointer", padding: "0 4px", flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        );
      })}

      {done.length > 0 && !compact && (
        <details style={{ marginTop: 4 }}>
          <summary style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
            {done.length} completed
          </summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {done.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.5 }}>
                <button
                  onClick={() => toggle(task)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, border: "2px solid var(--green)",
                    background: "var(--green)", flexShrink: 0, cursor: "pointer", fontSize: 10, color: "#fff",
                  }}
                >✓</button>
                <div style={{ fontSize: 13, textDecoration: "line-through" }}>{task.title}</div>
                <button onClick={() => remove(task.id)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", marginLeft: "auto" }}>✕</button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
