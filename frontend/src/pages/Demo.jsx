import { useState } from "react";
import { Link } from "react-router-dom";
import { runDemoScenario } from "../api/client.js";
import AssessmentCard from "../components/AssessmentCard.jsx";
import LendingSignalBadge from "../components/LendingSignalBadge.jsx";

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}

const SCENARIOS = [
  {
    id: "a",
    tag: "Scenario A",
    title: "Clean 22K bangle — 916 hallmark",
    blurb: "Strong hallmark read, consistent color, solid tap audio.",
    expected: "PRE_APPROVE",
  },
  {
    id: "b",
    tag: "Scenario B",
    title: "Suspicious item — color mismatch, no stamp",
    blurb: "Plating indicators and missing hallmark trigger flags.",
    expected: "NEEDS_VERIFICATION",
  },
  {
    id: "c",
    tag: "Scenario C",
    title: "Declared weight mismatch",
    blurb: "Self-reported 50g vs visual volume band — inconsistency alert.",
    expected: "NEEDS_VERIFICATION",
  },
];

const EXPECTED_COLOR = {
  PRE_APPROVE:        "#6EE7B7",
  NEEDS_VERIFICATION: "#FCD34D",
  REJECT:             "#FCA5A5",
};

export default function Demo() {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  const run = async (id) => {
    setLoading(id);
    setErr(null);
    try {
      const data = await runDemoScenario(id);
      setResult(data);
    } catch (e) {
      setErr(e?.message || "Failed to run scenario");
    } finally {
      setLoading(null);
    }
  };

  return (
          <div className="relative min-h-screen page-enter">
      <div className="bg-mesh" />
      <div className="relative z-10 mx-auto max-w-lg px-5 pb-24 pt-8 sm:max-w-2xl">

        {/* Nav */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium mb-8 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--gold-light)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <IconArrowLeft /> Home
        </Link>

        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--gold)" }}>
            Deterministic Demo
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Scenario Explorer</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Pre-built scenarios — no real jewelry required. Each run is deterministic and backend-computed.
          </p>
        </div>

        {/* Scenario cards */}
        <div className="space-y-3 mb-8">
          {SCENARIOS.map((s) => (
            <div
              key={s.id}
              className="gs-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ background: "rgba(212,168,67,0.1)", color: "var(--gold)" }}
                  >
                    {s.tag}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-0)", color: EXPECTED_COLOR[s.expected] }}
                  >
                    → {s.expected.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{s.blurb}</p>
              </div>
              <button
                type="button"
                disabled={loading === s.id}
                onClick={() => run(s.id)}
                className="btn-ghost text-xs px-4 py-2.5 flex-shrink-0 flex items-center gap-2"
                style={{ opacity: loading === s.id ? 0.5 : 1 }}
              >
                {loading === s.id ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Running…
                  </>
                ) : (
                  <><IconPlay /> Run</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
                {err && (
                  <div
                    className="mb-6 rounded-xl px-4 py-3 text-xs"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", color: "#FCA5A5" }}
                  >
                    {err}
                  </div>
                )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Lending signal:</span>
              <LendingSignalBadge signal={result.fusion?.lending_signal} />
            </div>
            <AssessmentCard data={result} fusion={result.fusion} vision={result.vision} weight={result.weight} />
                    <details
                       className="rounded-xl overflow-hidden"
                       style={{ border: "1px solid var(--border)", background: "var(--surface-1)" }}
                     >
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Explainability
              </summary>
              <ul className="px-4 pb-4 list-disc pl-9 space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                {(result.fusion?.explainability_points || []).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </details>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-10 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
          Demo scenarios are deterministic — not connected to live gold prices or real images. For presentation only.
        </p>
      </div>
    </div>
  );
}
