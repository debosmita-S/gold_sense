import { useState } from "react";
import LendingSignalBadge from "./LendingSignalBadge.jsx";
import ConfidenceBar from "./ConfidenceBar.jsx";

function fmtINR(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function AssessmentCard({ data, fusion, vision, weight }) {
  if (!fusion) return null;
  const [showCalc, setShowCalc] = useState(false);

  const wPct = Number(((fusion.weight_confidence || 0) * 100).toFixed(1));
  const pPct = Number(((fusion.purity_confidence || 0) * 100).toFixed(1));
  const aPct = Number(((fusion.authenticity_score || 0) * 100).toFixed(1));

  const jt =
    vision?.jewelry_type?.replace(/^\w/, (c) => c.toUpperCase()) || "—";

  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight text-slate-50">
          Assessment
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCalc(true)}
            className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:border-amber-400"
            title="See score calculations"
          >
            👁 View calculation
          </button>
          <LendingSignalBadge signal={fusion.lending_signal} />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-950/50 p-4 text-sm">
        <Row
          label="Jewelry type"
          value={jt}
          big
        />
        <hr className="border-slate-700/80" />
        <Row
          label="Weight band"
          value={`${weight?.weight_min_g?.toFixed(0) ?? "—"}g – ${weight?.weight_max_g?.toFixed(0) ?? "—"}g`}
          bar={wPct}
        />
        <Row
          label="Purity band"
          value={fusion.purity_band}
          bar={pPct}
        />
        <Row
          label="Authenticity"
          value={
            fusion.authenticity_score >= 0.65
              ? "Likely genuine"
              : fusion.authenticity_score >= 0.4
                ? "Uncertain"
                : "High risk"
          }
          bar={aPct}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-400">Fraud risk</span>
          <span
            className={`font-semibold ${
              fusion.fraud_risk === "LOW"
                ? "text-emerald-400"
                : fusion.fraud_risk === "MEDIUM"
                  ? "text-amber-300"
                  : "text-red-400"
            }`}
          >
            {fusion.fraud_risk}
          </span>
        </div>
        <hr className="border-slate-700/80" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">Lending signal</span>
          <LendingSignalBadge signal={fusion.lending_signal} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">Est. loan value</span>
          <span className="font-semibold text-amber-300">
            {fmtINR(fusion.loan_value_min_inr)} – {fmtINR(fusion.loan_value_max_inr)}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <ConfidenceBar
          weightPct={wPct}
          purityPct={pPct}
          authPct={aPct}
        />
      </div>

      {data?.image_quality === "poor" || vision?.image_quality === "poor" ? (
        <p className="mt-4 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Image quality looks poor — please retake photos in good lighting.
        </p>
      ) : null}

      {data?.vision_unavailable ? (
        <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200">
          Vision service unavailable — results use reduced confidence fusion.
        </p>
      ) : null}

      {showCalc ? (
        <CalculationModal
          fusion={fusion}
          onClose={() => setShowCalc(false)}
        />
      ) : null}
    </div>
  );
}

function Row({ label, value, bar, big }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-slate-400">{label}</span>
        <span
          className={`text-right font-medium text-slate-100 ${big ? "text-base" : ""}`}
        >
          {value}
        </span>
      </div>
      {bar != null ? (
        <div className="mt-1 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
              style={{ width: `${bar}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{bar}%</span>
        </div>
      ) : null}
    </div>
  );
}

function CalculationModal({ fusion, onClose }) {
  const b = fusion?.calculation_breakdown || {};
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">
            Score Calculation Breakdown
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <pre className="rounded-xl bg-slate-950 p-3 text-[11px] text-slate-300">
          {JSON.stringify(b, null, 2)}
        </pre>
        <p className="mt-3 text-xs text-slate-400">
          These values are computed per assessment from uploaded image/audio/declaration signals.
        </p>
      </div>
    </div>
  );
}
