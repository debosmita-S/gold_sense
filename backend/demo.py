"""Pre-built demo scenarios for hackathon presentation."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fusion import fuse_signals
from models import (
    AssessmentResponse,
    AudioResult,
    DeclaredData,
    VisionResult,
    WeightResult,
)


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def run_demo_scenario(scenario: str) -> AssessmentResponse:
    scenario = scenario.lower().strip()
    price = 7200.0

    if scenario == "a":
        vr = VisionResult(
            jewelry_type="bangle",
            hallmark_detected=True,
            hallmark_text="916",
            hallmark_confidence=0.88,
            color_purity_estimate="likely 22K",
            color_purity_confidence=0.78,
            surface_condition="worn",
            plating_indicators=False,
            plating_confidence=0.15,
            hollow_indicators=False,
            hollow_confidence=0.12,
            fake_hallmark_risk="low",
            fake_hallmark_reasoning="Stamp style consistent with BIS 22K markings.",
            coin_reference_detected=False,
            estimated_visual_size="medium",
            fraud_flags=[],
            overall_authenticity_confidence=0.86,
            analysis_notes="Clear 916 stamp and consistent 22K color temperature across views.",
            image_quality="good",
        )
        ar = AudioResult(
            dominant_frequency_hz=1200.0,
            resonance_decay_rate=0.28,
            material_score=0.88,
            material_interpretation="solid metal",
            audio_confidence=0.82,
        )
        wr = WeightResult(
            weight_min_g=12.0,
            weight_max_g=18.0,
            weight_confidence=0.72,
            method_used="volume_lookup",
        )
        decl = DeclaredData(
            jewelry_type="bangle", declared_weight_g=15.0, purchase_year=2021
        )
        fusion = fuse_signals(
            vr,
            ar,
            wr,
            decl,
            gold_price_per_gram=price,
            gold_price_fallback=False,
            vision_fallback_mode=False,
            extra_fraud_flags=None,
        )

    elif scenario == "b":
        vr = VisionResult(
            jewelry_type="chain",
            hallmark_detected=False,
            hallmark_text="none",
            hallmark_confidence=0.1,
            color_purity_estimate="unclear",
            color_purity_confidence=0.35,
            surface_condition="heavily_worn",
            plating_indicators=True,
            plating_confidence=0.72,
            hollow_indicators=False,
            hollow_confidence=0.2,
            fake_hallmark_risk="high",
            fake_hallmark_reasoning="Color inconsistency between links; no legible hallmark.",
            coin_reference_detected=False,
            estimated_visual_size="medium",
            fraud_flags=["color_inconsistency", "no_hallmark_visible"],
            overall_authenticity_confidence=0.62,
            analysis_notes="Uneven color between sections suggests plated or mixed-material construction.",
            image_quality="good",
        )
        ar = AudioResult(
            material_score=0.42,
            material_interpretation="possibly plated",
            audio_confidence=0.55,
            resonance_decay_rate=0.62,
        )
        wr = WeightResult(
            weight_min_g=8.0,
            weight_max_g=14.0,
            weight_confidence=0.48,
            method_used="volume_lookup",
        )
        decl = DeclaredData(jewelry_type="chain", declared_weight_g=None)
        fusion = fuse_signals(
            vr,
            ar,
            wr,
            decl,
            gold_price_per_gram=price,
            gold_price_fallback=True,
            vision_fallback_mode=False,
            extra_fraud_flags=None,
        )

    elif scenario == "c":
        vr = VisionResult(
            jewelry_type="bangle",
            hallmark_detected=True,
            hallmark_text="916",
            hallmark_confidence=0.75,
            color_purity_estimate="likely 22K",
            color_purity_confidence=0.65,
            fake_hallmark_risk="low",
            overall_authenticity_confidence=0.72,
            estimated_visual_size="medium",
            fraud_flags=[],
            hollow_indicators=False,
            plating_indicators=False,
            analysis_notes="Visual size consistent with a medium bangle; hallmark visible.",
            image_quality="good",
        )
        ar = AudioResult(material_score=0.55, audio_confidence=0.0)
        wr = WeightResult(
            weight_min_g=12.0,
            weight_max_g=18.0,
            weight_confidence=0.35,
            method_used="volume_lookup",
        )
        decl = DeclaredData(jewelry_type="bangle", declared_weight_g=50.0)
        fusion = fuse_signals(
            vr,
            ar,
            wr,
            decl,
            gold_price_per_gram=price,
            gold_price_fallback=True,
            vision_fallback_mode=False,
            extra_fraud_flags=["declared_weight_inconsistency"],
        )
    else:
        raise ValueError("unknown scenario")

    return AssessmentResponse(
        success=True,
        vision=vr,
        audio=ar,
        weight=wr,
        fusion=fusion,
        assessment_id=str(uuid.uuid4()),
        timestamp=_ts(),
        image_quality="poor" if vr.image_quality == "poor" else None,
    )
