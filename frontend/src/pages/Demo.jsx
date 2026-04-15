import { useState } from "react";
import { Link } from "react-router-dom";
import { runDemoScenario } from "../api/client.js";
import AssessmentCard from "../components/AssessmentCard.jsx";
import LendingSignalBadge from "../components/LendingSignalBadge.jsx";

const SCENARIOS = [
  {
    id: "a",
    title: "Clean 22K bangle with clear 916 hallmark",
    blurb: "Strong hallmark read, consistent color, solid tap audio — expect PRE_APPROVE.",
  },
  {
    id: "b",
    title: "Suspicious item: color inconsistency + no hallmark",
    blurb: "Plating cues and missing stamp — expect NEEDS_VERIFICATION.",
  },
  {
    id: "c",
    title: "Declared weight mismatch",
    blurb: "Self-reported 50g vs visual volume band — flags inconsistency.",
  },
];

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
      setErr(e?.message || "Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-20 pt-8 sm:max-w-2xl">
      <Link to="/" className="text-sm text-slate-400 hover:text-amber-300">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Judge demo scenarios</h1>
      <p className="mt-2 text-sm text-slate-400">
        Runs deterministic backend scenarios — no jewelry required on stage.
      </p>

      <div className="mt-8 space-y-4">
        {SCENARIOS.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-amber-400/90">
              Scenario {s.id.toUpperCase()}
            </p>
            <h2 className="mt-1 font-semibold text-slate-100">{s.title}</h2>
            <p className="mt-2 text-xs text-slate-500">{s.blurb}</p>
            <button
              type="button"
              disabled={loading === s.id}
              onClick={() => run(s.id)}
              className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-sm font-semibold text-amber-200 hover:bg-slate-700 disabled:opacity-50"
            >
              {loading === s.id ? "Running…" : "Run scenario"}
            </button>
          </div>
        ))}
      </div>

      {err ? (
        <p className="mt-6 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </p>
      ) : null}

      {result ? (
        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-400">Lending signal:</span>
            <LendingSignalBadge signal={result.fusion?.lending_signal} />
          </div>
          <AssessmentCard
            data={result}
            fusion={result.fusion}
            vision={result.vision}
            weight={result.weight}
          />
          <details className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Explainability
            </summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-slate-400">
              {(result.fusion?.explainability_points || []).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </details>
        </div>
      ) : null}
    </div>
  );
}
