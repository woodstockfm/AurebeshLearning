@echo off
setlocal

cd /d "%~dp0"
set "PORT=8000"

where py >nul 2>&1
if %errorlevel%==0 (
  set "PYTHON_CMD=py -m"
) else (
  set "PYTHON_CMD=python -m"
)

echo Starting Aurebesh Learning on http://localhost:%PORT%/
start "" "http://localhost:%PORT%/"

%PYTHON_CMD% http.server %PORT%
