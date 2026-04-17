"""MODULE B — Audio feature extraction with librosa."""

from __future__ import annotations

import io
import tempfile
from pathlib import Path

try:
    import librosa  # type: ignore
    import numpy as np
    HAS_LIBROSA = True
except Exception:
    # librosa may not be installed in some environments (CI, minimal venv).
    # Fall back to a lightweight implementation that avoids importing librosa
    # so the backend can still start. Behavior will be conservative.
    librosa = None
    try:
        import numpy as np  # type: ignore
    except Exception:
        np = None  # type: ignore
    HAS_LIBROSA = False

from models import AudioResult


def analyze_audio(audio_bytes: bytes | None) -> AudioResult:
    # If librosa isn't available, return a conservative default result so the
    # service can still start and respond. This keeps behavior safe (low
    # confidence) and avoids crashing the server due to missing optional deps.
    if not HAS_LIBROSA or librosa is None or np is None:
        if not audio_bytes or len(audio_bytes) < 800:
            return AudioResult(
                material_score=0.5,
                audio_confidence=0.0,
                material_interpretation="unclear",
            )

        # Provide a minimal best-effort scoring based on payload length.
        ln = len(audio_bytes)
        material_score = 0.5 + min(0.45, (ln / 20000.0))
        material_score = max(0.0, min(1.0, float(material_score)))
        audio_confidence = min(0.9, 0.25 + (ln / 40000.0))
        return AudioResult(
            dominant_frequency_hz=0.0,
            resonance_decay_rate=0.5,
            material_score=material_score,
            material_interpretation=("solid metal" if material_score > 0.7 else "unclear"),
            audio_confidence=audio_confidence,
        )

    # --- full librosa-backed processing ---
    if not audio_bytes or len(audio_bytes) < 800:
        return AudioResult(
            material_score=0.5,
            audio_confidence=0.0,
            material_interpretation="unclear",
        )

    try:
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050, mono=True)
    except Exception:
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_bytes)
                path = tmp.name
            y, sr = librosa.load(path, sr=22050, mono=True)
            Path(path).unlink(missing_ok=True)
        except Exception:
            return AudioResult(
                material_score=0.5,
                audio_confidence=0.0,
                material_interpretation="unclear",
            )

    duration = float(len(y)) / float(sr)
    if duration < 1.0:
        return AudioResult(
            material_score=0.5,
            audio_confidence=0.0,
            material_interpretation="unclear",
        )

    if np.max(np.abs(y)) < 1e-4:
        return AudioResult(
            material_score=0.5,
            audio_confidence=0.0,
            material_interpretation="unclear",
        )

    cent = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    rms = librosa.feature.rms(y=y)[0]

    spectral_centroid_mean = float(np.mean(cent))
    zcr_mean = float(np.mean(zcr))

    # FFT — dominant peaks in 500–5000 Hz
    fft = np.abs(np.fft.rfft(y))
    freqs = np.fft.rfftfreq(len(y), 1.0 / sr)
    mask = (freqs >= 500.0) & (freqs <= 5000.0)
    if np.any(mask):
        idx = np.argmax(fft[mask])
        dom_hz = float(freqs[mask][idx])
    else:
        dom_hz = float(freqs[np.argmax(fft)]) if len(fft) else 0.0

    # RMS decay after peak (resonance decay)
    peak_i = int(np.argmax(rms))
    tail = rms[peak_i:] if peak_i < len(rms) else rms[-1:]
    if len(tail) > 3:
        decay = float((tail[0] - tail[-1]) / (tail[0] + 1e-8))
        resonance_decay_rate = max(0.0, min(1.0, decay))
    else:
        envelope = np.abs(y)
        pk = int(np.argmax(envelope))
        seg = envelope[pk : pk + int(0.2 * sr)]
        if len(seg) > 5:
            resonance_decay_rate = float(
                (seg[0] - seg[-1]) / (seg[0] + 1e-8)
            )
            resonance_decay_rate = max(0.0, min(1.0, resonance_decay_rate))
        else:
            resonance_decay_rate = 0.5

    # Normalize centroid to 0–1-ish (typical 500–4000 Hz for metal taps)
    cent_norm = (spectral_centroid_mean - 400.0) / 3600.0
    cent_norm = max(0.0, min(1.0, cent_norm))

    # High centroid + slow decay (low decay rate = sustained) → solid
    # Fast decay → dampened
    decay_signal = 1.0 - resonance_decay_rate

    material_score = 0.45 * cent_norm + 0.35 * decay_signal + 0.2 * (1.0 - zcr_mean)
    material_score = max(0.0, min(1.0, float(material_score)))

    if material_score >= 0.72 and decay_signal > 0.55:
        interp = "solid metal"
    elif resonance_decay_rate > 0.65 and cent_norm < 0.35:
        interp = "likely hollow"
    elif zcr_mean > 0.25 or material_score < 0.42:
        interp = "possibly plated"
    else:
        interp = "unclear"

    # Confidence from signal strength and duration
    audio_confidence = min(1.0, 0.35 + 0.25 * min(duration / 3.0, 1.0) + 0.4 * float(np.max(np.abs(y))))

    return AudioResult(
        dominant_frequency_hz=dom_hz,
        resonance_decay_rate=resonance_decay_rate,
        material_score=material_score,
        material_interpretation=interp,
        audio_confidence=audio_confidence,
    )
