"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchModal from "@/app/components/SearchModal";

const NAV = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/contacts", icon: "👥", label: "Contacts" },
  { href: "/accounts", icon: "🏢", label: "Accounts" },
  { href: "/pipeline", icon: "📋", label: "Pipeline" },
  { href: "/reports", icon: "📈", label: "Reports" },
  { href: "/activities", icon: "🕐", label: "Activity" },
  { href: "/tasks", icon: "✅", label: "Tasks" },
];

const SETTINGS = [
  { href: "/settings/packages", icon: "📦", label: "Packages" },
  { href: "/settings/templates", icon: "✉️", label: "Templates" },
];

export default function Sidebar() {
  const path = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div>
            <div className="sidebar-logo-text">Freed CRM</div>
            <div className="sidebar-logo-sub">CUSTOMER RELATIONS</div>
          </div>
        </div>

        <div style={{ padding: "0 8px 8px" }}>
          <button
            onClick={() => setShowSearch(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 8, background: "var(--surface-2)",
              border: "1px solid var(--border)", cursor: "pointer", fontSize: 12,
              color: "var(--text-muted)", fontFamily: "inherit",
            }}
          >
            <span>🔍</span>
            <span style={{ flex: 1, textAlign: "left" }}>Search...</span>
            <span style={{ fontSize: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px" }}>⌘K</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`nav-link ${path.startsWith(n.href) ? "active" : ""}`}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </Link>
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 10px 4px" }}>
            Settings
          </div>
          {SETTINGS.map((n) => (
            <Link key={n.href} href={n.href} className={`nav-link ${path.startsWith(n.href) ? "active" : ""}`}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="/intake" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
            🔗 Client Intake Form ↗
          </a>
          <a href="https://freedprojects.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            ← Portfolio
          </a>
        </div>
      </aside>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
