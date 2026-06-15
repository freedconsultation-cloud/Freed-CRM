"use client";
import { useState } from "react";

const TEAM_SIZES = ["1–5", "6–20", "21–50", "51–200", "200+"];
const TIMELINES = ["ASAP", "1–4 weeks", "1–3 months", "3–6 months", "Flexible"];
const BUDGETS = ["Under $2,500", "$2,500–$5,000", "$5,000–$15,000", "$15,000–$50,000", "$50,000+", "Not sure yet"];

export default function IntakePage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "",
    useCase: "", teamSize: "", timeline: "", budget: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) {
      setError("First name and email are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError("Something went wrong. Please try again."); setSubmitting(false); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--background)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, color: "var(--foreground)" }}>
            Thanks, {form.firstName}!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            We've received your request and a member of the Freed team will reach out within one business day to discuss your Smartsheet project.
          </p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" }}>
            We'll contact you at <strong style={{ color: "var(--accent)" }}>{form.email}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "40px 20px" }}>
      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Freed Consulting
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--foreground)", marginBottom: 10 }}>
            Start Your Smartsheet Project
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6 }}>
            Tell us about your needs and we'll get back to you within one business day.
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Contact info */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Contact Info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>First Name *</label>
                  <input className="field" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Jane" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Last Name</label>
                  <input className="field" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Smith" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Work Email *</label>
                <input className="field" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@company.com" required />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Phone</label>
                  <input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>Company</label>
                  <input className="field" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." />
                </div>
              </div>
            </div>
          </div>

          {/* Project info */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Project Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5 }}>What do you need help with?</label>
                <textarea
                  className="field"
                  rows={4}
                  value={form.useCase}
                  onChange={(e) => set("useCase", e.target.value)}
                  placeholder="e.g. We need to build a project tracking system in Smartsheet for our construction team. Currently using spreadsheets and it's getting out of hand..."
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Team size</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TEAM_SIZES.map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => set("teamSize", s)}
                      style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: form.teamSize === s ? "var(--accent)" : "var(--surface-2)",
                        color: form.teamSize === s ? "#fff" : "var(--text-muted)",
                        border: `1px solid ${form.teamSize === s ? "var(--accent)" : "var(--border)"}`,
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Ideal timeline</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TIMELINES.map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => set("timeline", t)}
                      style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: form.timeline === t ? "var(--accent)" : "var(--surface-2)",
                        color: form.timeline === t ? "#fff" : "var(--text-muted)",
                        border: `1px solid ${form.timeline === t ? "var(--accent)" : "var(--border)"}`,
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Budget range</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {BUDGETS.map((b) => (
                    <button
                      key={b} type="button"
                      onClick={() => set("budget", b)}
                      style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: form.budget === b ? "var(--accent)" : "var(--surface-2)",
                        color: form.budget === b ? "#fff" : "var(--text-muted)",
                        border: `1px solid ${form.budget === b ? "var(--accent)" : "var(--border)"}`,
                      }}
                    >{b}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ padding: "14px", fontSize: 15, fontWeight: 800 }} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request →"}
          </button>

          <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
            We'll respond within one business day. No spam, ever.
          </div>
        </form>
      </div>
    </div>
  );
}
