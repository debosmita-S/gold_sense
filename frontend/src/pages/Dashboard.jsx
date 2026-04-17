import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LendingSignalBadge from "../components/LendingSignalBadge.jsx";
import SidePanel from "../components/SidePanel.jsx";
import ConfidenceGauge from "../components/ConfidenceGauge.jsx";
import RiskDonut from "../components/RiskDonut.jsx";

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

const MOCK = [
  { id: "demo-mock-1", jewelry_type: "necklace", weight_band: "14–22g", purity: "18K – 22K (uncertain)", risk: "LOW",    signal: "PRE_APPROVE",        timestamp: new Date().toISOString() },
  { id: "demo-mock-2", jewelry_type: "ring",     weight_band: "3–6g",   purity: "18K – 20K",             risk: "MEDIUM", signal: "NEEDS_VERIFICATION", timestamp: new Date().toISOString() },
];

function loadStored() {
  try { return JSON.parse(localStorage.getItem("goldsense_assessments") || "[]"); }
  catch { return []; }
}

/* ─── Animated counter ──────────────────────────────────────────────────── */
function Counter({ to }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 800;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <>{val}</>;
}

/* ─── Skeleton row ───────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex gap-3 px-3 py-2.5 items-center" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="skeleton h-3.5 w-20 rounded" />
      <div className="skeleton h-3.5 w-16 rounded" />
      <div className="skeleton h-3.5 flex-1 rounded" />
      <div className="skeleton h-5 w-24 rounded-full" />
    </div>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const rows = useMemo(() => {
    const stored = loadStored();
    const merged = [...stored, ...MOCK];
    if (filter === "all") return merged;
    const map = { pre: "PRE_APPROVE", verify: "NEEDS_VERIFICATION", reject: "REJECT" };
    return merged.filter((r) => r.signal === map[filter]);
  }, [filter]);

  const stats = useMemo(() => {
    const stored = loadStored();
    const today = new Date().toDateString();
    const todayRows = stored.filter((r) => r.timestamp && new Date(r.timestamp).toDateString() === today);
    const total = todayRows.length || stored.length || 1;
    const pre  = todayRows.filter((r) => r.signal === "PRE_APPROVE").length;
    const flag = todayRows.filter((r) => r.signal !== "PRE_APPROVE").length;
    return {
      total: todayRows.length,
      prePct: Math.round((pre / total) * 100),
      flagPct: Math.round((flag / total) * 100),
    };
  }, []);

  const FILTERS = [["all","All"], ["pre","Pre-approve"], ["verify","Needs Review"], ["reject","Reject"]];
  const RISK_COLOR = { LOW: "#6EE7B7", MEDIUM: "#FCD34D", HIGH: "#FCA5A5" };

  return (
    <div className="relative min-h-screen page-enter">
      <div className="bg-mesh" />
      <div
        className="orb"
        style={{ width: 400, height: 400, top: -80, right: -80, background: "rgba(99,102,241,0.04)", filter: "blur(80px)", position: "fixed" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8">

        {/* Nav */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--gold)" }}>NBFC Portal</p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Assessment Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/assess"
              className="btn-primary text-xs px-4 py-2.5"
            >
              New Assessment
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--gold-light)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <IconArrowLeft /> Home
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
          <div className="mb-6">
            <div className="gs-card flex items-center justify-between gap-4 px-4 py-3" style={{ marginBottom: 12 }}>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Assessments today</p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}><Counter to={stats.total} /></p>
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Approval rate</p>
                <p className="text-2xl font-bold" style={{ color: "#6EE7B7" }}>{stats.prePct}%</p>
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Flagged</p>
                <p className="text-2xl font-bold" style={{ color: "#FCD34D" }}>{stats.flagPct}%</p>
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Avg loan</p>
                <p className="text-2xl font-bold" style={{ color: "var(--gold)" }}>₹{(Math.round((rows[0]?.payload?.fusion?.loan_value_min_inr || 7200))).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
              { label: "Assessments today", val: stats.total, accent: "var(--text-primary)", format: (v) => <Counter to={v} /> },
              { label: "Pre-approved",       val: stats.prePct, accent: "#6EE7B7", format: (v) => <><Counter to={v} />%</> },
              { label: "Flagged / Verify",   val: stats.flagPct, accent: "#FCD34D", format: (v) => <><Counter to={v} />%</> },
            ].map((s) => (
              <div key={s.label} className="gs-card p-3">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                <p className="mt-2 text-2xl font-bold counter-animate" style={{ color: s.accent }}>
                  {s.format(s.val)}
                </p>
              </div>
            ))}
            </div>
          </div>

          {/* Analytics strip */}
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ConfidenceGauge pct={78} />
            <RiskDonut low={62} medium={28} high={10} />
          </div>

        {/* ── Filter tabs ── */}
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map(([k, lab]) => (
                <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
              style={
                filter === k
                  ? { background: "var(--gold)", color: "#0D1117" }
                  : { background: "var(--surface-1)", color: "var(--text-muted)", border: "1px solid var(--border)" }
            }
            >
              {lab}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
          {/* Table head */}
          <div
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1.4fr_1fr] gap-0 px-3 py-2.5 text-[10px] uppercase tracking-widest font-semibold"
            style={{ background: "var(--surface-0)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
          >
            <span>ID</span><span>Type</span><span>Weight</span><span>Purity</span><span>Risk</span><span>Signal</span><span>Time</span>
          </div>

          {rows.length === 0 && (
            <>
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
            </>
          )}

          {rows.map((r) => (
            <div key={r.id}>
              <div
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1.4fr_1fr] gap-0 px-3 py-2.5 items-center cursor-pointer transition-colors text-xs"
                style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(198,168,91,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>{r.id.slice(0, 8)}…</span>
                <span className="capitalize font-medium" style={{ color: "var(--text-primary)" }}>{r.jewelry_type}</span>
                <span>{r.weight_band}</span>
                <span style={{ color: "var(--text-muted)" }}>{r.purity}</span>
                <span className="font-semibold" style={{ color: RISK_COLOR[r.risk] || "var(--text-secondary)" }}>{r.risk}</span>
                <span><LendingSignalBadge signal={r.signal} /></span>
                <span style={{ color: "var(--text-muted)", display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
                  <span>{r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModal(r); }}
                    className="text-[11px] font-semibold px-2 py-1 rounded"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    Details
                  </button>
                </span>
              </div>

              {expandedId === r.id && (
                <div key={r.id + "-exp"} className="px-4 py-3" style={{ background: "var(--surface-0)", borderBottom: "1px solid var(--border)" }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>Purity</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{r.payload?.fusion?.purity_band || "—"} — {Math.round((r.payload?.fusion?.purity_confidence || 0) * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>Weight</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{r.payload?.weight?.weight_min_g ?? "—"}g – {r.payload?.weight?.weight_max_g ?? "—"}g • {Math.round((r.payload?.fusion?.weight_confidence || 0) * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>Auth. Score</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{Math.round((r.payload?.fusion?.authenticity_score || 0) * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>Flags</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{(r.payload?.fusion?.fraud_flags || []).join(", ") || "None"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Compliance footer */}
        <p className="mt-6 text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
          Aligned with BIS hallmark guidelines · Preliminary screening only · Not a final valuation
        </p>
      </div>

      <SidePanel open={Boolean(modal)} data={modal} onClose={() => setModal(null)} />
    </div>
  );
}
