@echo off
echo ========================================================
echo  Groundwater Level Prediction System (Groundwater AI)
echo ========================================================
echo Starting Backend API server on http://127.0.0.1:8000 ...
start "Groundwater AI - Backend" cmd /k "cd /d C:\code\groundwater-level-prediction && venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend Dashboard on http://127.0.0.1:5173 ...
start "Groundwater AI - Frontend" cmd /k "cd /d C:\code\groundwater-level-prediction\frontend && npm run dev -- --host"

echo ========================================================
echo Both servers have been launched in separate windows!
echo - Frontend: http://127.0.0.1:5173
echo - Backend:  http://127.0.0.1:8000
echo - API Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
