@echo off
echo ========================================
echo  Microsoft Fabric MCP Server Setup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    if exist .env.example (
        echo Creating .env from .env.example...
        copy .env.example .env
        echo.
        echo IMPORTANT: Edit .env with your Azure credentials:
        echo   - AZURE_TENANT_ID
        echo   - AZURE_CLIENT_ID  
        echo   - AZURE_CLIENT_SECRET
        echo   - POWERBI_WORKSPACE_ID (optional)
        echo.
    )
)

echo Installing dependencies...
call npm install

echo.
echo Building TypeScript...
call npm run build

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env with your Azure credentials
echo 2. Add to Claude Desktop config
echo 3. Restart Claude Desktop
echo.
echo See README.md for detailed instructions.
echo.
pause
