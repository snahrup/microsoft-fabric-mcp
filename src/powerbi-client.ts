import axios, { AxiosInstance } from 'axios';
import { authService } from './auth';

export interface Dataset {
  id: string;
  name: string;
  webUrl?: string;
  isRefreshable?: boolean;
  configuredBy?: string;
}

export interface DaxQueryResult {
  results: Array<{
    tables: Array<{
      rows: any[];
    }>;
  }>;
}

export class PowerBIClient {
  private apiClient: AxiosInstance;
  private xmlaEndpoint: string;
  private workspaceName: string;

  constructor() {
    this.xmlaEndpoint = process.env.POWERBI_XMLA_ENDPOINT!;
    this.workspaceName = process.env.POWERBI_WORKSPACE_NAME!;
    
    this.apiClient = axios.create({
      baseURL: process.env.POWERBI_API_BASE_URL || 'https://api.powerbi.com/v1.0/myorg',
    });

    // Add auth interceptor
    this.apiClient.interceptors.request.use(async (config) => {
      const token = await authService.getPowerBIToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getDatasets(): Promise<Dataset[]> {
    try {
      // Use workspace-specific endpoint if workspace ID is available
      const workspaceId = process.env.POWERBI_WORKSPACE_ID;
      const endpoint = workspaceId 
        ? `/groups/${workspaceId}/datasets`
        : '/datasets';
      
      const response = await this.apiClient.get(endpoint);
      return response.data.value;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  }

  async getDataset(datasetId: string): Promise<Dataset> {
    try {
      const response = await this.apiClient.get(`/datasets/${datasetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dataset:', error);
      throw error;
    }
  }

  async executeDaxQuery(datasetId: string, query: string): Promise<DaxQueryResult> {
    try {
      const response = await this.apiClient.post(`/datasets/${datasetId}/executeQueries`, {
        queries: [
          {
            query: query
          }
        ]
      });
      return response.data;
    } catch (error) {
      console.error('Error executing DAX query:', error);
      throw error;
    }
  }

  async refreshDataset(datasetId: string): Promise<void> {
    try {
      await this.apiClient.post(`/datasets/${datasetId}/refreshes`);
    } catch (error) {
      console.error('Error refreshing dataset:', error);
      throw error;
    }
  }

  async getWorkspaces(): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/groups');
      return response.data.value;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }
}

export const powerBIClient = new PowerBIClient();
