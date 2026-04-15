import { useEffect, useRef, useState } from "react";

export default function AudioRecorder({
  audioBlob,
  onBlob,
  skipAudio,
  onSkipChange,
}) {
  const [status, setStatus] = useState("idle");
  const [url, setUrl] = useState(null);
  const mediaRef = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    if (!audioBlob || skipAudio) {
      setUrl(null);
      return;
    }
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
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks.current, { type: mime });
      onBlob(blob);
      setStatus("done");
    };
    rec.start();
    setStatus("recording");
    setTimeout(() => {
      if (rec.state === "recording") rec.stop();
    }, 3000);
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={skipAudio || status === "recording"}
          onClick={start}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
        >
          {status === "recording" ? "Recording…" : "Record tap test"}
        </button>
        {audioBlob && url && !skipAudio ? (
          <audio controls src={url} className="h-9 w-full max-w-xs" />
        ) : null}
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={skipAudio}
          onChange={(e) => {
            onSkipChange(e.target.checked);
            if (e.target.checked) {
              onBlob(null);
              setStatus("idle");
            }
          }}
        />
        Skip audio
        <span
          className="cursor-help border-b border-dotted border-slate-500 text-xs text-slate-500"
          title="Without a tap test, authenticity confidence relies more on photos and declared data."
        >
          Why skip?
        </span>
      </label>
    </div>
  );
}
