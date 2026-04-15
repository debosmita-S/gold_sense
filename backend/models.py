"""Pydantic schemas for GoldSense AI API."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class VisionResult(BaseModel):
    jewelry_type: str = "other"
    hallmark_detected: bool = False
    hallmark_text: str = "none"
    hallmark_confidence: float = 0.0
    color_purity_estimate: str = "unclear"
    color_purity_confidence: float = 0.0
    surface_condition: str = "worn"
    plating_indicators: bool = False
    plating_confidence: float = 0.0
    hollow_indicators: bool = False
    hollow_confidence: float = 0.0
    fake_hallmark_risk: Literal["low", "medium", "high"] = "medium"
    fake_hallmark_reasoning: str = ""
    coin_reference_detected: bool = False
    estimated_visual_size: str = "medium"
    fraud_flags: list[str] = Field(default_factory=list)
    overall_authenticity_confidence: float = 0.5
    analysis_notes: str = ""
    image_quality: Literal["good", "poor"] = "good"


class AudioResult(BaseModel):
    dominant_frequency_hz: float = 0.0
    resonance_decay_rate: float = 0.0
    material_score: float = 0.5
    material_interpretation: str = "unclear"
    audio_confidence: float = 0.0


class WeightResult(BaseModel):
    weight_min_g: float = 0.0
    weight_max_g: float = 0.0
    weight_confidence: float = 0.5
    method_used: str = "volume_lookup"


class FusionResult(BaseModel):
    purity_confidence: float = 0.0
    purity_band: str = "18K–22K (uncertain)"
    weight_confidence: float = 0.0
    weight_min_g: float = 0.0
    weight_max_g: float = 0.0
    authenticity_score: float = 0.0
    fraud_risk: Literal["LOW", "MEDIUM", "HIGH"] = "MEDIUM"
    lending_signal: Literal["PRE_APPROVE", "NEEDS_VERIFICATION", "REJECT"] = (
        "NEEDS_VERIFICATION"
    )
    loan_value_min_inr: Optional[float] = None
    loan_value_max_inr: Optional[float] = None
    explainability_points: list[str] = Field(default_factory=list)
    calculation_breakdown: dict[str, Any] = Field(default_factory=dict)
    fraud_flags: list[str] = Field(default_factory=list)
    gold_price_per_gram_inr: float = 7200.0
    gold_price_fallback: bool = False


class DeclaredData(BaseModel):
    jewelry_type: str = "other"
    declared_weight_g: Optional[float] = None
    purchase_year: Optional[int] = None


class AssessmentResponse(BaseModel):
    success: bool = True
    error: Optional[str] = None
    fallback: bool = False
    vision_unavailable: bool = False
    image_quality: Optional[Literal["good", "poor"]] = None

    vision: Optional[VisionResult] = None
    audio: AudioResult = Field(default_factory=AudioResult)
    weight: WeightResult = Field(default_factory=WeightResult)
    fusion: FusionResult = Field(default_factory=FusionResult)

    declared_weight_inconsistency: bool = False
    assessment_id: str = ""
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    class Config:
        json_schema_extra: dict[str, Any] = {}


class GoldPriceResponse(BaseModel):
    price_per_gram_inr: float
    source: str
    timestamp: str


class HealthResponse(BaseModel):
    status: str = "ok"
