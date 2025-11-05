export type IntegrationStatus =
  | 'active'
  | 'inactive'
  | 'error'
  | 'warning'
  | 'pending'
  | 'updating';
export type IntegrationType = 'ehr' | 'payment' | 'analytics' | 'lab' | 'pharmacy' | 'imaging';
export type DataDirection = 'inbound' | 'outbound' | 'bidirectional';
export type AuthMethod = 'api_key' | 'oauth2' | 'jwt' | 'basic';
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type DataSourceType = 'database' | 'api' | 'file' | 'stream' | 'webhook';
export type ModelStatus = 'active' | 'training' | 'inactive' | 'error';
export type ModelType = 'classification' | 'regression' | 'clustering' | 'time_series';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  description: string;
  status: IntegrationStatus;
  provider: string;
  version: string;
  endpoint: string;
  dataDirection: DataDirection;
  authMethod: AuthMethod;
  lastSync: string;
  createdAt: string;
  settings: {
    syncInterval: string;
    retryCount: number;
    timeout: number;
    enableWebhooks: boolean;
  };
  metrics: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    errorCount: number;
  };
}

export interface APIEndpoint {
  id: string;
  path: string;
  method: HTTPMethod;
  version: string;
  description: string;
  status: IntegrationStatus;
  requiresAuth: boolean;
  authType: string;
  rateLimit: {
    requests: number;
    period: string;
  };
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responseSchema: object;
  examples: Array<{
    name: string;
    request: object;
    response: object;
  }>;
  usage: {
    totalCalls: number;
    lastCalled: string;
    popularityScore: number;
  };
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: IntegrationStatus;
  connectionString: string;
  provider: string;
  location: string;
  schema: {
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
      }>;
    }>;
  };
  metrics: {
    size: string;
    recordCount: number;
    lastUpdated: string;
  };
  access: {
    readOnly: boolean;
    encryptionEnabled: boolean;
    backupEnabled: boolean;
  };
}

export interface DataWarehouse {
  id: string;
  name: string;
  provider: string;
  region: string;
  size: string;
  status: IntegrationStatus;
  configuration: {
    computeUnits: number;
    storageType: string;
    backupRetention: string;
  };
  schemas: Array<{
    name: string;
    tableCount: number;
    sizeGB: number;
  }>;
  costs: {
    monthly: number;
    storage: number;
    compute: number;
  };
  performance: {
    averageQueryTime: number;
    concurrentQueries: number;
    cacheHitRate: number;
  };
}

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: string;
  isPublic: boolean;
  thumbnail?: string;
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    configuration: object;
  }>;
  dataSource: string;
  refreshInterval: string;
  lastUpdated: string;
  createdAt: string;
  permissions: Array<{
    userId: string;
    role: string;
  }>;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  format: 'PDF' | 'CSV' | 'EXCEL' | 'JSON';
  schedule: string;
  recipients: string[];
  parameters: Array<{
    name: string;
    type: string;
    defaultValue: unknown;
  }>;
  query: string;
  lastGenerated: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error';
  outputLocation: string;
}

export interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  modelType: ModelType;
  framework: string;
  version: string;
  status: ModelStatus;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  trainingDataset: {
    name: string;
    size: number;
    features: string[];
  };
  deployment: {
    endpoint: string;
    instances: number;
    maxConcurrency: number;
  };
  metrics: {
    predictionsToday: number;
    averageLatency: number;
    errorRate: number;
  };
}

export interface MLModel {
  id: string;
  name: string;
  type: string;
  status: string;
  accuracy: number;
  lastTrained: string;
  framework: string;
}

export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  source: string;
  destination: string;
  frequency: string;
  status: IntegrationStatus;
  lastRun: string;
  nextRun: string;
  steps: Array<{
    id: string;
    name: string;
    type: string;
    configuration: object;
    status: string;
    duration: number;
  }>;
  metrics: {
    recordsProcessed: number;
    successRate: number;
    averageDuration: number;
  };
  dataQuality: {
    completeness: number;
    accuracy: number;
    consistency: number;
  };
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'system' | 'performance' | 'data_quality' | 'security';
  source: string;
  timestamp: string;
  status: 'open' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  resolution?: string;
  tags: string[];
}

export interface APIKey {
  id: string;
  name: string;
  keyType: 'development' | 'production';
  permissions: string[];
  created: string;
  lastUsed: string;
  expiresAt?: string;
  isActive: boolean;
  usage: {
    requestCount: number;
    remainingQuota: number;
  };
}

export interface SystemConnector {
  id: string;
  name: string;
  type: string;
  vendor: string;
  version: string;
  status: IntegrationStatus;
  endpoint: string;
  lastSync: string;
  dataMapping: Array<{
    source: string;
    destination: string;
    transformation?: string;
  }>;
  errorHandling: {
    retryCount: number;
    backoffStrategy: string;
    fallbackAction: string;
  };
}

export interface IntegrationStats {
  activeIntegrations: number;
  dataSources: number;
  apiEndpoints: number;
  mlModels: number;
  totalDataProcessed: string;
  systemUptime: number;
  errorRate: number;
  responseTime: number;
}

export interface DataFlow {
  id: string;
  name: string;
  sourceId: string;
  destinationId: string;
  transformations: Array<{
    id: string;
    type: string;
    configuration: object;
  }>;
  schedule: string;
  status: IntegrationStatus;
  metrics: {
    recordsFlowed: number;
    lastExecution: string;
    executionTime: number;
  };
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: object;
  duration?: number;
  requestId?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  headers: Record<string, string>;
  deliveries: Array<{
    id: string;
    timestamp: string;
    event: string;
    status: 'success' | 'failed' | 'pending';
    responseCode: number;
    responseTime: number;
  }>;
}
