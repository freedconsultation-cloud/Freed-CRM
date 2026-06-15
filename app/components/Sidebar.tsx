"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div>
          <div className="sidebar-logo-text">Freed CRM</div>
          <div className="sidebar-logo-sub">CUSTOMER RELATIONS</div>
        </div>
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
        <a
          href="/intake"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}
        >
          🔗 Client Intake Form ↗
        </a>
        <a
          href="https://freedprojects.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: "var(--text-muted)" }}
        >
          ← Portfolio
        </a>
      </div>
    </aside>
  );
}
