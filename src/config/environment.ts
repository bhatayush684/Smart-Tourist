// Environment configuration
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Tourist Safety Platform',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  nodeEnv: import.meta.env.MODE,
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebugTools: import.meta.env.VITE_ENABLE_DEBUG_TOOLS === 'true',
  
  // External Services
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  
  // WebSocket Configuration
  wsReconnectInterval: 3000,
  wsMaxReconnectAttempts: 5,
  
  // API Configuration
  apiTimeout: 10000,
  apiRetryAttempts: 3,
} as const;

export default config;
