import { useState } from "react";
import LendingSignalBadge from "./LendingSignalBadge.jsx";
import ConfidenceBar from "./ConfidenceBar.jsx";

/* ─── Utility ────────────────────────────────────────────────────────────── */
function fmtINR(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/* ─── Row ────────────────────────────────────────────────────────────────── */
function Row({ label, value, bar, accent }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="text-sm font-semibold text-right" style={{ color: accent || "var(--text-primary)" }}>
          {value}
        </span>
      </div>
      {bar != null && (
          <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 overflow-hidden rounded-full" style={{ background: "rgba(31,41,51,0.06)", height: 5 }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${bar}%`,
                background: bar >= 65 ? "linear-gradient(90deg,#34D399,#6EE7B7)"
                           : bar >= 40 ? "linear-gradient(90deg,#D4A843,#F0C060)"
                           : "linear-gradient(90deg,#EF4444,#FCA5A5)",
              }}
            />
          </div>
          <span className="text-[11px] font-medium w-9 text-right" style={{ color: "var(--text-muted)" }}>{bar}%</span>
        </div>
      )}
    </div>
  );
}

/* ─── Score Chip ─────────────────────────────────────────────────────────── */
function ScoreChip({ label, pct, color }) {
  return (
    <div className="text-center">
      <div
        className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold"
        style={{
          background: `conic-gradient(${color} ${pct * 3.6}deg, transparent 0deg)`,
          color: color,
        }}
      >
        <div
          className="absolute inset-1.5 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: "var(--surface-1)", color }}
        >
          {pct}
        </div>
      </div>
      <p className="mt-2 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}

/* ─── Calculation Modal ──────────────────────────────────────────────────── */
function CalculationModal({ fusion, onClose }) {
  const b = fusion?.calculation_breakdown || {};
  
  const SECTION_INFO = {
    purity_confidence: { title: "Purity & Karat Confidence", desc: "Analyzed from surface color and hallmark legibility." },
    weight_confidence: { title: "Volume-to-Weight Confidence", desc: "Derived from visual size references and thickness." },
    authenticity_score: { title: "Overall Authenticity", desc: "Combined visual & acoustic probability of genuine gold." },
    risk_and_signal: { title: "Risk & Decision", desc: "Automated lending flags and fraud risk analysis." },
    loan_value: { title: "Valuation Metrics", desc: "Pricing details based on real-time gold rates." }
  };

  const formatKey = (k) => {
    const map = {
      vision_color_component: "Visual Color Match",
      hallmark_boost: "Hallmark Bonus",
      audio_component: "Acoustic Response",
      raw_before_fallback: "Initial Base Score",
      fallback_multiplier: "Missing Data Penalty",
      final: "Final Score",
      vision_component: "Visual Authenticity",
      hallmark_risk_adjustment: "Hallmark Risk Adjustment",
      fraud_flags_count: "Total Risk Flags",
      fraud_flags: "Active Flags",
      fraud_risk: "Risk Level",
      lending_signal: "Recommended Action",
      gold_price_per_gram_inr: "Live Gold Rate (₹/g)",
      gold_price_fallback_used: "Offline Cached Price Use",
      weight_mid_g: "Midpoint Weight (g)",
      loan_min_inr: "Suggested Min Loan",
      loan_max_inr: "Suggested Max Loan",
    };
    return map[k] || k.replace(/_/g, " ");
  };

  const formatVal = (k, v) => {
    if (Array.isArray(v)) return v.length ? v.map(x => x.replace(/_/g, " ")).join(", ") : "None";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "number") {
      if (k.includes("inr") || k.includes("price")) return `₹${Math.round(v).toLocaleString("en-IN")}`;
      if (k.includes("weight")) return `${v.toFixed(1)}g`;
      if (k === "fraud_flags_count") return v;
      if (k.includes("multiplier")) return `x${v.toFixed(2)}`;
      
      // Convert raw confidences 0.xxx to percentages
      return `${Math.round(v * 100)}%`; 
    }
    return String(v).replace(/_/g, " ");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-5 shadow-2xl page-enter flex flex-col max-h-[88vh]"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Diagnostic Breakdown</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            ✕ Close
          </button>
        </div>
        <p className="text-[11px] mb-5 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          Clear and simple metrics showing exactly how the AI derived your assessment scores.
        </p>
        
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 gs-scrollbar">
          {Object.entries(b).map(([key, section]) => {
            const info = SECTION_INFO[key] || { title: key.replace(/_/g, " "), desc: "" };
            const isObj = section && typeof section === "object" && !Array.isArray(section);
            const components = isObj ? section.components || section : {};
            
            return (
              <div key={key} className="rounded-xl p-4" style={{ background: "var(--surface-0)", border: "1px solid var(--border)" }}>
                <div className="mb-3.5">
                  <h4 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {info.title}
                  </h4>
                  {info.desc && <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{info.desc}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {Object.entries(components).map(([cKey, cVal]) => (
                    <div key={cKey} className="flex justify-between items-center text-[11.5px] pb-1" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{formatKey(cKey)}</span>
                      <span className="font-semibold text-right max-w-[50%] truncate capitalize" style={{ color: "var(--gold-light)" }} title={String(cVal)}>
                        {formatVal(cKey, cVal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Card ──────────────────────────────────────────────────────────── */
export default function AssessmentCard({ data, fusion, vision, weight }) {
  if (!fusion) return null;
  const [showCalc, setShowCalc] = useState(false);

  const wPct = Number(((fusion.weight_confidence || 0) * 100).toFixed(0));
  const pPct = Number(((fusion.purity_confidence || 0) * 100).toFixed(0));
  const aPct = Number(((fusion.authenticity_score || 0) * 100).toFixed(0));
  const jt = vision?.jewelry_type?.replace(/^\w/, (c) => c.toUpperCase()) || "—";

  const FRAUD_COLORS = { LOW: "#6EE7B7", MEDIUM: "#FCD34D", HIGH: "#FCA5A5" };
  const fraudColor = FRAUD_COLORS[fusion.fraud_risk] || "var(--text-primary)";

  return (
    <>
      <div
        className="rounded-2xl p-5 shadow-2xl"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
              {jt} · {data?.assessment_id?.slice(0, 8)}
            </p>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Assessment Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCalc(true)}
              className="btn-ghost text-[11px] px-3 py-1.5"
            >
              View scores
            </button>
            <LendingSignalBadge signal={fusion.lending_signal} />
          </div>
        </div>

        {/* Score circles */}
        <div className="flex justify-around mb-5 py-4 rounded-xl" style={{ background: "var(--surface-0)" }}>
          <ScoreChip label="Weight" pct={wPct} color="#D4A843" />
          <ScoreChip label="Purity" pct={pPct} color="#38BDF8" />
          <ScoreChip label="Authenticity" pct={aPct} color="#34D399" />
        </div>

        {/* Data rows */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "var(--surface-0)", border: "1px solid var(--border)" }}
        >
          <Row label="Purity band" value={fusion.purity_band} bar={pPct} />
          <div className="gs-divider" />
          <Row
            label="Weight estimate"
            value={`${weight?.weight_min_g?.toFixed(1) ?? "—"}g – ${weight?.weight_max_g?.toFixed(1) ?? "—"}g`}
            bar={wPct}
          />
          <div className="gs-divider" />
          <Row
            label="Authenticity"
            value={aPct >= 65 ? "Likely genuine" : aPct >= 40 ? "Uncertain" : "High risk"}
            bar={aPct}
          />
          <div className="gs-divider" />
          <Row
            label="Fraud risk"
            value={fusion.fraud_risk}
            accent={fraudColor}
          />
          <div className="gs-divider" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Est. loan range</span>
            <span className="text-sm font-bold" style={{ color: "var(--gold-light)" }}>
              {fmtINR(fusion.loan_value_min_inr)} – {fmtINR(fusion.loan_value_max_inr)}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {(data?.image_quality === "poor" || vision?.image_quality === "poor") && (
          <div
            className="mt-3 rounded-xl px-4 py-3 text-xs"
            style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", color: "#FCD34D" }}
          >
            Image quality appears poor — retake photos in better lighting for improved accuracy.
          </div>
        )}
        {data?.vision_unavailable && (
          <div
            className="mt-3 rounded-xl px-4 py-3 text-xs"
            style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "#FCA5A5" }}
          >
            Vision service unavailable — results derived from audio and declared data only.
          </div>
        )}

        {/* Fraud flags */}
        {(fusion.fraud_flags || []).length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
              Flags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {fusion.fraud_flags.map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {f.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gold price note */}
        {fusion.gold_price_per_gram_inr && (
          <p className="mt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
            Live gold price: ₹{Math.round(fusion.gold_price_per_gram_inr).toLocaleString("en-IN")}/g
            {fusion.gold_price_fallback ? " (fallback estimate)" : " (live rate)"}
          </p>
        )}
      </div>

      {showCalc && <CalculationModal fusion={fusion} onClose={() => setShowCalc(false)} />}
    </>
  );
}
