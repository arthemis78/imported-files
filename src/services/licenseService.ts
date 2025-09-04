// License management service for USDT NOW FLASHER - Using Mock Database
import DeviceService from './deviceService';
import { mockDatabaseService } from './mockDatabaseService';

interface License {
  id: string;
  key: string;
  clientName: string;
  duration: '1week' | '1month' | '2months' | '3months' | '6months' | '1year' | '2years' | '3years';
  price: number;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  isExpired: boolean;
}

interface LicensePlan {
  duration: string;
  period: '1week' | '1month' | '2months' | '3months' | '6months' | '1year' | '2years' | '3years';
  price: number;
  originalPrice?: number;
  discount?: number;
}

class LicenseService {
  private readonly ADMIN_KEY = 'X39ZFv0V4EdpZ$Y+4Jo{N(|'; // Admin key
  private readonly ADMIN_USER_KEY = 'X39ZFv0V4EdpZ$Y+4Jo{N(|1'; // Admin user key
  private mockDb = mockDatabaseService;

  // License plans with pricing
  private readonly PLANS: LicensePlan[] = [
    { duration: '1 Semana', period: '1week', price: 2.5 },
    { duration: '1 Mês', period: '1month', price: 10 },
    { duration: '2 Meses', period: '2months', price: 20 },
    { duration: '3 Meses', period: '3months', price: 30 },
    { duration: '6 Meses', period: '6months', price: 50 },
    { 
      duration: '1 Ano', 
      period: '1year', 
      price: 90, 
      originalPrice: 120, 
      discount: 25 
    },
    { 
      duration: '2 Anos', 
      period: '2years', 
      price: 170, 
      originalPrice: 240, 
      discount: 29 
    },
    { 
      duration: '3 Anos', 
      period: '3years', 
      price: 250, 
      originalPrice: 360, 
      discount: 31 
    }
  ];

  // Check if key is admin key
  isAdminKey(key: string): boolean {
    return key === this.ADMIN_KEY;
  }

  // Check if key is special admin user key (non-expiring)
  isAdminUserKey(key: string): boolean {
    return key === this.ADMIN_USER_KEY;
  }

  // Validate license key using mock database
  async validateLicense(key: string): Promise<{ 
    isValid: boolean; 
    license?: License; 
    isAdmin?: boolean;
    isAdminUser?: boolean; 
    deviceInfo?: any;
    deviceMessage?: string;
  }> {
    // Use mock database for validation
    const result = await this.mockDb.validateLicense(key);
    
    if (result.license) {
      // Convert mock license to service format
      const license: License = {
        id: result.license.id,
        key: result.license.key,
        clientName: result.license.client_name,
        duration: result.license.duration as License['duration'],
        price: result.license.price,
        createdAt: new Date(result.license.created_at),
        expiresAt: new Date(result.license.expires_at),
        isActive: result.license.is_active,
        isExpired: !result.license.is_active || new Date() > new Date(result.license.expires_at)
      };
      
      if (license.isExpired) {
        return { isValid: false, license };
      }
      
      // Check device limits
      const deviceService = DeviceService.getInstance();
      const deviceValidation = await deviceService.validateDeviceAccess(key, license.duration);
      
      if (!deviceValidation.allowed) {
        return { 
          isValid: false, 
          license, 
          deviceInfo: deviceValidation,
          deviceMessage: deviceValidation.message
        };
      }
      
      return { 
        isValid: true, 
        license,
        isAdmin: result.isAdmin,
        isAdminUser: result.isAdminUser,
        deviceInfo: deviceValidation,
        deviceMessage: deviceValidation.message
      };
    }
    
    return {
      isValid: result.isValid,
      isAdmin: result.isAdmin,
      isAdminUser: result.isAdminUser
    };
  }

  // Generate license key (up to 24 characters)
  generateLicenseKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=';
    let key = '';
    
    for (let i = 0; i < 24; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return key;
  }

  // Calculate expiration date
  private calculateExpirationDate(period: License['duration']): Date {
    const now = new Date();
    
    switch (period) {
      case '1week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '1month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case '2months':
        return new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      case '3months':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      case '6months':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      case '1year':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      case '2years':
        return new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
      case '3years':
        return new Date(now.getTime() + 1095 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Create new license using mock database
  createLicense(clientName: string, duration: License['duration']): License {
    const plan = this.PLANS.find(p => p.period === duration);
    if (!plan) {
      throw new Error('Invalid license duration');
    }

    // Create license using mock database
    this.mockDb.createLicense(clientName, duration).then(mockLicense => {
      console.log('✅ License created in mock database:', mockLicense.key);
    }).catch(error => {
      console.error('❌ Failed to create license in mock database:', error);
    });

    // Return immediate license object for compatibility
    const license: License = {
      id: Date.now().toString(),
      key: this.generateLicenseKey(),
      clientName,
      duration,
      price: plan.price,
      createdAt: new Date(),
      expiresAt: this.calculateExpirationDate(duration),
      isActive: true,
      isExpired: false
    };

    return license;
  }

  // Get all licenses from mock database
  getAllLicenses(): License[] {
    // Since this is synchronous but mock database is async, return empty for now
    // The actual data will be fetched by components using the async methods
    console.log('📊 Getting licenses from mock database...');
    return [];
  }

  // Async version for getting all licenses
  async getAllLicensesAsync(): Promise<License[]> {
    const mockLicenses = await this.mockDb.getAllLicenses();
    
    return mockLicenses.map(mockLicense => ({
      id: mockLicense.id,
      key: mockLicense.key,
      clientName: mockLicense.client_name,
      duration: mockLicense.duration as License['duration'],
      price: mockLicense.price,
      createdAt: new Date(mockLicense.created_at),
      expiresAt: new Date(mockLicense.expires_at),
      isActive: mockLicense.is_active,
      isExpired: !mockLicense.is_active || new Date() > new Date(mockLicense.expires_at)
    }));
  }

  // Get active licenses from mock database
  getActiveLicenses(): License[] {
    // Return empty for sync compatibility, use async version
    return [];
  }

  // Async version for getting active licenses
  async getActiveLicensesAsync(): Promise<License[]> {
    const mockLicenses = await this.mockDb.getActiveLicenses();
    
    return mockLicenses.map(mockLicense => ({
      id: mockLicense.id,
      key: mockLicense.key,
      clientName: mockLicense.client_name,
      duration: mockLicense.duration as License['duration'],
      price: mockLicense.price,
      createdAt: new Date(mockLicense.created_at),
      expiresAt: new Date(mockLicense.expires_at),
      isActive: mockLicense.is_active,
      isExpired: false
    }));
  }

  // Get expired licenses from mock database
  getExpiredLicenses(): License[] {
    // Return empty for sync compatibility, use async version
    return [];
  }

  // Async version for getting expired licenses
  async getExpiredLicensesAsync(): Promise<License[]> {
    const mockLicenses = await this.mockDb.getExpiredLicenses();
    
    return mockLicenses.map(mockLicense => ({
      id: mockLicense.id,
      key: mockLicense.key,
      clientName: mockLicense.client_name,
      duration: mockLicense.duration as License['duration'],
      price: mockLicense.price,
      createdAt: new Date(mockLicense.created_at),
      expiresAt: new Date(mockLicense.expires_at),
      isActive: mockLicense.is_active,
      isExpired: true
    }));
  }

  // Delete license using mock database
  deleteLicense(licenseId: string): void {
    this.mockDb.deleteLicense(licenseId).then(() => {
      console.log('✅ License deleted from mock database:', licenseId);
    }).catch(error => {
      console.error('❌ Failed to delete license from mock database:', error);
    });
  }

  // Get license plans
  getLicensePlans(): LicensePlan[] {
    return this.PLANS;
  }

  // Get license by key from mock database
  getLicenseByKey(key: string): License | null {
    // This should be async but keeping sync for compatibility
    return null;
  }

  // Async version for getting license by key
  async getLicenseByKeyAsync(key: string): Promise<License | null> {
    const mockLicenses = await this.mockDb.getAllLicenses();
    const mockLicense = mockLicenses.find(l => l.key === key);
    
    if (!mockLicense) return null;
    
    return {
      id: mockLicense.id,
      key: mockLicense.key,
      clientName: mockLicense.client_name,
      duration: mockLicense.duration as License['duration'],
      price: mockLicense.price,
      createdAt: new Date(mockLicense.created_at),
      expiresAt: new Date(mockLicense.expires_at),
      isActive: mockLicense.is_active,
      isExpired: !mockLicense.is_active || new Date() > new Date(mockLicense.expires_at)
    };
  }

  // Get license with device info
  async getLicenseWithDeviceInfo(key: string): Promise<{
    license: License | null;
    deviceInfo: any;
    validation: any;
  }> {
    const license = this.getLicenseByKey(key);
    if (!license) {
      return { license: null, deviceInfo: null, validation: null };
    }

    const validation = await this.validateLicense(key);
    return {
      license,
      deviceInfo: validation.deviceInfo,
      validation
    };
  }

  // Get license statistics from mock database
  getLicenseStats(): {
    total: number;
    active: number;
    expired: number;
    revenue: number;
  } {
    // Return default values for sync compatibility, use async version
    return {
      total: 0,
      active: 0,
      expired: 0,
      revenue: 0
    };
  }

  // Async version for getting license statistics
  async getLicenseStatsAsync(): Promise<{
    total: number;
    active: number;
    expired: number;
    revenue: number;
  }> {
    return await this.mockDb.getLicenseStats();
  }

  // Format time remaining for display
  formatTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Expired';
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

export const licenseService = new LicenseService();
export type { License, LicensePlan };
