import React from "react";

export default function SidePanel({ open, data, onClose }) {
  if (!open || !data) return null;

  const fusion = data.fusion || {};

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ pointerEvents: "auto" }}
      onClick={onClose}
    >
      <div style={{ flex: 1 }} />
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="h-full p-6 overflow-auto"
        style={{
          width: 420,
          background: "var(--surface-1)",
          borderLeft: "1px solid rgba(31,41,51,0.06)",
          boxShadow: "-8px 0 24px rgba(31,41,51,0.06)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>AI Transparency</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{data.id || data.assessment_id}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}>✕</button>
        </div>

        <div style={{ color: "var(--text-muted)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Scores</p>
          <div className="mt-2 mb-4">
            <div className="flex justify-between text-[13px] mb-1">
              <span>Purity confidence</span>
              <span className="font-semibold">{Math.round((fusion.purity_confidence || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between text-[13px] mb-1">
              <span>Weight certainty</span>
              <span className="font-semibold">{Math.round((fusion.weight_confidence || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between text-[13px] mb-1">
              <span>Authenticity</span>
              <span className="font-semibold">{Math.round((fusion.authenticity_score || 0) * 100)}%</span>
            </div>
          </div>

          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Fraud Flags</p>
          <div className="mt-2 mb-4">
            {(fusion.fraud_flags || []).length ? (
              <ul className="list-disc pl-5 text-[13px]" style={{ color: "var(--text-muted)" }}>
                {fusion.fraud_flags.map((f, i) => (
                  <li key={i}>{String(f).replace(/_/g, " ")}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>No active flags</p>
            )}
          </div>

          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Explainability</p>
          <div className="mt-2">
            {(fusion.explainability_points || []).slice(0, 12).map((p, i) => (
              <div key={i} className="text-[13px] mb-2" style={{ color: "var(--text-muted)" }}>{p}</div>
            ))}
            {!(fusion.explainability_points || []).length && (
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>No explanation available.</p>
            )}
          </div>

          <div className="mt-6">
            <p className="text-xs text-[11px]" style={{ color: "var(--text-muted)" }}>
              Live gold rate: <span className="font-semibold">{fusion.gold_price_per_gram_inr ? `₹${Math.round(fusion.gold_price_per_gram_inr).toLocaleString("en-IN")}/g` : "—"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
