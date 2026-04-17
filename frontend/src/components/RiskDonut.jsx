import React from "react";

export default function RiskDonut({ low = 62, medium = 28, high = 10 }) {
  const total = low + medium + high || 1;
  const lowPct = Math.round((low / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const highPct = Math.round((high / total) * 100);

  return (
    <div className="gs-card" style={{ padding: 12 }}>
      <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Risk distribution</p>
      <div className="flex items-center gap-4 mt-3">
        <div style={{ width: 70, height: 70 }}>
          <svg viewBox="0 0 32 32" width={70} height={70}>
            <circle r="10" cx="16" cy="16" fill="none" stroke="#6EE7B7" strokeWidth="6" strokeDasharray={`${lowPct} ${100 - lowPct}`} strokeDashoffset="0" />
            <circle r="6.5" cx="16" cy="16" fill="none" stroke="#FCD34D" strokeWidth="6" strokeDasharray={`${medPct} ${100 - medPct}`} strokeDashoffset={`${-lowPct}`} />
            <circle r="3" cx="16" cy="16" fill="none" stroke="#FCA5A5" strokeWidth="6" strokeDasharray={`${highPct} ${100 - highPct}`} strokeDashoffset={`${-(lowPct + medPct)}`} />
          </svg>
        </div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          <div><span style={{ color: "#6EE7B7", fontWeight: 700 }}>{lowPct}%</span> Low</div>
          <div><span style={{ color: "#FCD34D", fontWeight: 700 }}>{medPct}%</span> Medium</div>
          <div><span style={{ color: "#FCA5A5", fontWeight: 700 }}>{highPct}%</span> High</div>
        </div>
      </div>
    </div>
  );
}
