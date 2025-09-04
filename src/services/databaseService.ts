// Database service now using Mock Database with Encryption
import { mockDatabaseService, type MockLicenseRecord, type MockDeviceRecord } from './mockDatabaseService';

// Legacy interfaces for compatibility
interface DatabaseConfig {
  endpoint: string;
  authProvider: string;
}

interface LicenseRecord {
  id: string;
  key: string;
  client_name: string;
  duration: string;
  price: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  device_limit: number;
  devices_used: number;
}

interface DeviceRecord {
  id: string;
  license_key: string;
  ip_address: string;
  user_agent: string;
  location: any;
  first_seen: string;
  last_seen: string;
}

class DatabaseService {
  private static instance: DatabaseService;
  private config: DatabaseConfig;
  private mockDb = mockDatabaseService;

  constructor() {
    // Mock configuration - all operations use mock database
    this.config = {
      endpoint: 'mock://database',
      authProvider: 'mock://auth'
    };
    
    console.log('🚀 DatabaseService using Mock Database with Encryption');
    console.log('🔒 All data stored with encryption in localStorage');
    console.log('🔑 Admin keys: X39ZFv0V4EdpZ$Y+4Jo{N(| and X39ZFv0V4EdpZ$Y+4Jo{N(|1');
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Mock API request - all operations now use mock database
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    console.log('🔧 Mock Database API Request:', endpoint);
    
    // All requests now return success since we use mock database
    return {
      success: true,
      message: 'Mock database operation',
      rows: [],
      isDevelopment: false
    };
  }

  // Test mock database connection (always returns true)
  async testConnection(): Promise<boolean> {
    console.log('🔍 Mock Database: Testing connection...');
    const result = await this.mockDb.testConnection();
    console.log('✅ Mock Database connection successful!');
    return result;
  }

  // Initialize mock database
  async initializeDatabase(): Promise<void> {
    console.log('🚀 Initializing Mock Database...');
    await this.mockDb.initializeDatabase();
    console.log('🎉 Mock Database initialization complete!');
  }

  // Initialize predefined admin keys (handled by mock database)
  private async initializePredefinedKeys(): Promise<void> {
    console.log('🔑 Admin keys initialized by Mock Database');
    // Admin keys are automatically initialized in MockDatabaseService
    return Promise.resolve();
  }

  // License management methods using mock database
  async createLicense(clientName: string, duration: string): Promise<LicenseRecord> {
    console.log('💾 Mock Database: Creating license for', clientName, 'with duration', duration);
    
    const mockLicense = await this.mockDb.createLicense(clientName, duration);
    
    // Convert mock license to legacy format
    const license: LicenseRecord = {
      id: mockLicense.id,
      key: mockLicense.key,
      client_name: mockLicense.client_name,
      duration: mockLicense.duration,
      price: mockLicense.price,
      created_at: mockLicense.created_at,
      expires_at: mockLicense.expires_at,
      is_active: mockLicense.is_active,
      device_limit: mockLicense.device_limit,
      devices_used: mockLicense.devices_used
    };
    
    console.log('✅ Mock license created successfully:', license.key);
    return license;
  }

  async validateLicense(key: string): Promise<{ isValid: boolean; license?: LicenseRecord; isAdmin?: boolean; isAdminUser?: boolean }> {
    const result = await this.mockDb.validateLicense(key);
    
    if (result.license) {
      // Convert mock license to legacy format
      const license: LicenseRecord = {
        id: result.license.id,
        key: result.license.key,
        client_name: result.license.client_name,
        duration: result.license.duration,
        price: result.license.price,
        created_at: result.license.created_at,
        expires_at: result.license.expires_at,
        is_active: result.license.is_active,
        device_limit: result.license.device_limit,
        devices_used: result.license.devices_used
      };
      
      return {
        isValid: result.isValid,
        license: license,
        isAdmin: result.isAdmin,
        isAdminUser: result.isAdminUser
      };
    }
    
    return {
      isValid: result.isValid,
      isAdmin: result.isAdmin,
      isAdminUser: result.isAdminUser
    };
  }

  async getAllLicenses(): Promise<LicenseRecord[]> {
    const mockLicenses = await this.mockDb.getAllLicenses();
    
    // Convert mock licenses to legacy format
    return mockLicenses.map(mockLicense => ({
      id: mockLicense.id,
      key: mockLicense.key,
      client_name: mockLicense.client_name,
      duration: mockLicense.duration,
      price: mockLicense.price,
      created_at: mockLicense.created_at,
      expires_at: mockLicense.expires_at,
      is_active: mockLicense.is_active,
      device_limit: mockLicense.device_limit,
      devices_used: mockLicense.devices_used
    }));
  }

  async getActiveLicenses(): Promise<LicenseRecord[]> {
    const mockLicenses = await this.mockDb.getActiveLicenses();
    
    // Convert mock licenses to legacy format
    return mockLicenses.map(mockLicense => ({
      id: mockLicense.id,
      key: mockLicense.key,
      client_name: mockLicense.client_name,
      duration: mockLicense.duration,
      price: mockLicense.price,
      created_at: mockLicense.created_at,
      expires_at: mockLicense.expires_at,
      is_active: mockLicense.is_active,
      device_limit: mockLicense.device_limit,
      devices_used: mockLicense.devices_used
    }));
  }

  async getExpiredLicenses(): Promise<LicenseRecord[]> {
    const mockLicenses = await this.mockDb.getExpiredLicenses();
    
    // Convert mock licenses to legacy format
    return mockLicenses.map(mockLicense => ({
      id: mockLicense.id,
      key: mockLicense.key,
      client_name: mockLicense.client_name,
      duration: mockLicense.duration,
      price: mockLicense.price,
      created_at: mockLicense.created_at,
      expires_at: mockLicense.expires_at,
      is_active: mockLicense.is_active,
      device_limit: mockLicense.device_limit,
      devices_used: mockLicense.devices_used
    }));
  }

  async deleteLicense(id: string): Promise<void> {
    await this.mockDb.deleteLicense(id);
    console.log('✅ Mock license deleted:', id);
  }

  async reactivateLicense(id: string): Promise<void> {
    await this.mockDb.reactivateLicense(id);
    console.log('✅ Mock license reactivated:', id);
  }

  async deactivateLicense(id: string): Promise<void> {
    await this.mockDb.deactivateLicense(id);
    console.log('⚠️ Mock license deactivated:', id);
  }

  // Device management using mock database
  async registerDevice(licenseKey: string, deviceInfo: any): Promise<boolean> {
    return await this.mockDb.registerDevice(licenseKey, deviceInfo);
  }

  // PIN Management Methods using mock database
  async setPinForLicense(licenseKey: string, pinHash: string): Promise<boolean> {
    return await this.mockDb.setPinForLicense(licenseKey, pinHash);
  }

  async getPinForLicense(licenseKey: string): Promise<string | null> {
    return await this.mockDb.getPinForLicense(licenseKey);
  }

  async deletePinForLicense(licenseKey: string): Promise<boolean> {
    return await this.mockDb.deletePinForLicense(licenseKey);
  }

  async hasPinSet(licenseKey: string): Promise<boolean> {
    return await this.mockDb.hasPinSet(licenseKey);
  }

  // Statistics using mock database
  async getLicenseStats() {
    return await this.mockDb.getLicenseStats();
  }

  // Mock database utility methods
  isMockDatabase(): boolean {
    return this.mockDb.isMockDatabase();
  }

  getAdminKeys() {
    return this.mockDb.getAdminKeys();
  }

  async clearAllMockData(): Promise<void> {
    return await this.mockDb.clearAllData();
  }

  async exportMockData(): Promise<any> {
    return await this.mockDb.exportData();
  }

  async importMockData(data: any): Promise<void> {
    return await this.mockDb.importData(data);
  }
}

export const databaseService = DatabaseService.getInstance();
export type { LicenseRecord, DeviceRecord };
export default DatabaseService;
