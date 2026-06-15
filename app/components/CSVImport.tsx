"use client";
import { useState, useRef } from "react";

interface ImportResult {
  imported: number;
  total: number;
}

interface Props {
  onClose: () => void;
  onImported: (count: number) => void;
}

export default function CSVImport({ onClose, onImported }: Props) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parsePreview = (text: string) => {
    const lines = text.trim().split(/\r?\n/).slice(0, 6);
    return lines.map((l) =>
      l.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g)?.map((v) =>
        v.trim().replace(/^"|"$/g, "")
      ) ?? []
    );
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsv(text);
      setPreview(parsePreview(text));
      setResult(null);
      setError("");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  };

  const doImport = async () => {
    if (!csv) return;
    setImporting(true);
    setError("");
    const res = await fetch("/api/contacts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Import failed");
    } else {
      setResult(data);
      onImported(data.imported);
    }
    setImporting(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div className="modal-title">Import Contacts from CSV</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {result ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
              {result.imported} contacts imported
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
              {result.total - result.imported} rows skipped (missing first name)
            </div>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className="form-stack">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed var(--border)", borderRadius: 10, padding: "28px 20px",
                textAlign: "center", cursor: "pointer", transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {csv ? "File loaded — click to replace" : "Drop a CSV file here"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>or click to browse</div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {preview.length > 0 && (
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Preview (first 5 rows)</div>
                <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "var(--surface-2)" }}>
                        {preview[0].map((h, i) => (
                          <th key={i} style={{ padding: "7px 10px", textAlign: "left", color: "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((row, i) => (
                        <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                          {row.map((cell, j) => (
                            <td key={j} style={{ padding: "6px 10px", color: "var(--foreground)", whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  Supported columns: First Name, Last Name, Email, Phone, Company, Tags, Notes
                </div>
              </div>
            )}

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={doImport} disabled={!csv || importing}>
                {importing ? "Importing..." : `Import${preview.length > 1 ? ` (~${preview.length - 1}+ contacts)` : ""}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
