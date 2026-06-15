"use client";
import { useEffect, useState, useCallback } from "react";
import { Task } from "@/app/types";
import TaskList from "@/app/components/TaskList";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"open" | "overdue" | "today" | "all">("open");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tasks?filter=${filter}`);
    setTasks(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const overdue = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
  const rest = tasks.filter((t) => !overdue.includes(t));

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{tasks.filter((t) => !t.completed).length} open</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["open", "today", "overdue", "all"] as const).map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(f)}
          >
            {f === "open" ? "Open" : f === "today" ? "Due Today" : f === "overdue" ? "Overdue" : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      ) : (
        <div className="table-wrap" style={{ padding: 20 }}>
          {overdue.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                ⚠ Overdue ({overdue.length})
              </div>
              <TaskList tasks={overdue} onChanged={load} />
            </div>
          )}
          {rest.length > 0 ? (
            <TaskList tasks={rest} onChanged={load} />
          ) : overdue.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✅</div>
              <h3>All clear!</h3>
              <p>No {filter === "all" ? "" : filter + " "}tasks found.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
