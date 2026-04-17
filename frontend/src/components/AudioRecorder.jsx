import { useEffect, useRef, useState } from "react";

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function IconMic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}
function IconStop() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
  );
}

export default function AudioRecorder({ audioBlob, onBlob, skipAudio, onSkipChange }) {
  const [status, setStatus] = useState("idle");
  const [url, setUrl] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const mediaRef = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!audioBlob || skipAudio) { setUrl(null); return; }
    const u = URL.createObjectURL(audioBlob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [audioBlob, skipAudio]);

  const start = async () => {
    if (skipAudio) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks.current = [];
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    mediaRef.current = rec;
    rec.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
      setElapsed(0);
      const blob = new Blob(chunks.current, { type: mime });
      onBlob(blob);
      setStatus("done");
    };
    rec.start();
    setStatus("recording");
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 3000);
  };

  const stopEarly = () => {
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(13,21,38,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
        Tap test audio
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {status !== "recording" ? (
          <button
            type="button"
            disabled={skipAudio}
            onClick={start}
            className="btn-primary text-xs px-4 py-2.5 gap-2"
            style={{ opacity: skipAudio ? 0.35 : 1 }}
          >
            <IconMic />
            {status === "done" ? "Re-record" : "Record tap test"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopEarly}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold"
            style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <IconStop /> Stop ({3 - elapsed}s)
          </button>
        )}

        {/* Recording pulse indicator */}
        {status === "recording" && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "#FCA5A5" }}>
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Recording…
          </div>
        )}

        {/* Playback */}
        {audioBlob && url && !skipAudio && status !== "recording" && (
          <audio controls src={url} className="h-8 flex-1 min-w-[160px] max-w-[240px]" />
        )}
      </div>

      {/* Progress bar when recording */}
      {status === "recording" && (
        <div className="mt-3 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)", height: 4 }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(elapsed / 3) * 100}%`, background: "linear-gradient(90deg,#EF4444,#FCA5A5)", transition: "width 1s linear" }}
          />
        </div>
      )}

      {/* Skip checkbox */}
      <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-xs" style={{ color: "var(--text-muted)" }}>
        <input
          type="checkbox"
          checked={skipAudio}
          onChange={(e) => {
            onSkipChange(e.target.checked);
            if (e.target.checked) { onBlob(null); setStatus("idle"); }
          }}
          className="rounded"
        />
        <span>Skip audio test</span>
        <span
          className="cursor-help border-b border-dotted text-[11px]"
          style={{ borderColor: "var(--text-muted)", color: "var(--text-muted)" }}
          title="Without a tap test, authenticity confidence relies more on photos and declared data."
        >
          Why skip?
        </span>
      </label>
    </div>
  );
}
