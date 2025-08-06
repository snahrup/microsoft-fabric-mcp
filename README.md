# Microsoft Fabric MCP Server

A Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with Microsoft Fabric and Power BI services.

## Features

- 📊 **Power BI Integration**
  - List and query datasets
  - Execute DAX queries
  - Refresh datasets
  - Manage workspaces

- 🏭 **Microsoft Fabric Support**
  - Create and manage notebooks
  - Upload data to warehouses
  - Access Fabric workspaces

## Installation

### Via NPM (Recommended)

```bash
npm install -g @strainprint/microsoft-fabric-mcp
```

### From Source

```bash
git clone https://github.com/strainprint/microsoft-fabric-mcp.git
cd microsoft-fabric-mcp
npm install
npm run build
```

## Configuration

### 1. Azure App Registration

Create an Azure App Registration with the following permissions:
- Power BI Service (Delegated or Application):
  - Dataset.Read.All
  - Workspace.Read.All
  - Dataset.Execute.All (for DAX queries)

### 2. Power BI Tenant Settings

Enable in Power BI Admin Portal → Tenant settings:
- "Allow service principals to use Power BI APIs"
- "Service principals can access read-only admin APIs"

### 3. Environment Variables

Create a `.env` file or set environment variables:

```env
# Required
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Optional
POWERBI_WORKSPACE_ID=workspace-id  # If not set, uses workspace-agnostic endpoints
```

### 4. Claude Desktop Configuration

Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "MicrosoftFabric": {
      "command": "npx",
      "args": [
        "-y",
        "@strainprint/microsoft-fabric-mcp"
      ],
      "env": {
        "AZURE_TENANT_ID": "your-tenant-id",
        "AZURE_CLIENT_ID": "your-client-id",
        "AZURE_CLIENT_SECRET": "your-client-secret",
        "POWERBI_WORKSPACE_ID": "optional-workspace-id"
      }
    }
  }
}
```

## Usage

Once configured, Claude can use commands like:

- "List my Power BI datasets"
- "Execute this DAX query on dataset X"
- "Refresh the sales dataset"
- "Show me all workspaces"

## Available Tools

### `get_workspaces`
Get all accessible Power BI/Fabric workspaces

### `get_powerbi_datasets`
List all datasets in the configured workspace

### `execute_dax_query`
Execute DAX queries against a dataset
```javascript
{
  "datasetId": "dataset-guid",
  "query": "EVALUATE TOPN(10, 'Sales')"
}
```

### `refresh_dataset`
Trigger a dataset refresh
```javascript
{
  "datasetId": "dataset-guid"
}
```

### `create_notebook`
Create a new Fabric notebook

### `upload_to_datawarehouse`
Upload data to a Fabric data warehouse

## Troubleshooting

### 403 Forbidden Errors

1. **Check Service Principal Permissions**
   - Ensure the service principal is added to the Power BI workspace
   - Verify API permissions in Azure Portal

2. **Power BI Tenant Settings**
   - Confirm service principals are allowed to use Power BI APIs
   - Check if the service principal is in the allowed security group

3. **Token Issues**
   - Verify client secret hasn't expired
   - Ensure correct tenant ID

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Strainprint Technologies

## Credits

Developed by [Steve Adams](https://github.com/strainprint) for the MCP community.

Special thanks to Anthropic for the Model Context Protocol specification.
