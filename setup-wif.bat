@echo off
REM Simple batch file to prepare for WIF setup

echo Setting up Workload Identity Federation...
echo.

echo Step 1: Backing up current workflow...
if exist ".github\workflows\upload-database.yml" (
    copy ".github\workflows\upload-database.yml" ".github\workflows\upload-database.yml.backup"
    del ".github\workflows\upload-database.yml"
    echo ✓ Current workflow backed up
) else (
    echo ✓ No current workflow to backup
)

echo.
echo Step 2: Files ready for WIF setup
echo.
echo Files created:
echo ✓ MANUAL_WIF_SETUP.md - Step-by-step setup guide
echo ✓ .github\workflows\sync-firestore-wif.yml - New WIF workflow
echo ✓ setup-wif.ps1 - PowerShell setup script
echo ✓ setup-wif.sh - Bash setup script
echo.
echo NEXT STEPS:
echo 1. Follow the MANUAL_WIF_SETUP.md guide
echo 2. Set up WIF in Google Cloud Console
echo 3. Add GitHub secrets
echo 4. Test the new workflow
echo.
echo The manual setup is straightforward and will give you keyless authentication!
echo.
pause
