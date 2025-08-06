@echo off
echo Setting up Microsoft Fabric MCP Server...
echo.

echo Installing dependencies...
call npm install

echo.
echo Building TypeScript...
call npm run build

echo.
echo Setup complete!
echo.
echo To add to Claude Desktop, add this to your config:
echo {
echo   "mcpServers": {
echo     "microsoft-fabric": {
echo       "command": "node",
echo       "args": ["%CD%\\dist\\index.js"]
echo     }
echo   }
echo }
echo.
pause
