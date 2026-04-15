# GoldSense AI

Hackathon prototype: **remote gold jewelry assessment** for NBFC gold lending — React (Vite) + FastAPI + Claude Vision + librosa audio features.

## Prerequisites

- **Node.js 18+** (for the frontend)
- **Python 3.11** (for the backend)
- **Anthropic API key** for vision (`ANTHROPIC_API_KEY`)
- Optional: `GOLDAPI_IO_KEY` or `METALPRICEAPI_KEY` for live INR gold price (otherwise **₹7200/g** fallback)

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
set ANTHROPIC_API_KEY=sk-ant-...   # Windows cmd
uvicorn main:app --reload --port 8000
```

- Health: `GET http://127.0.0.1:8000/api/health`
- Assess: `POST http://127.0.0.1:8000/api/assess` (multipart)
- Demo scenarios: `POST http://127.0.0.1:8000/api/demo/run` with form field `scenario` = `a` | `b` | `c`
- Gold price: `GET http://127.0.0.1:8000/api/gold-price`

### Audio formats

Tap audio is sent as **WebM/Opus** from the browser. Analysis uses **librosa**; if decoding fails on your machine, audio is treated as **no signal** (confidence not inflated).

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown (typically `http://127.0.0.1:5173`). The dev server **proxies** `/api` to `http://127.0.0.1:8000`.

## Demo for judges

1. Open **`#/demo`** (e.g. `http://localhost:5173/#/demo`).
2. Run **Scenario A / B / C** — no physical jewelry required.
3. Optional: complete **`#/assess`** with real photos for an end-to-end run.

## Project layout

See repository `goldsense-ai/` — `backend/` modules (`vision`, `audio`, `weight`, `fusion`) and `frontend/` pages (`Landing`, `Assess`, `Dashboard`, `Demo`).

## Notes

- Outputs are **bands and confidence scores**, not exact purity or weight.
- This is a **prototype**, not a regulatory-compliant appraisal.
