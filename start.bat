@echo off
title Slay the Spreadsheet - dev
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js introuvable. Installe-le depuis https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Premier lancement : installation des dependances...
  call npm install
  if errorlevel 1 (
    echo [ERREUR] npm install a echoue.
    pause
    exit /b 1
  )
)

echo Lancement du serveur de dev sur http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
pause
