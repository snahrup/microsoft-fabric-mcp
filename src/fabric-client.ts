import axios, { AxiosInstance } from 'axios';
import { authService } from './auth';

export interface FabricWorkspace {
  id: string;
  displayName: string;
  type: string;
  capacityId?: string;
}

export interface FabricNotebook {
  id: string;
  displayName: string;
  workspaceId: string;
  definition?: any;
}

export interface FabricDataWarehouse {
  id: string;
  displayName: string;
  workspaceId: string;
  connectionString?: string;
}

export class FabricClient {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.FABRIC_API_BASE_URL || 'https://api.fabric.microsoft.com/v1',
    });

    // Add auth interceptor
    this.apiClient.interceptors.request.use(async (config) => {
      const token = await authService.getFabricToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getWorkspaces(): Promise<FabricWorkspace[]> {
    try {
      const response = await this.apiClient.get('/workspaces');
      return response.data.value;
    } catch (error) {
      console.error('Error fetching Fabric workspaces:', error);
      throw error;
    }
  }

  async createNotebook(workspaceId: string, name: string, content: any): Promise<FabricNotebook> {
    try {
      const response = await this.apiClient.post(`/workspaces/${workspaceId}/notebooks`, {
        displayName: name,
        definition: content
      });
      return response.data;
    } catch (error) {
      console.error('Error creating notebook:', error);
      throw error;
    }
  }

  async executeNotebook(workspaceId: string, notebookId: string): Promise<any> {
    try {
      const response = await this.apiClient.post(
        `/workspaces/${workspaceId}/notebooks/${notebookId}/execute`
      );
      return response.data;
    } catch (error) {
      console.error('Error executing notebook:', error);
      throw error;
    }
  }

  async uploadToDataWarehouse(workspaceId: string, warehouseId: string, tableName: string, data: any[]): Promise<void> {
    try {
      // This would typically use the SQL endpoint or COPY INTO command
      const response = await this.apiClient.post(
        `/workspaces/${workspaceId}/datawarehouses/${warehouseId}/tables/${tableName}/rows`,
        { rows: data }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading to data warehouse:', error);
      throw error;
    }
  }

  async getDataWarehouses(workspaceId: string): Promise<FabricDataWarehouse[]> {
    try {
      const response = await this.apiClient.get(`/workspaces/${workspaceId}/datawarehouses`);
      return response.data.value;
    } catch (error) {
      console.error('Error fetching data warehouses:', error);
      throw error;
    }
  }
}

export const fabricClient = new FabricClient();
