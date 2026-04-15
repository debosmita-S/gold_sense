import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LendingSignalBadge from "../components/LendingSignalBadge.jsx";

const MOCK = [
  {
    id: "demo-mock-1",
    jewelry_type: "necklace",
    weight_band: "14–22g",
    purity: "18K – 22K (uncertain)",
    risk: "LOW",
    signal: "PRE_APPROVE",
    timestamp: new Date().toISOString(),
  },
  {
    id: "demo-mock-2",
    jewelry_type: "ring",
    weight_band: "3–6g",
    purity: "18K – 20K",
    risk: "MEDIUM",
    signal: "NEEDS_VERIFICATION",
    timestamp: new Date().toISOString(),
  },
];

function loadStored() {
  try {
    return JSON.parse(localStorage.getItem("goldsense_assessments") || "[]");
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);

  const rows = useMemo(() => {
    const stored = loadStored();
    const merged = [...stored, ...MOCK];
    if (filter === "all") return merged;
    const map = {
      pre: "PRE_APPROVE",
      verify: "NEEDS_VERIFICATION",
      reject: "REJECT",
    };
    const want = map[filter];
    return merged.filter((r) => r.signal === want);
  }, [filter]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const stored = loadStored();
    const todayRows = stored.filter(
      (r) => r.timestamp && new Date(r.timestamp).toDateString() === today
    );
    const total = todayRows.length || stored.length || 1;
    const pre = todayRows.filter((r) => r.signal === "PRE_APPROVE").length;
    const flag = todayRows.filter(
      (r) => r.signal !== "PRE_APPROVE"
    ).length;
    return {
      total: todayRows.length,
      prePct: Math.round((pre / total) * 100),
      flagPct: Math.round((flag / total) * 100),
    };
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-20 pt-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/90">
            NBFC
          </p>
          <h1 className="text-2xl font-bold text-white">Assessment dashboard</h1>
        </div>
        <Link
          to="/"
          className="text-sm text-slate-400 hover:text-amber-300"
        >
          ← Home
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-500">Assessments today</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-500">Pre-approved %</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.prePct}%</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs text-slate-500">Flagged / verify %</p>
          <p className="mt-1 text-2xl font-bold text-amber-300">{stats.flagPct}%</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["pre", "Pre-approve"],
          ["verify", "Verify"],
          ["reject", "Reject"],
        ].map(([k, lab]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === k
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {lab}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Weight band</th>
              <th className="px-3 py-3">Purity</th>
              <th className="px-3 py-3">Risk</th>
              <th className="px-3 py-3">Signal</th>
              <th className="px-3 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => setModal(r)}
                className="cursor-pointer hover:bg-slate-800/40"
              >
                <td className="px-3 py-2 font-mono text-xs text-slate-400">
                  {r.id.slice(0, 8)}…
                </td>
                <td className="px-3 py-2 capitalize text-slate-200">
                  {r.jewelry_type}
                </td>
                <td className="px-3 py-2 text-slate-300">{r.weight_band}</td>
                <td className="px-3 py-2 text-slate-400">{r.purity}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      r.risk === "LOW"
                        ? "text-emerald-400"
                        : r.risk === "MEDIUM"
                          ? "text-amber-300"
                          : "text-red-400"
                    }
                  >
                    {r.risk}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <LendingSignalBadge signal={r.signal} />
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {r.timestamp
                    ? new Date(r.timestamp).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold text-white">Assessment detail</h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 font-mono text-xs text-slate-500">{modal.id}</p>
            {modal.payload ? (
              <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-[10px] text-slate-400">
                {JSON.stringify(modal.payload.fusion || modal.payload, null, 2)}
              </pre>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Mock row — run a live assessment from the customer flow to store
                full JSON locally.
              </p>
            )}
            <button
              type="button"
              onClick={() => setModal(null)}
              className="mt-6 w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-slate-950"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
