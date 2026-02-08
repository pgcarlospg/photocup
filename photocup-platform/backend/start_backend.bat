@echo off
cd /d C:\Users\pgcar\Documents\Experimentos\Photocup\photocup-platform\backend
call venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 0.0.0.0 --port 5001 --log-level debug
