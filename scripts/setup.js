#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Microsoft Fabric MCP Server installed!\n');
console.log('📋 Next steps:');
console.log('1. Create an Azure App Registration');
console.log('2. Configure Power BI tenant settings');
console.log('3. Add to your Claude Desktop configuration');
console.log('\nSee the README for detailed setup instructions:');
console.log('https://github.com/strainprint/microsoft-fabric-mcp#readme\n');

// Check if .env.example exists and no .env exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('💡 Tip: Copy .env.example to .env and fill in your credentials\n');
}
