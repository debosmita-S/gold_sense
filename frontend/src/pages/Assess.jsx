import { useState } from "react";
import { Link } from "react-router-dom";
import ImageUploadZone from "../components/ImageUploadZone.jsx";
import AudioRecorder from "../components/AudioRecorder.jsx";
import AssessmentCard from "../components/AssessmentCard.jsx";
import { assess } from "../api/client.js";

const PROCESS_STEPS = [
  "Analyzing images…",
  "Reading hallmark…",
  "Processing audio…",
  "Estimating volume…",
  "Computing confidence score…",
  "Generating report…",
];

export default function Assess() {
  const [slots, setSlots] = useState({
    front: null,
    hallmark: null,
    side: null,
    coin: null,
  });

  const setSlot = (key, file) => {
    setSlots((s) => ({ ...s, [key]: file }));
  };

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

  const imageCount =
    [slots.front, slots.hallmark, slots.side, slots.coin].filter(Boolean).length;

  const canNext1 = slots.front && slots.hallmark && imageCount >= 2;

  const stepLabel =
    phase === "capture1" ? 1 : phase === "capture2" ? 2 : 3;

  const submitAll = async () => {
    setError(null);
    setPhase("processing");
    setProcIdx(0);
    const iv = setInterval(() => {
      setProcIdx((i) => (i + 1) % PROCESS_STEPS.length);
    }, 2200);

    const fd = new FormData();
    const ordered = [slots.front, slots.hallmark, slots.side, slots.coin].filter(
      Boolean
    );
    ordered.forEach((f) => fd.append("images", f, f.name || "photo.jpg"));
    fd.append("jewelry_type", jewelryType);
    if (declaredWeight) fd.append("declared_weight_g", declaredWeight);
    if (purchaseYear) fd.append("purchase_year", purchaseYear);
    if (audioBlob && !skipAudio) {
      fd.append("audio", audioBlob, "tap.webm");
    }
    if (billFile) fd.append("bill", billFile, billFile.name || "bill.jpg");

    try {
      const data = await assess(fd);
      clearInterval(iv);
      setResult(data);
      setPhase("results");
      try {
        const list = JSON.parse(
          localStorage.getItem("goldsense_assessments") || "[]"
        );
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
        localStorage.setItem(
          "goldsense_assessments",
          JSON.stringify(list.slice(0, 50))
        );
      } catch {
        /* ignore */
      }
    } catch (e) {
      clearInterval(iv);
      setError(e?.response?.data?.detail || e.message || "Request failed");
      setPhase("capture2");
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-20 pt-8 sm:max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 hover:text-amber-300">
          ← Home
        </Link>
        <span className="text-xs text-slate-500">
          Step {stepLabel} of 3
        </span>
      </div>

      {phase === "capture1" && (
        <section>
          <h1 className="text-xl font-bold text-white">Capture photos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Add at least two images including required front and hallmark shots.
          </p>
          <div className="mt-6 space-y-4">
            <ImageUploadZone
              label="Front view"
              required
              description="Clear, well-lit front of the jewelry."
              value={slots.front}
              onFile={(f) => setSlot("front", f)}
              onRemove={() => setSlot("front", null)}
            />
            <ImageUploadZone
              label="Hallmark / stamp closeup"
              required
              description="Legible stamp or BIS mark if visible."
              value={slots.hallmark}
              onFile={(f) => setSlot("hallmark", f)}
              onRemove={() => setSlot("hallmark", null)}
            />
            <ImageUploadZone
              label="Side / thickness view"
              required={false}
              description="Shows profile and thickness."
              value={slots.side}
              onFile={(f) => setSlot("side", f)}
              onRemove={() => setSlot("side", null)}
            />
            <ImageUploadZone
              label="Place a ₹5 coin next to jewelry"
              required={false}
              description="Optional scale reference."
              value={slots.coin}
              onFile={(f) => setSlot("coin", f)}
              onRemove={() => setSlot("coin", null)}
            />
          </div>
          <button
            type="button"
            disabled={!canNext1}
            onClick={() => setPhase("capture2")}
            className="mt-8 w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-slate-950 disabled:opacity-40"
          >
            Continue
          </button>
        </section>
      )}

      {phase === "capture2" && (
        <section>
          <h1 className="text-xl font-bold text-white">Audio & details</h1>
          <p className="mt-1 text-sm text-slate-400">
            Optional 3-second tap test — place mic near the piece and tap
            gently.
          </p>

          <div className="mt-6 space-y-6">
            <AudioRecorder
              audioBlob={audioBlob}
              onBlob={setAudioBlob}
              skipAudio={skipAudio}
              onSkipChange={setSkipAudio}
            />

            <div className="grid gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4">
              <label className="text-xs text-slate-400">
                Jewelry type
                <select
                  value={jewelryType}
                  onChange={(e) => setJewelryType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
                >
                  {["ring", "bangle", "chain", "necklace", "earring", "other"].map(
                    (o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="text-xs text-slate-400">
                Self-reported weight (grams, optional)
                <input
                  value={declaredWeight}
                  onChange={(e) => setDeclaredWeight(e.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Purchase year (optional)
                <input
                  value={purchaseYear}
                  onChange={(e) => setPurchaseYear(e.target.value)}
                  type="number"
                  min="1970"
                  max="2100"
                  className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-400">
                Purchase bill photo (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full text-xs"
                />
              </label>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </p>
          ) : null}

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setPhase("capture1")}
              className="flex-1 rounded-2xl border border-slate-600 py-3 text-sm font-semibold text-slate-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={submitAll}
              className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-slate-950"
            >
              Run assessment
            </button>
          </div>
        </section>
      )}

      {phase === "processing" && (
        <section className="text-center">
          <h1 className="text-xl font-bold text-white">Processing</h1>
          <p className="mt-2 text-sm text-slate-400">Estimated time ~15 seconds</p>
          <div className="mx-auto mt-8 h-2 max-w-xs overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-400" />
          </div>
          <p className="mt-6 text-sm font-medium text-amber-300">
            {PROCESS_STEPS[procIdx]}
          </p>
          <ul className="mt-6 space-y-2 text-left text-xs text-slate-500">
            {PROCESS_STEPS.map((s, i) => (
              <li key={s} className={i === procIdx ? "text-amber-200" : ""}>
                {i + 1}. {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {phase === "results" && result && (
        <section>
          <AssessmentCard
            data={result}
            fusion={result.fusion}
            vision={result.vision}
            weight={result.weight}
          />

          <div className="mt-6 space-y-3">
            <details className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-200">
                Why this result?
              </summary>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-slate-400">
                {(result.fusion?.explainability_points || []).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </details>

            <button
              type="button"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(result, null, 2)],
                  { type: "application/json" }
                );
                const u = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = u;
                a.download = `goldsense-${result.assessment_id}.json`;
                a.click();
                URL.revokeObjectURL(u);
              }}
              className="w-full rounded-2xl border border-slate-600 py-3 text-sm font-semibold text-slate-100"
            >
              Share report (download JSON summary)
            </button>
            <button
              type="button"
              onClick={() => {
                const shareUrl = `${window.location.origin}${window.location.pathname}#/report/${result.assessment_id}`;
                navigator.clipboard.writeText(shareUrl).catch(() => {});
                alert("Link copied — paste anywhere to share (demo placeholder).");
              }}
              className="w-full rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-slate-100"
            >
              Copy shareable link
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setPhase("capture1");
                setSlots({
                  front: null,
                  hallmark: null,
                  side: null,
                  coin: null,
                });
                setAudioBlob(null);
                setBillFile(null);
              }}
              className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-slate-950"
            >
              Start new assessment
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
