"""MODULE D — Multi-modal fusion engine."""

from __future__ import annotations

from models import AudioResult, DeclaredData, FusionResult, VisionResult, WeightResult


def _purity_band_string(vr: VisionResult) -> str:
    ht = (vr.hallmark_text or "").upper()
    if "916" in ht or "22" in ht:
        return "20K – 22K"
    if "750" in ht or "18" in ht:
        return "18K – 20K"
    if "999" in ht or "24" in ht:
        return "22K – 24K"
    ce = (vr.color_purity_estimate or "").lower()
    if "22" in ce:
        return "20K – 22K"
    if "18" in ce:
        return "18K – 20K"
    if "24" in ce:
        return "22K – 24K"
    return "18K – 22K (uncertain)"


def fuse_signals(
    vision: VisionResult,
    audio: AudioResult,
    weight: WeightResult,
    declared: DeclaredData,
    gold_price_per_gram: float,
    gold_price_fallback: bool,
    vision_fallback_mode: bool,
    extra_fraud_flags: list[str] | None = None,
) -> FusionResult:
    vr = vision

    base_purity = vr.color_purity_confidence * 0.5
    hallmark_boost = 0.35 if vr.hallmark_detected else 0.0
    audio_signal = audio.material_score * 0.15
    purity_confidence_raw = min(1.0, base_purity + hallmark_boost + audio_signal)
    purity_confidence = purity_confidence_raw

    purity_band = _purity_band_string(vr)

    weight_confidence_raw = weight.weight_confidence
    weight_confidence = weight_confidence_raw

    base_auth = vr.overall_authenticity_confidence * 0.5
    audio_contrib = audio.material_score * 0.25
    if vr.fake_hallmark_risk == "low":
        hallmark_real = 0.25
    elif vr.fake_hallmark_risk == "medium":
        hallmark_real = 0.10
    else:
        hallmark_real = -0.10
    authenticity_raw = base_auth + audio_contrib + hallmark_real
    authenticity_score = max(0.0, min(1.0, authenticity_raw))

    fraud_flags = list(vr.fraud_flags)
    if extra_fraud_flags:
        for f in extra_fraud_flags:
            if f not in fraud_flags:
                fraud_flags.append(f)

    fallback_multiplier = 0.6 if vision_fallback_mode else 1.0
    if vision_fallback_mode:
        purity_confidence = max(0.0, min(1.0, purity_confidence * fallback_multiplier))
        weight_confidence = max(0.0, min(1.0, weight_confidence * fallback_multiplier))
        authenticity_score = max(0.0, min(1.0, authenticity_score * fallback_multiplier))

    if authenticity_score < 0.40 or len(fraud_flags) >= 3:
        fraud_risk = "HIGH"
    elif authenticity_score < 0.65 or len(fraud_flags) >= 1:
        fraud_risk = "MEDIUM"
    else:
        fraud_risk = "LOW"

    if fraud_risk == "HIGH":
        lending_signal = "REJECT"
    elif fraud_risk == "MEDIUM" or purity_confidence < 0.50 or weight_confidence < 0.45:
        lending_signal = "NEEDS_VERIFICATION"
    else:
        lending_signal = "PRE_APPROVE"

    loan_min = loan_max = None
    if lending_signal != "REJECT":
        mid_w = (weight.weight_min_g + weight.weight_max_g) / 2.0
        pb = purity_band.upper()
        if "22" in pb or "20K" in pb:
            purity_factor = 22 / 24
        elif "18" in pb:
            purity_factor = 18 / 24
        else:
            purity_factor = 0.85
        gross = mid_w * gold_price_per_gram * purity_factor
        loan_min = gross * 0.65
        loan_max = gross * 0.75

    points: list[str] = []
    points.append(
        f"Purity confidence {purity_confidence:.2f} = ({vr.color_purity_confidence:.2f}*0.50) + hallmark({hallmark_boost:.2f}) + audio({audio.material_score:.2f}*0.15)."
    )
    if vr.hallmark_detected and vr.hallmark_text and vr.hallmark_text.lower() != "none":
        points.append(
            f'Hallmark "{vr.hallmark_text}" detected with confidence {vr.hallmark_confidence:.2f}; purity band mapped to {purity_band}.'
        )
    else:
        points.append(
            f"No readable hallmark detected; purity band derived from color estimate ({vr.color_purity_estimate})."
        )

    points.append(
        f"Authenticity score {authenticity_score:.2f} = ({vr.overall_authenticity_confidence:.2f}*0.50) + ({audio.material_score:.2f}*0.25) + hallmark-risk-adjustment({hallmark_real:.2f})."
    )

    if audio.audio_confidence > 0.15:
        points.append(
            f"Tap audio interpreted as {audio.material_interpretation} (dominant {audio.dominant_frequency_hz:.0f} Hz, decay {audio.resonance_decay_rate:.2f}, confidence {audio.audio_confidence:.2f})."
        )
    else:
        points.append(
            "Tap audio missing/low quality; audio contribution stayed neutral and confidence was not inflated."
        )

    points.append(
        f"Weight band estimated at {weight.weight_min_g:.1f}g-{weight.weight_max_g:.1f}g with confidence {weight_confidence:.2f}."
    )
    if declared.declared_weight_g is not None:
        points.append(
            f"Declared weight {declared.declared_weight_g:.1f}g was compared to estimated band for consistency checks."
        )
    if vr.plating_indicators:
        points.append(
            f"Plating indicators detected (confidence {vr.plating_confidence:.2f}), increasing risk."
        )
    if vr.hollow_indicators:
        points.append(
            f"Hollow indicators detected (confidence {vr.hollow_confidence:.2f}), reducing effective weight estimate."
        )
    if vision_fallback_mode:
        points.append(
            "Vision service unavailable for this run; all major confidences were multiplied by 0.60."
        )

    calc_breakdown = {
        "purity_confidence": {
            "formula": "min(1.0, (vision.color_purity_confidence*0.5) + hallmark_boost + (audio.material_score*0.15)) * fallback_multiplier",
            "components": {
                "vision_color_component": round(base_purity, 4),
                "hallmark_boost": round(hallmark_boost, 4),
                "audio_component": round(audio_signal, 4),
                "raw_before_fallback": round(purity_confidence_raw, 4),
                "fallback_multiplier": fallback_multiplier,
                "final": round(purity_confidence, 4),
            },
        },
        "weight_confidence": {
            "formula": "weight.weight_confidence * fallback_multiplier",
            "components": {
                "raw_before_fallback": round(weight_confidence_raw, 4),
                "fallback_multiplier": fallback_multiplier,
                "final": round(weight_confidence, 4),
            },
        },
        "authenticity_score": {
            "formula": "clip((vision.overall_authenticity_confidence*0.5) + (audio.material_score*0.25) + hallmark_risk_adjustment, 0, 1) * fallback_multiplier",
            "components": {
                "vision_component": round(base_auth, 4),
                "audio_component": round(audio_contrib, 4),
                "hallmark_risk_adjustment": round(hallmark_real, 4),
                "raw_before_fallback": round(max(0.0, min(1.0, authenticity_raw)), 4),
                "fallback_multiplier": fallback_multiplier,
                "final": round(authenticity_score, 4),
            },
        },
        "risk_and_signal": {
            "fraud_flags_count": len(fraud_flags),
            "fraud_flags": fraud_flags,
            "fraud_risk": fraud_risk,
            "lending_signal": lending_signal,
        },
        "loan_value": {
            "gold_price_per_gram_inr": round(gold_price_per_gram, 4),
            "gold_price_fallback_used": gold_price_fallback,
            "weight_mid_g": round((weight.weight_min_g + weight.weight_max_g) / 2.0, 4),
            "loan_min_inr": round(loan_min, 2) if loan_min is not None else None,
            "loan_max_inr": round(loan_max, 2) if loan_max is not None else None,
        },
    }

    return FusionResult(
        purity_confidence=round(purity_confidence, 4),
        purity_band=purity_band,
        weight_confidence=round(weight_confidence, 4),
        weight_min_g=weight.weight_min_g,
        weight_max_g=weight.weight_max_g,
        authenticity_score=round(authenticity_score, 4),
        fraud_risk=fraud_risk,
        lending_signal=lending_signal,
        loan_value_min_inr=loan_min,
        loan_value_max_inr=loan_max,
        explainability_points=points[:8],
        calculation_breakdown=calc_breakdown,
        fraud_flags=fraud_flags,
        gold_price_per_gram_inr=gold_price_per_gram,
        gold_price_fallback=gold_price_fallback,
    )


def fuse_signals_test_harness() -> FusionResult:
    """Hardcoded inputs to verify scoring path."""
    vr = VisionResult(
        jewelry_type="bangle",
        hallmark_detected=True,
        hallmark_text="916",
        color_purity_estimate="likely 22K",
        color_purity_confidence=0.7,
        fake_hallmark_risk="low",
        overall_authenticity_confidence=0.8,
        fraud_flags=[],
        estimated_visual_size="medium",
    )
    ar = AudioResult(material_score=0.85, audio_confidence=0.7)
    wr = WeightResult(
        weight_min_g=12.0, weight_max_g=18.0, weight_confidence=0.72
    )
    d = DeclaredData(jewelry_type="bangle", declared_weight_g=15.0)
    return fuse_signals(
        vr,
        ar,
        wr,
        d,
        gold_price_per_gram=7200.0,
        gold_price_fallback=True,
        vision_fallback_mode=False,
        extra_fraud_flags=None,
    )
