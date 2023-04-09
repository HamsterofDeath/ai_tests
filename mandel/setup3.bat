@echo off
setlocal enabledelayedexpansion

set "nvcc_found=false"

for /f "tokens=*" %%a in ('dir /s /b "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA" ^| findstr /i "nvcc.exe"') do (
  set "nvcc_found=true"
  set "nvcc_path=%%a"
  echo nvcc.exe found at: !nvcc_path!
)

if !nvcc_found!==false (
  echo Error: nvcc.exe not found. Please ensure the NVIDIA CUDA Toolkit is installed.
  exit /b 1
)

echo Adding the folder containing nvcc.exe to your system's PATH environment variable...
for /f "delims=" %%i in ("!nvcc_path!") do set "folder_path=%%~dpi"
setx PATH "!folder_path!;%%PATH%%"
echo Folder added to PATH: !folder_path!

echo Please restart any open command prompts or PowerShell windows for the changes to take effect.

endlocal
