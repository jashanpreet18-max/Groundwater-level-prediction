# Deployment guide: Groundwater Level Prediction System

## Recommended hosting layout
- Frontend (React + Vite): Vercel
- Backend (FastAPI + forecasting models): Render

The Vercel error in the supplied screenshot occurs because Vercel is detecting the repository's Python backend from the repository root. Deploy the `frontend` folder as the Vercel project root instead.

## 1. Deploy the frontend on Vercel
1. Import the GitHub repository into Vercel (or open the existing Vercel project).
2. Open **Settings → Build and Deployment**.
3. Set **Root Directory** to `frontend` and save.
4. Framework preset: **Vite**.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Install command: `npm install` (or leave Vercel's default).
8. Add environment variable `VITE_API_URL` with the backend URL plus `/api`, for example `https://YOUR-SERVICE.onrender.com/api`.
9. Redeploy.

Do not set the Vercel root directory to the repository root. The frontend's `vercel.json` already contains the SPA rewrite to `/index.html`.

## 2. Deploy the backend on Render
1. Create a Render **Web Service** from the same GitHub repository.
2. Set **Root Directory** to `.` (repository root).
3. Runtime: Python.
4. Build command: `pip install -r requirements.txt`.
5. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
6. Use Python 3.11 if Render asks for a version.
7. After deployment, test `https://YOUR-SERVICE.onrender.com/` and `https://YOUR-SERVICE.onrender.com/api/health`.

The repository includes a `render.yaml` with the corresponding service configuration. If Render asks for a Blueprint, you can use that file instead of manually entering the commands.

## 3. Connect frontend and backend
In Vercel → Project → Settings → Environment Variables, set:

`VITE_API_URL=https://YOUR-SERVICE.onrender.com/api`

Use the real Render service hostname. Redeploy the Vercel frontend after changing the variable; Vite environment variables are embedded at build time.

## 4. Important checks
- Ensure the backend service has access to `data/raw/cgwb_dwlr_sample.csv`; this file is included in the repository.
- Test the backend `/docs` page and `/api/health` endpoint.
- Test dashboard data, station selection, forecast, model performance, trend analysis and CSV upload from the deployed frontend.
- The bundled CSV is documented by the project as synthetic demonstration data, not verified official CGWB telemetry.
- Render free instances may sleep when idle and take time to wake. Persistent uploaded files may not survive redeploys unless stored in persistent storage or an external database/object store.

## 5. Current limitations / verification
This guide configures a split deployment. It does not deploy to your account automatically; you must authorize GitHub/Vercel/Render and choose the repository in those services. Do not share passwords, API tokens or private keys in chat.
