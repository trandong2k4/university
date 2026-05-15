
export interface EnvironmentConfig {
    // API Configuration
    apiBaseUrl: string;
    apiTimeout: number;

    // Feature Flags
    useMockData: boolean;
    debugLogs: boolean;

    // Mock Delay (simulate network latency)
    mockDataDelay: number;

    // Environment
    environment: 'development' | 'staging' | 'production';
}

export const envConfig: EnvironmentConfig = {
    // Get from .env variables, with defaults
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    apiTimeout: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 10000,

    // Use mock data flag - can be overridden per environment
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
    debugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',

    // Simulate network delay (in ms) - helps test loading states
    mockDataDelay: import.meta.env.VITE_MOCK_DATA_DELAY ? parseInt(import.meta.env.VITE_MOCK_DATA_DELAY) : 300,

    // Current environment
    environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as 'development' | 'staging' | 'production',
};

// Helper functions
export const isProduction = () => envConfig.environment === 'production';
export const isDevelopment = () => envConfig.environment === 'development';
export const isStaging = () => envConfig.environment === 'staging';
export const shouldUseMockData = () => envConfig.useMockData;

// Log config on startup (only in development)
if (isDevelopment() && envConfig.debugLogs) {
    console.log('📋 Environment Config:', {
        apiBaseUrl: envConfig.apiBaseUrl,
        useMockData: envConfig.useMockData,
        environment: envConfig.environment,
    });
}
