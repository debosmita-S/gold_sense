import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUploadZone({
  label,
  required,
  description,
  value,
  onFile,
  onRemove,
}) {
  const preview = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value]
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = useCallback(
    (accepted) => {
      if (accepted?.[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/50 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            {label}{" "}
            {required ? (
              <span className="text-amber-400">*</span>
            ) : (
              <span className="text-slate-500">(optional)</span>
            )}
          </p>
          {description ? (
            <p className="text-xs text-slate-400">{description}</p>
          ) : null}
        </div>
      </div>
      {!value ? (
        <div
          {...getRootProps()}
          className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-3 py-4 text-center transition ${
            isDragActive
              ? "border-amber-400 bg-amber-500/10"
              : "border-slate-600 hover:border-amber-500/60"
          }`}
        >
          <input {...getInputProps()} />
          <span className="text-2xl">📷</span>
          <p className="mt-1 text-xs text-slate-400">
            Tap to upload or drag image here
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-slate-600">
          <img
            src={preview}
            alt=""
            className="h-36 w-full object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
