// Production environment configuration - MOCK DATABASE ENABLED
export const PRODUCTION_CONFIG = {
  // API endpoints for production
  API: {
    TRON_GRID: 'https://api.trongrid.io',
    TRON_SCAN: 'https://tronscan.org',
    IP_SERVICE: 'https://api.ipify.org',
    TOR_CHECK: 'https://check.torproject.org',
  },

  // Security settings
  SECURITY: {
    ENABLE_RIGHT_CLICK_PROTECTION: true,
    ENABLE_DEV_TOOLS_PROTECTION: true,
    ENABLE_TEXT_SELECTION_PROTECTION: true,
    ENABLE_COPY_PROTECTION: true,
    ENABLE_SOURCE_OBFUSCATION: true,
  },

  // Feature flags for production
  FEATURES: {
    DEMO_MODE: true, // Using mock database
    MOCK_TRANSACTIONS: true, // Use mock data instead of real blockchain
    RATE_LIMITING: true,
    ANALYTICS: false, // Disable analytics for privacy
    USE_MOCK_DATABASE: true, // IMPORTANT: Force mock database usage
    DISABLE_REAL_DATABASE: true, // IMPORTANT: Disable all real database connections
  },

  // Mock database configuration
  DATABASE: {
    TYPE: 'MOCK',
    ENCRYPTION_ENABLED: true,
    STORAGE: 'localStorage',
    ADMIN_KEYS_ENCRYPTED: true
  },

  // Demo credentials (encrypted admin keys)
  DEMO_CREDENTIALS: {
    // Updated keys configuration with encryption
    ADMIN_KEY: 'X39ZFv0V4EdpZ$Y+4Jo{N(|', // admin key
    USER_KEYS: [
      'X39ZFv0V4EdpZ$Y+4Jo{N(|1', // user admin
    ],
    ENCRYPTION_ENABLED: true,
    KEY_ROTATION_DISABLED: true // Keys are hardcoded for demo
  },

  // Application settings
  APP: {
    NAME: 'USDT NOW',
    VERSION: '1.0.0',
    COPYRIGHT: '© 2024 USDT NOW. All rights reserved.',
    CONTACT: 'https://t.me/+lk6DfBs5zhMwYWM0',
    DATABASE_MODE: 'MOCK_ENCRYPTED'
  },
};

export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isMockDatabaseEnabled = () => true; // Always true now
export const isRealDatabaseDisabled = () => true; // Always true now

console.log('🔒 Production Config: Mock Database with Encryption ENABLED');
console.log('🚫 Real database connections DISABLED');

export default PRODUCTION_CONFIG;
