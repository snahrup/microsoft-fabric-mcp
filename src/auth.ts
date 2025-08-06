import { ConfidentialClientApplication, ClientCredentialRequest } from '@azure/msal-node';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from the project root (parent of dist directory)
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  console.error('Attempted to load from:', envPath);
}

// Debug: Log environment variables (without exposing secrets)
console.error('Environment check:');
console.error('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID ? 'Set' : 'Not set');
console.error('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID ? 'Set' : 'Not set');
console.error('AZURE_CLIENT_SECRET:', process.env.AZURE_CLIENT_SECRET ? 'Set (length: ' + process.env.AZURE_CLIENT_SECRET.length + ')' : 'Not set');

export class AzureAuthService {
  private msalClient: ConfidentialClientApplication;
  private accessTokenCache: Map<string, { token: string; expiresAt: number }> = new Map();

  constructor() {
    // Validate required environment variables
    if (!process.env.AZURE_TENANT_ID) {
      throw new Error('AZURE_TENANT_ID is not set in environment variables');
    }
    if (!process.env.AZURE_CLIENT_ID) {
      throw new Error('AZURE_CLIENT_ID is not set in environment variables');
    }
    if (!process.env.AZURE_CLIENT_SECRET) {
      throw new Error('AZURE_CLIENT_SECRET is not set in environment variables');
    }

    const config = {
      auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
      },
    };

    this.msalClient = new ConfidentialClientApplication(config);
  }

  async getAccessToken(scope: string): Promise<string> {
    // Check cache first
    const cached = this.accessTokenCache.get(scope);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    const request: ClientCredentialRequest = {
      scopes: [scope],
      skipCache: false,
    };

    try {
      const response = await this.msalClient.acquireTokenByClientCredential(request);
      if (!response) {
        throw new Error('Failed to acquire token');
      }

      // Cache the token (expires 5 minutes before actual expiry)
      const expiresAt = response.expiresOn ? response.expiresOn.getTime() - 300000 : Date.now() + 3300000;
      this.accessTokenCache.set(scope, {
        token: response.accessToken,
        expiresAt,
      });

      return response.accessToken;
    } catch (error) {
      console.error('Error acquiring token:', error);
      throw error;
    }
  }

  async getPowerBIToken(): Promise<string> {
    return this.getAccessToken(process.env.POWERBI_SCOPE || 'https://analysis.windows.net/powerbi/api/.default');
  }

  async getFabricToken(): Promise<string> {
    return this.getAccessToken(process.env.FABRIC_SCOPE || 'https://api.fabric.microsoft.com/.default');
  }
}

// Create a singleton instance - but with lazy initialization
let authServiceInstance: AzureAuthService | null = null;

export function getAuthService(): AzureAuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AzureAuthService();
  }
  return authServiceInstance;
}

// For backward compatibility, but delay instantiation
export const authService = {
  getPowerBIToken: async () => getAuthService().getPowerBIToken(),
  getFabricToken: async () => getAuthService().getFabricToken(),
  getAccessToken: async (scope: string) => getAuthService().getAccessToken(scope),
};
