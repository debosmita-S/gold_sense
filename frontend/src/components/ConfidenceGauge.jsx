import React from "react";

export default function ConfidenceGauge({ pct = 78 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped >= 70 ? "#34D399" : clamped >= 45 ? "#FCD34D" : "#FCA5A5";

  return (
    <div className="gs-card" style={{ padding: 12 }}>
      <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>AI Confidence</p>
      <div className="flex items-center justify-between mt-2">
        <div>
          <h4 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{clamped}%</h4>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Model certainty across signals</p>
        </div>
        <div style={{ width: 72, height: 72 }}>
          <svg viewBox="0 0 36 36" style={{ width: 72, height: 72 }}>
            <path d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831" fill="none" stroke="rgba(31,41,51,0.06)" strokeWidth="3" />
            <path d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${(clamped / 100) * 100} 100`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
