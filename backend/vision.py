"""MODULE A — Claude Vision analysis."""

from __future__ import annotations

import base64
import json
import logging
import re
from io import BytesIO
import os
from pathlib import Path
from typing import Optional

from PIL import Image, ImageStat

from models import VisionResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert gold jewelry assessor. Analyze the provided jewelry images and return a JSON object with exactly these fields:

{
  "jewelry_type": string,
  "hallmark_detected": boolean,
  "hallmark_text": string,
  "hallmark_confidence": float,
  "color_purity_estimate": string,
  "color_purity_confidence": float,
  "surface_condition": string,
  "plating_indicators": boolean,
  "plating_confidence": float,
  "hollow_indicators": boolean,
  "hollow_confidence": float,
  "fake_hallmark_risk": string,
  "fake_hallmark_reasoning": string,
  "coin_reference_detected": boolean,
  "estimated_visual_size": string,
  "fraud_flags": list[string],
  "overall_authenticity_confidence": float,
  "analysis_notes": string
}

Be conservative. If uncertain, lower confidence scores. Never fabricate hallmark text you cannot clearly read. Return ONLY valid JSON."""


def _guess_media_type(path: str) -> str:
    lower = path.lower()
    if lower.endswith(".png"):
        return "image/png"
    if lower.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"


def _image_brightness_quality(image_bytes: bytes) -> tuple[str, bool]:
    """Return (quality good|poor, is_poor)."""
    try:
        im = Image.open(BytesIO(image_bytes)).convert("L")
        im.thumbnail((256, 256))
        stat = ImageStat.Stat(im)
        mean = stat.mean[0]
        if mean < 35 or mean > 245:
            return "poor", True
        return "good", False
    except Exception:
        return "poor", True


def _extract_json(text: str) -> Optional[dict]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            try:
                return json.loads(m.group())
            except json.JSONDecodeError:
                pass
    return None


def _defaults_from_partial(data: dict) -> VisionResult:
    risk = data.get("fake_hallmark_risk", "medium")
    if risk not in ("low", "medium", "high"):
        risk = "medium"
    flags = data.get("fraud_flags") or []
    if not isinstance(flags, list):
        flags = []
    return VisionResult(
        jewelry_type=str(data.get("jewelry_type", "other")),
        hallmark_detected=bool(data.get("hallmark_detected", False)),
        hallmark_text=str(data.get("hallmark_text", "none")),
        hallmark_confidence=float(data.get("hallmark_confidence", 0.0) or 0.0),
        color_purity_estimate=str(data.get("color_purity_estimate", "unclear")),
        color_purity_confidence=float(
            data.get("color_purity_confidence", 0.0) or 0.0
        ),
        surface_condition=str(data.get("surface_condition", "worn")),
        plating_indicators=bool(data.get("plating_indicators", False)),
        plating_confidence=float(data.get("plating_confidence", 0.0) or 0.0),
        hollow_indicators=bool(data.get("hollow_indicators", False)),
        hollow_confidence=float(data.get("hollow_confidence", 0.0) or 0.0),
        fake_hallmark_risk=risk,  # type: ignore[arg-type]
        fake_hallmark_reasoning=str(data.get("fake_hallmark_reasoning", "")),
        coin_reference_detected=bool(data.get("coin_reference_detected", False)),
        estimated_visual_size=str(data.get("estimated_visual_size", "medium")),
        fraud_flags=[str(x) for x in flags],
        overall_authenticity_confidence=float(
            data.get("overall_authenticity_confidence", 0.5) or 0.5
        ),
        analysis_notes=str(data.get("analysis_notes", "")),
        image_quality="good",
    )


async def analyze_images(image_paths: list[str]) -> tuple[VisionResult, Optional[str]]:
    """
    Analyze all images in one Claude Vision call.
    Returns (VisionResult, error_code or None).
    """
    if not image_paths:
        return VisionResult(), "no_images"

    # Image quality check on first image
    first_bytes = Path(image_paths[0]).read_bytes()
    iq, poor = _image_brightness_quality(first_bytes)
    base_quality = "poor" if poor else "good"

    try:
        import anthropic

        api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")

        client = anthropic.Anthropic(api_key=api_key)
        content: list[dict] = [
            {
                "type": "text",
                "text": "Analyze these jewelry images and respond with ONLY the JSON object specified in your instructions.",
            }
        ]
        for p in image_paths:
            raw = Path(p).read_bytes()
            b64 = base64.standard_b64encode(raw).decode("ascii")
            content.append(
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": _guess_media_type(p),
                        "data": b64,
                    },
                }
            )

        msg = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )
        text = ""
        for block in msg.content:
            if block.type == "text":
                text += block.text
        data = _extract_json(text)
        if not data:
            logger.warning("Could not parse vision JSON: %s", text[:500])
            vr = VisionResult(
                analysis_notes="Vision response could not be parsed.",
                image_quality=base_quality,
            )
            vr.image_quality = iq if iq == "poor" else vr.image_quality
            return vr, "parse_error"

        vr = _defaults_from_partial(data)
        vr.image_quality = iq if iq == "poor" else "good"
        return vr, None

    except Exception as e:
        logger.exception("Vision API failed: %s", e)
        return (
            VisionResult(
                analysis_notes=f"Vision unavailable: {e!s}",
                image_quality=base_quality,
            ),
            "vision_unavailable",
        )


def vision_fallback_minimal(
    declared_jewelry_type: str,
    declared_weight: Optional[float],
) -> VisionResult:
    """Minimal vision result when API unavailable — audio + declared drive scoring."""
    return VisionResult(
        jewelry_type=declared_jewelry_type or "other",
        hallmark_detected=False,
        hallmark_text="none",
        hallmark_confidence=0.0,
        color_purity_estimate="unclear",
        color_purity_confidence=0.25,
        overall_authenticity_confidence=0.35,
        analysis_notes="Vision analysis unavailable; using audio and declared data only.",
        fraud_flags=["vision_unavailable"],
        image_quality="good",
    )
