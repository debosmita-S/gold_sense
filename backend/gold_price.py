"""Live gold price fetcher with fallback."""

from __future__ import annotations

import os
from datetime import datetime, timezone

import httpx

FALLBACK_INR_PER_GRAM = 7200.0
DEFAULT_METALPRICEAPI_KEY = "03fdd3097e7998d11a92f7d2808a6e0b"


async def fetch_gold_price_inr_per_gram() -> tuple[float, str, bool]:
    """
    Returns (price_per_gram_inr, source_label, used_fallback).
    Tries goldapi.io then metalpriceapi.com; falls back to mock.
    """
    goldapi_key = os.environ.get("GOLDAPI_IO_KEY", "").strip()
    metal_key = os.environ.get("METALPRICEAPI_KEY", "").strip() or DEFAULT_METALPRICEAPI_KEY

    async with httpx.AsyncClient(timeout=12.0) as client:
        if goldapi_key:
            try:
                r = await client.get(
                    "https://www.goldapi.io/api/XAU/INR",
                    headers={"x-access-token": goldapi_key},
                )
                if r.status_code == 200:
                    data = r.json()
                    # goldapi returns price per troy ounce in INR
                    price_oz = float(data.get("price", 0) or 0)
                    if price_oz > 0:
                        per_gram = price_oz / 31.1035
                        return per_gram, "goldapi.io", False
            except Exception:
                pass

        if metal_key:
            try:
                # Requested integration:
                # https://api.metalpriceapi.com/v1/latest?api_key=...&base=USD&currencies=EUR,XAU,XAG
                # We also request INR to compute INR/gram directly and reliably.
                r = await client.get(
                    "https://api.metalpriceapi.com/v1/latest",
                    params={
                        "api_key": metal_key,
                        "base": "USD",
                        "currencies": "EUR,XAU,XAG,INR",
                    },
                )
                if r.status_code == 200:
                    data = r.json()
                    rates = data.get("rates", {}) or {}
                    xau_rate = rates.get("XAU")  # 1 USD = XAU ounces
                    inr_rate = rates.get("INR")  # 1 USD = INR
                    if xau_rate and inr_rate and float(xau_rate) > 0 and float(inr_rate) > 0:
                        usd_per_oz = 1.0 / float(xau_rate)
                        inr_per_oz = usd_per_oz * float(inr_rate)
                        per_gram = inr_per_oz / 31.1035
                        if per_gram > 1000:
                            return per_gram, "metalpriceapi.com(usd-xau-inr)", False
            except Exception:
                pass

    return FALLBACK_INR_PER_GRAM, "fallback_mock_7200", True


def sync_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()
