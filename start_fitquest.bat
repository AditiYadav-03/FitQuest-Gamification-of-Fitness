@echo off
title FitQuest Full-Stack Launcher
echo ===================================================
echo     FitQuest - Gamification of Physical Fitness
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "FitQuest Backend (FastAPI)" cmd /k "cd backend && ..\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "FitQuest Frontend (React/Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Servers are launching in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000
echo - API Docs: http://localhost:8000/api/v1/docs
echo.
echo Demo Accounts:
echo   Alex Rivers (Athlete): alex@fitquest.com / AlexPass123!
echo   Admin Portal (Admin):   admin@fitquest.com / AdminPass123!
echo ===================================================
timeout /t 5
