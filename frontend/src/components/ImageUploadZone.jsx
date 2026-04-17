import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

function IconCamera() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

const TIPS = {
  front:    ["Ensure good lighting", "Avoid reflections", "Full piece in frame"],
  hallmark: ["Macro/close-up shot", "BIS stamp must be legible", "Avoid motion blur"],
  side:     ["Capture thickness clearly", "Shows profile for volume estimate"],
  coin:     ["Place ₹5 coin next to piece", "Provides scale reference"],
};

export default function ImageUploadZone({
  label,
  required,
  description,
  value,
  onFile,
  onRemove,
  slotKey,
}) {
  const [justDropped, setJustDropped] = useState(false);

  const preview = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value]
  );

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const onDrop = useCallback(
    (accepted) => {
      if (accepted?.[0]) {
        onFile(accepted[0]);
        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 600);
      }
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    multiple: false,
  });

  const tips = TIPS[slotKey] || [];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,21,38,0.5)" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {label}
            </p>
            {required ? (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: "rgba(212,168,67,0.12)", color: "var(--gold)" }}
              >
                REQUIRED
              </span>
            ) : (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
              >
                OPTIONAL
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <IconX /> Remove
          </button>
        )}
      </div>

      {/* Drop zone or preview */}
      {!value ? (
        <div className="px-3 pb-3">
          <div
            {...getRootProps()}
            className={`upload-zone flex flex-col items-center justify-center gap-2 py-7 px-4 text-center ${isDragActive ? "active" : ""}`}
          >
            <input {...getInputProps()} />
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                color: isDragActive ? "var(--gold)" : "var(--text-muted)",
                background: isDragActive ? "rgba(212,168,67,0.1)" : "rgba(255,255,255,0.04)",
                transition: "all 0.22s ease",
              }}
            >
              <IconCamera />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: isDragActive ? "var(--gold)" : "var(--text-secondary)" }}>
                {isDragActive ? "Drop to upload" : "Tap to capture or drag image"}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                JPEG, PNG, WebP · max 20 MB
              </p>
            </div>
          </div>

          {/* Tips */}
          {tips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 px-1">
              {tips.map((t) => (
                <span key={t} className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--gold)", opacity: 0.7 }}>→</span> {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 pb-3">
          <div className="relative overflow-hidden rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <img
              src={preview}
              alt=""
              className="h-36 w-full object-cover"
              style={{ display: "block" }}
            />
            {/* Success overlay flash */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg transition-opacity duration-300"
              style={{
                background: "rgba(52,211,153,0.15)",
                opacity: justDropped ? 1 : 0,
                pointerEvents: "none",
              }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "#34D399", color: "#0D1117" }}
              >
                <IconCheck />
              </div>
            </div>
          </div>
          {/* Uploaded badge */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: "#6EE7B7" }}>
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full"
              style={{ background: "rgba(52,211,153,0.2)" }}
            >
              <IconCheck />
            </span>
            {value.name || "Image uploaded"}
          </div>
        </div>
      )}
    </div>
  );
}
