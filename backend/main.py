"""GoldSense AI — FastAPI application."""

from __future__ import annotations

import os
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import List, Optional

# Load .env before any module reads os.environ
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from demo import run_demo_scenario
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fusion import fuse_signals
from gold_price import fetch_gold_price_inr_per_gram, sync_timestamp
from models import AssessmentResponse, AudioResult, DeclaredData, HealthResponse
from audio import analyze_audio
from vision import analyze_images, vision_fallback_minimal
from weight import estimate_weight

app = FastAPI(title="GoldSense AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/gold-price")
async def gold_price():
    price, source, _fb = await fetch_gold_price_inr_per_gram()
    return {
        "price_per_gram_inr": price,
        "source": source,
        "timestamp": sync_timestamp(),
    }


@app.post("/api/demo/run", response_model=AssessmentResponse)
async def demo_run(scenario: str = Form(...)):
    try:
        return run_demo_scenario(scenario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.post("/api/assess", response_model=AssessmentResponse)
async def assess(
    images: List[UploadFile] = File(...),
    audio: Optional[UploadFile] = File(None),
    bill: Optional[UploadFile] = File(None),
    jewelry_type: str = Form("other"),
    declared_weight_g: Optional[str] = Form(None),
    purchase_year: Optional[str] = Form(None),
):
    vision_unavailable = False
    fallback = False
    err: Optional[str] = None

    if not images or len(images) < 1:
        raise HTTPException(status_code=400, detail="At least one image required")

    if bill and bill.filename:
        await bill.read()

    tmp_paths: list[str] = []
    tmp_dir = tempfile.mkdtemp(prefix="goldsense_")
    try:
        for uf in images[:5]:
            suffix = Path(uf.filename or "img.jpg").suffix or ".jpg"
            p = os.path.join(tmp_dir, f"{uuid.uuid4().hex}{suffix}")
            content = await uf.read()
            with open(p, "wb") as f:
                f.write(content)
            tmp_paths.append(p)

        vision_res, v_err = await analyze_images(tmp_paths)
        if v_err in ("vision_unavailable", "parse_error"):
            vision_unavailable = True
            fallback = True
            err = "vision_unavailable"
            vision_res = vision_fallback_minimal(
                jewelry_type,
                float(declared_weight_g) if declared_weight_g else None,
            )

        audio_bytes: Optional[bytes] = None
        if audio and audio.filename:
            audio_bytes = await audio.read()
        audio_res = analyze_audio(audio_bytes)

        dw: Optional[float] = None
        if declared_weight_g:
            try:
                dw = float(declared_weight_g)
            except ValueError:
                dw = None
        py: Optional[int] = None
        if purchase_year:
            try:
                py = int(purchase_year)
            except ValueError:
                py = None

        wt, extra_flags = estimate_weight(
            vision_res,
            dw,
            jewelry_type or vision_res.jewelry_type,
        )

        declared = DeclaredData(
            jewelry_type=jewelry_type or vision_res.jewelry_type,
            declared_weight_g=dw,
            purchase_year=py,
        )

        price, _src, price_fb = await fetch_gold_price_inr_per_gram()

        fusion = fuse_signals(
            vision_res,
            audio_res,
            wt,
            declared,
            gold_price_per_gram=price,
            gold_price_fallback=price_fb,
            vision_fallback_mode=vision_unavailable,
            extra_fraud_flags=extra_flags,
        )

        iq = vision_res.image_quality
        resp = AssessmentResponse(
            success=True,
            error=err,
            fallback=fallback,
            vision_unavailable=vision_unavailable,
            image_quality=iq if iq == "poor" else None,
            vision=vision_res,
            audio=audio_res,
            weight=wt,
            fusion=fusion,
            declared_weight_inconsistency="declared_weight_inconsistency"
            in (extra_flags or []),
            assessment_id=str(uuid.uuid4()),
        )
        return resp
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# Import AssessmentResponse for __all__
__all__ = ["app"]
