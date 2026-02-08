@echo off
echo Deteniendo todos los procesos Python...
taskkill /F /IM python.exe 2>nul
timeout /t 3 /nobreak >nul
echo Iniciando backend...
cd /d C:\Users\pgcar\Documents\Experimentos\Photocup\photocup-platform\backend
call venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 0.0.0.0 --port 5001 --log-level info
