@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>&1
if errorlevel 1 (
  echo Python Launcher (py) is required to start the local music page.
  pause
  exit /b 1
)

start "Ayos Ba local server" /min py -m http.server 8765 --bind 127.0.0.1
set "attempt=0"

:wait_for_server
set /a attempt+=1
powershell -NoProfile -Command "try { $response = Invoke-WebRequest 'http://127.0.0.1:8765/index.html' -TimeoutSec 1; if ($response.StatusCode -eq 200) { exit 0 } } catch { }; exit 1" >nul 2>&1
if not errorlevel 1 (
  start "" "http://127.0.0.1:8765/index.html"
  exit /b 0
)

if %attempt% geq 20 (
  echo The local music page did not start. Port 8765 may already be in use.
  pause
  exit /b 1
)
timeout /t 1 /nobreak >nul
goto wait_for_server
