"""MODULE C — Volume & weight estimation."""

from __future__ import annotations

from typing import Optional

from models import VisionResult, WeightResult

VOLUME_TABLE: dict[tuple[str, str], dict[str, float]] = {
    ("ring", "small"): {"min_cm3": 1.5, "max_cm3": 3.0},
    ("ring", "medium"): {"min_cm3": 2.5, "max_cm3": 5.0},
    ("ring", "large"): {"min_cm3": 4.0, "max_cm3": 8.0},
    ("bangle", "small"): {"min_cm3": 6.0, "max_cm3": 12.0},
    ("bangle", "medium"): {"min_cm3": 10.0, "max_cm3": 20.0},
    ("bangle", "large"): {"min_cm3": 16.0, "max_cm3": 30.0},
    ("chain", "small"): {"min_cm3": 2.0, "max_cm3": 6.0},
    ("chain", "medium"): {"min_cm3": 5.0, "max_cm3": 14.0},
    ("chain", "large"): {"min_cm3": 10.0, "max_cm3": 25.0},
    ("necklace", "medium"): {"min_cm3": 8.0, "max_cm3": 20.0},
    ("earring", "small"): {"min_cm3": 0.5, "max_cm3": 2.0},
}

DENSITY_MAP = {"18K": 15.2, "22K": 17.7, "24K": 19.3, "unknown": 16.5}


def _purity_key_from_vision(vr: VisionResult) -> str:
    ht = (vr.hallmark_text or "").upper()
    ce = (vr.color_purity_estimate or "").lower()
    if "916" in ht or "22" in ht or "22k" in ce or "22" in ce:
        return "22K"
    if "750" in ht or "18" in ht or "18k" in ce:
        return "18K"
    if "24" in ht or "24k" in ce or "999" in ht:
        return "24K"
    return "unknown"


def estimate_weight(
    vision_result: VisionResult,
    declared_weight_g: Optional[float],
    jewelry_type: str,
) -> tuple[WeightResult, list[str]]:
    extra_flags: list[str] = []
    jt = (jewelry_type or vision_result.jewelry_type or "other").lower()
    vs = (vision_result.estimated_visual_size or "medium").lower()
    if vs not in ("small", "medium", "large", "very_large"):
        vs = "medium"
    if vs == "very_large":
        vs = "large"

    key = (jt, vs)
    vol = VOLUME_TABLE.get(key)
    if not vol and jt == "necklace":
        vol = VOLUME_TABLE.get(("necklace", "medium"), {"min_cm3": 8.0, "max_cm3": 20.0})
    if not vol:
        vol = {"min_cm3": 3.0, "max_cm3": 15.0}

    vmin, vmax = vol["min_cm3"], vol["max_cm3"]
    if vision_result.hollow_indicators:
        vmin *= 0.45
        vmax *= 0.45

    purity_key = _purity_key_from_vision(vision_result)
    density = DENSITY_MAP.get(purity_key, DENSITY_MAP["unknown"])

    w_min = vmin * density
    w_max = vmax * density

    weight_confidence = 0.5
    method_used = "volume_lookup"

    if declared_weight_g is not None and declared_weight_g > 0:
        mid_est = (w_min + w_max) / 2.0
        span = max(w_max - w_min, 1e-6)
        low = mid_est - 0.4 * span
        high = mid_est + 0.4 * span
        if low <= declared_weight_g <= high:
            w_min = 0.6 * w_min + 0.4 * declared_weight_g
            w_max = 0.6 * w_max + 0.4 * declared_weight_g
            weight_confidence = min(1.0, weight_confidence + 0.15)
        elif declared_weight_g < 0.4 * w_min or declared_weight_g > 1.6 * w_max:
            extra_flags.append("declared_weight_inconsistency")
            weight_confidence = max(0.0, weight_confidence - 0.20)

    if w_min > w_max:
        w_min, w_max = w_max, w_min

    return (
        WeightResult(
            weight_min_g=float(w_min),
            weight_max_g=float(w_max),
            weight_confidence=float(weight_confidence),
            method_used=method_used,
        ),
        extra_flags,
    )
