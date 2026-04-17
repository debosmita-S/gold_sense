import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ImageUploadZone from "../components/ImageUploadZone.jsx";
import AudioRecorder from "../components/AudioRecorder.jsx";
import AssessmentCard from "../components/AssessmentCard.jsx";
import { assess } from "../api/client.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
/* ─── Icons ─────────────────────────────────────────────────────────────── */
function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

/* ─── Step Progress Bar ─────────────────────────────────────────────────── */
const STEP_LABELS = ["Photos", "Details", "Result"];

function StepBar({ current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const isDone = current > num;
          const isActive = current === num;
          return (
            <div key={label} className="flex items-center" style={{ flex: i < 2 ? "1" : "none" }}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`step-dot ${isDone ? "done" : isActive ? "active" : "pending"}`}>
                  {isDone ? <IconCheck /> : num}
                </div>
                <span
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: isActive ? "var(--gold)" : isDone ? "var(--text-secondary)" : "var(--text-muted)" }}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className="step-line mx-3 mb-5"
                  style={{ background: isDone ? "rgba(212,168,67,0.4)" : "rgba(255,255,255,0.07)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section Label ─────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}

/* ─── Processing Steps ──────────────────────────────────────────────────── */
const PROCESS_STEPS = [
  "Analyzing images…",
  "Reading hallmark…",
  "Processing audio…",
  "Estimating volume…",
  "Computing confidence…",
  "Generating report…",
];

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function Assess() {
  const [slots, setSlots] = useState({ front: null, hallmark: null, side: null, coin: null });
  const setSlot = (key, file) => setSlots((s) => ({ ...s, [key]: file }));

  const [jewelryType, setJewelryType] = useState("bangle");
  const [declaredWeight, setDeclaredWeight] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [skipAudio, setSkipAudio] = useState(false);

  const [phase, setPhase] = useState("capture1");
  const [procIdx, setProcIdx] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const intervalRef = useRef(null);
  const imageCount = Object.values(slots).filter(Boolean).length;
  const canNext1 = slots.front && slots.hallmark && imageCount >= 2;

  const stepNum = phase === "capture1" ? 1 : phase === "capture2" ? 2 : 3;

  const submitAll = async () => {
    setError(null);
    setPhase("processing");
    setProcIdx(0);
    intervalRef.current = setInterval(() => {
      setProcIdx((i) => (i + 1) % PROCESS_STEPS.length);
    }, 2200);

    const fd = new FormData();
    const ordered = [slots.front, slots.hallmark, slots.side, slots.coin].filter(Boolean);
    ordered.forEach((f) => fd.append("images", f, f.name || "photo.jpg"));
    fd.append("jewelry_type", jewelryType);
    if (declaredWeight) fd.append("declared_weight_g", declaredWeight);
    if (purchaseYear) fd.append("purchase_year", purchaseYear);
    if (audioBlob && !skipAudio) fd.append("audio", audioBlob, "tap.webm");
    if (billFile) fd.append("bill", billFile, billFile.name || "bill.jpg");

    try {
      const data = await assess(fd);
      clearInterval(intervalRef.current);
      setResult(data);
      setPhase("results");
      try {
        const list = JSON.parse(localStorage.getItem("goldsense_assessments") || "[]");
        list.unshift({
          id: data.assessment_id,
          jewelry_type: data.vision?.jewelry_type || jewelryType,
          weight_band: `${data.weight?.weight_min_g?.toFixed(0)}–${data.weight?.weight_max_g?.toFixed(0)}g`,
          purity: data.fusion?.purity_band,
          risk: data.fusion?.fraud_risk,
          signal: data.fusion?.lending_signal,
          timestamp: data.timestamp,
          payload: data,
        });
        localStorage.setItem("goldsense_assessments", JSON.stringify(list.slice(0, 50)));
      } catch { /* ignore */ }
    } catch (e) {
      clearInterval(intervalRef.current);
      setError(e?.response?.data?.detail || e.message || "Request failed");
      setPhase("capture2");
    }
  };

  return (
    <div className="relative min-h-screen page-enter">
      <div className="bg-mesh" />
      <div className="relative z-10 mx-auto max-w-lg px-5 pb-24 pt-8 sm:max-w-xl">

        {/* Nav */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--gold-light)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <IconArrowLeft /> Home
          </Link>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <IconShield style={{ color: "var(--gold)" }} />
            Secure · Encrypted
          </div>
        </div>

        {/* Step progress */}
        {phase !== "results" && <StepBar current={stepNum} />}

        {/* ── Phase: capture1 ── */}
        {phase === "capture1" && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Upload jewelry photos
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                At minimum, provide a front view and a hallmark closeup.
              </p>
            </div>
            <div className="space-y-3">
              <ImageUploadZone label="Front view" slotKey="front" required description="Clear, well-lit front of the piece." value={slots.front} onFile={(f) => setSlot("front", f)} onRemove={() => setSlot("front", null)} />
              <ImageUploadZone label="Hallmark / stamp closeup" slotKey="hallmark" required description="BIS mark or purity stamp, legible." value={slots.hallmark} onFile={(f) => setSlot("hallmark", f)} onRemove={() => setSlot("hallmark", null)} />
              <ImageUploadZone label="Side / thickness view" slotKey="side" required={false} description="Profile shows volume for weight estimation." value={slots.side} onFile={(f) => setSlot("side", f)} onRemove={() => setSlot("side", null)} />
              <ImageUploadZone label="Scale reference (₹5 coin)" slotKey="coin" required={false} description="Place coin beside piece for size calibration." value={slots.coin} onFile={(f) => setSlot("coin", f)} onRemove={() => setSlot("coin", null)} />
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled={!canNext1}
                onClick={() => setPhase("capture2")}
                className="btn-primary w-full"
              >
                Continue to Details <IconArrow />
              </button>
              {!canNext1 && (
                <p className="mt-2.5 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Front view and hallmark photo are required to continue.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Phase: capture2 ── */}
        {phase === "capture2" && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Audio test &amp; details
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                Optional 3-second tap — improves material confidence score.
              </p>
            </div>

            <div className="space-y-4">
              <AudioRecorder audioBlob={audioBlob} onBlob={setAudioBlob} skipAudio={skipAudio} onSkipChange={setSkipAudio} />

              {/* Details form */}
              <div
                className="rounded-xl p-4 space-y-4"
                style={{ background: "rgba(13,21,38,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <SectionLabel>Jewelry details</SectionLabel>

                <label className="block">
                  <span className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Type
                  </span>
                  <select
                    value={jewelryType}
                    onChange={(e) => setJewelryType(e.target.value)}
                    className="gs-input select"
                  >
                    {["ring", "bangle", "chain", "necklace", "earring", "other"].map((o) => (
                      <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Self-reported weight (grams) <span style={{ color: "var(--text-muted)" }}>— optional</span>
                  </span>
                  <input
                    value={declaredWeight}
                    onChange={(e) => setDeclaredWeight(e.target.value)}
                    type="number" min="0" step="0.1"
                    placeholder="e.g. 15.5"
                    className="gs-input"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Purchase year <span style={{ color: "var(--text-muted)" }}>— optional</span>
                  </span>
                  <input
                    value={purchaseYear}
                    onChange={(e) => setPurchaseYear(e.target.value)}
                    type="number" min="1970" max="2100"
                    placeholder="e.g. 2019"
                    className="gs-input"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Purchase bill photo <span style={{ color: "var(--text-muted)" }}>— optional</span>
                  </span>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                    className="text-xs w-full"
                    style={{ color: "var(--text-muted)" }}
                  />
                </label>
              </div>
            </div>

            {error && (
              <div
                className="mt-4 rounded-xl px-4 py-3 text-xs"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}
              >
                {typeof error === "string" ? error : JSON.stringify(error)}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setPhase("capture1")}
                className="btn-ghost flex-1"
              >
                <IconArrowLeft /> Back
              </button>
              <button
                type="button"
                onClick={submitAll}
                className="btn-primary flex-1"
              >
                Run Assessment <IconArrow />
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: processing ── */}
        {phase === "processing" && (
          <div className="text-center pt-8">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)", animation: "spin 2s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Analyzing your item</h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>Estimated time ~15 seconds</p>

            {/* Progress bar */}
            <div
              className="mx-auto mt-8 max-w-xs overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", height: 6 }}
            >
              <div className="progress-bar-fill" style={{ width: `${((procIdx + 1) / PROCESS_STEPS.length) * 100}%` }} />
            </div>

            <p className="mt-5 text-sm font-semibold" style={{ color: "var(--gold)" }}>
              {PROCESS_STEPS[procIdx]}
            </p>

            <ul className="mt-6 space-y-1.5 text-left text-xs max-w-xs mx-auto">
              {PROCESS_STEPS.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-2 transition-colors"
                  style={{ color: i === procIdx ? "var(--gold-light)" : i < procIdx ? "var(--text-muted)" : "rgba(255,255,255,0.15)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: i === procIdx ? "var(--gold)" : i < procIdx ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Phase: results ── */}
        {phase === "results" && result && (
          <div>
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--gold)" }}>Assessment complete</p>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Your report</h1>
            </div>

            <AssessmentCard data={result} fusion={result.fusion} vision={result.vision} weight={result.weight} />

            {/* Explainability */}
            <details
              className="mt-4 rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,21,38,0.5)" }}
            >
              <summary
                className="cursor-pointer select-none px-4 py-3 text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Why this result?
              </summary>
              <ul className="px-4 pb-4 list-disc pl-9 space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                {(result.fusion?.explainability_points || []).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </details>

            {/* Actions */}
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  const doc = new jsPDF();
                  
                  doc.setFontSize(22);
                  doc.setTextColor(212, 168, 67);
                  doc.text("GoldSense AI Assessment Report", 14, 22);
                  
                  doc.setFontSize(11);
                  doc.setTextColor(80, 80, 80);
                  doc.text(`Assessment ID: ${result.assessment_id}`, 14, 32);
                  doc.text(`Date: ${new Date(result.timestamp || Date.now()).toLocaleString()}`, 14, 38);

                  autoTable(doc, {
                    startY: 48,
                    head: [['Metric', 'Analysis Result']],
                    body: [
                      ['Jewelry Type', result.vision?.jewelry_type || 'Unknown'],
                      ['Est. Weight', `${result.weight?.weight_min_g?.toFixed(1) || '?'}g - ${result.weight?.weight_max_g?.toFixed(1) || '?'}g`],
                      ['Purity Band', result.fusion?.purity_band || 'N/A'],
                      ['Fraud Risk', result.fusion?.fraud_risk || 'N/A'],
                      ['Lending Signal', result.fusion?.lending_signal || 'N/A']
                    ],
                    theme: 'grid',
                    headStyles: { fillColor: [212, 168, 67] }
                  });

                  let finalY = doc.lastAutoTable.finalY || 100;
                  
                  doc.setFontSize(14);
                  doc.setTextColor(40, 40, 40);
                  doc.text("Explainability & Reasoning", 14, finalY + 14);
                  
                  const points = (result.fusion?.explainability_points || []).map(p => `• ${p}`);
                  doc.setFontSize(10);
                  doc.setTextColor(80, 80, 80);
                  doc.text(points, 14, finalY + 22, { maxWidth: 180 });
                  
                  doc.save(`goldsense-report-${result.assessment_id}.pdf`);
                }}
                className="btn-ghost w-full"
              >
                Download PDF report
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult(null); setPhase("capture1");
                  setSlots({ front: null, hallmark: null, side: null, coin: null });
                  setAudioBlob(null); setBillFile(null);
                }}
                className="btn-primary w-full"
              >
                Start new assessment
              </button>
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
              This is a preliminary AI-assisted estimate. Final value verified at branch.
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
