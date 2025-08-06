#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import { powerBIClient } from './powerbi-client';
import { fabricClient } from './fabric-client';

dotenv.config();

// Tool schemas
const GetDatasetsSchema = z.object({});

const ExecuteDaxQuerySchema = z.object({
  datasetId: z.string().describe('The ID of the dataset'),
  query: z.string().describe('The DAX query to execute'),
});

const RefreshDatasetSchema = z.object({
  datasetId: z.string().describe('The ID of the dataset to refresh'),
});

const CreateNotebookSchema = z.object({
  workspaceId: z.string().describe('The workspace ID'),
  name: z.string().describe('Name of the notebook'),
  content: z.any().describe('Notebook content/definition'),
});

const UploadToDataWarehouseSchema = z.object({
  workspaceId: z.string().describe('The workspace ID'),
  warehouseId: z.string().describe('The data warehouse ID'),
  tableName: z.string().describe('Name of the table'),
  data: z.array(z.any()).describe('Array of data rows to upload'),
});

// Create MCP server
const server = new Server(
  {
    name: 'microsoft-fabric-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_powerbi_datasets',
        description: 'Get all Power BI datasets in the workspace',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'execute_dax_query',
        description: 'Execute a DAX query on a Power BI dataset',
        inputSchema: {
          type: 'object',
          properties: {
            datasetId: {
              type: 'string',
              description: 'The ID of the dataset',
            },
            query: {
              type: 'string',
              description: 'The DAX query to execute',
            },
          },
          required: ['datasetId', 'query'],
        },
      },      {
        name: 'refresh_dataset',
        description: 'Refresh a Power BI dataset',
        inputSchema: {
          type: 'object',
          properties: {
            datasetId: {
              type: 'string',
              description: 'The ID of the dataset to refresh',
            },
          },
          required: ['datasetId'],
        },
      },
      {
        name: 'get_workspaces',
        description: 'Get all Fabric/Power BI workspaces',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_notebook',
        description: 'Create a new notebook in Fabric workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: {
              type: 'string',
              description: 'The workspace ID',
            },
            name: {
              type: 'string',
              description: 'Name of the notebook',
            },
            content: {
              type: 'object',
              description: 'Notebook content/definition',
            },
          },
          required: ['workspaceId', 'name', 'content'],
        },
      },      {
        name: 'upload_to_datawarehouse',
        description: 'Upload data to a Fabric Data Warehouse',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: {
              type: 'string',
              description: 'The workspace ID',
            },
            warehouseId: {
              type: 'string',
              description: 'The data warehouse ID',
            },
            tableName: {
              type: 'string',
              description: 'Name of the table',
            },
            data: {
              type: 'array',
              description: 'Array of data rows to upload',
            },
          },
          required: ['workspaceId', 'warehouseId', 'tableName', 'data'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_powerbi_datasets': {
        const datasets = await powerBIClient.getDatasets();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(datasets, null, 2),
            },
          ],
        };
      }
      case 'execute_dax_query': {
        const { datasetId, query } = ExecuteDaxQuerySchema.parse(args);
        const result = await powerBIClient.executeDaxQuery(datasetId, query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'refresh_dataset': {
        const { datasetId } = RefreshDatasetSchema.parse(args);
        await powerBIClient.refreshDataset(datasetId);
        return {
          content: [
            {
              type: 'text',
              text: `Dataset ${datasetId} refresh initiated successfully`,
            },
          ],
        };
      }

      case 'get_workspaces': {
        const workspaces = await powerBIClient.getWorkspaces();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workspaces, null, 2),
            },
          ],
        };
      }
      case 'create_notebook': {
        const { workspaceId, name, content } = CreateNotebookSchema.parse(args);
        const notebook = await fabricClient.createNotebook(workspaceId, name, content);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(notebook, null, 2),
            },
          ],
        };
      }

      case 'upload_to_datawarehouse': {
        const { workspaceId, warehouseId, tableName, data } = UploadToDataWarehouseSchema.parse(args);
        await fabricClient.uploadToDataWarehouse(workspaceId, warehouseId, tableName, data);
        return {
          content: [
            {
              type: 'text',
              text: `Data uploaded successfully to ${tableName}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// Start the server
async function main() {
  console.error('Starting Microsoft Fabric MCP Server...');
  console.error('Workspace:', process.env.POWERBI_WORKSPACE_NAME);
  console.error('XMLA Endpoint:', process.env.POWERBI_XMLA_ENDPOINT);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Server started successfully');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
