"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/contacts", icon: "👥", label: "Contacts" },
  { href: "/pipeline", icon: "📋", label: "Pipeline" },
  { href: "/activities", icon: "🕐", label: "Activity" },
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
          <Link
            key={n.href}
            href={n.href}
            className={`nav-link ${path.startsWith(n.href) ? "active" : ""}`}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
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
