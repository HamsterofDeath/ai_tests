@echo off
setlocal enabledelayedexpansion

set "cuda_h_found=false"

for /f "tokens=*" %%a in ('dir /s /b "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA" ^| findstr /i "cuda.h"') do (
  set "cuda_h_found=true"
  set "cuda_h_path=%%a"
  echo CUDA.h found at: !cuda_h_path!
)

if !cuda_h_found!==false (
  echo Error: cuda.h not found. Please ensure the NVIDIA CUDA Toolkit is installed.
  exit /b 1
)

echo Adding the folder containing cuda.h to your system's PATH environment variable...
for /f "delims=" %%i in ("!cuda_h_path!") do set "folder_path=%%~dpi"
setx PATH "!folder_path!;%%PATH%%"
echo Folder added to PATH: !folder_path!

echo Please restart any open command prompts or PowerShell windows for the changes to take effect.

endlocal
