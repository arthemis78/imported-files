// Real License Service with Neon Database Integration
import { databaseService, type LicenseRecord } from './databaseService';
import DeviceService from './deviceService';

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

class RealLicenseService {
  private static instance: RealLicenseService;
  
  // Your admin keys and special user key
  private readonly ADMIN_KEYS = [
    'X39ZFv0V4EdpZ$Y+4Jo{N(|' // Admin key
  ];

  private readonly SPECIAL_USER_KEYS = [
    'X39ZFv0V4EdpZ$Y+4Jo{N(|1' // Admin user key with admin privileges
  ];

  // License plans with pricing (as per your requirements)
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

  public static getInstance(): RealLicenseService {
    if (!RealLicenseService.instance) {
      RealLicenseService.instance = new RealLicenseService();
    }
    return RealLicenseService.instance;
  }

  constructor() {
    // Don't initialize database immediately to prevent app loading issues
    console.log('🚀 Real License Service initialized');
  }

  private async ensureDatabaseInitialized() {
    try {
      await databaseService.initializeDatabase();
      console.log('✅ Database ensured initialized');
    } catch (error) {
      console.warn('⚠️ Database initialization failed (non-critical):', error);
    }
  }

  // Check if key is admin key
  isAdminKey(key: string): boolean {
    return this.ADMIN_KEYS.includes(key);
  }

  // Check if key is special user key (admin privileges but user interface)
  isSpecialUserKey(key: string): boolean {
    return this.SPECIAL_USER_KEYS.includes(key);
  }

  // Validate license key with database lookup
  async validateLicense(key: string): Promise<{ 
    isValid: boolean; 
    license?: License; 
    isAdmin?: boolean;
    isAdminUser?: boolean;
    deviceInfo?: any;
    deviceMessage?: string;
  }> {
    // Check admin keys first
    if (this.isAdminKey(key)) {
      return { isValid: true, isAdmin: true };
    }

    // Check special user keys (admin privileges but user interface)
    if (this.isSpecialUserKey(key)) {
      return { isValid: true, isAdminUser: true };
    }

    try {
      // Ensure database is initialized
      await this.ensureDatabaseInitialized();
      
      // Query database for license
      const result = await databaseService.validateLicense(key);
      
      if (!result.isValid || !result.license) {
        return { isValid: false };
      }

      const dbLicense = result.license;
      
      // Convert database record to License interface
      const license: License = {
        id: dbLicense.id,
        key: dbLicense.key,
        clientName: dbLicense.client_name,
        duration: dbLicense.duration as License['duration'],
        price: dbLicense.price,
        createdAt: new Date(dbLicense.created_at),
        expiresAt: new Date(dbLicense.expires_at),
        isActive: dbLicense.is_active,
        isExpired: new Date() > new Date(dbLicense.expires_at)
      };

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

      // Register device in database
      try {
        const currentDevice = await deviceService.getCurrentDeviceInfo();
        await databaseService.registerDevice(key, currentDevice);
      } catch (error) {
        console.warn('Failed to register device:', error);
      }

      return { 
        isValid: true, 
        license,
        deviceInfo: deviceValidation,
        deviceMessage: deviceValidation.message
      };
      
    } catch (error) {
      console.error('License validation error:', error);
      return { isValid: false };
    }
  }

  // Create new license in database
  async createLicense(clientName: string, duration: License['duration']): Promise<License> {
    try {
      // Ensure database is initialized before creating license
      await this.ensureDatabaseInitialized();
      
      console.log('🔑 RealLicenseService: Creating license for', clientName, 'duration:', duration);
      
      const dbLicense = await databaseService.createLicense(clientName, duration);
      
      const license: License = {
        id: dbLicense.id,
        key: dbLicense.key,
        clientName: dbLicense.client_name,
        duration: dbLicense.duration as License['duration'],
        price: dbLicense.price,
        createdAt: new Date(dbLicense.created_at),
        expiresAt: new Date(dbLicense.expires_at),
        isActive: dbLicense.is_active,
        isExpired: false
      };
      
      console.log('✅ RealLicenseService: License created successfully:', license);
      return license;
    } catch (error) {
      console.error('❌ RealLicenseService: Failed to create license:', error);
      throw error;
    }
  }

  // Get all licenses from database
  async getAllLicenses(): Promise<License[]> {
    try {
      // Ensure database is initialized
      await this.ensureDatabaseInitialized();
      
      const dbLicenses = await databaseService.getAllLicenses();
      return dbLicenses.map(this.convertDbLicense);
    } catch (error) {
      console.error('Failed to get all licenses:', error);
      return [];
    }
  }

  // Get active licenses from database
  async getActiveLicenses(): Promise<License[]> {
    try {
      // Ensure database is initialized
      await this.ensureDatabaseInitialized();
      
      const dbLicenses = await databaseService.getActiveLicenses();
      return dbLicenses.map(this.convertDbLicense);
    } catch (error) {
      console.error('Failed to get active licenses:', error);
      return [];
    }
  }

  // Get expired licenses from database
  async getExpiredLicenses(): Promise<License[]> {
    try {
      // Ensure database is initialized
      await this.ensureDatabaseInitialized();
      
      const dbLicenses = await databaseService.getExpiredLicenses();
      return dbLicenses.map(this.convertDbLicense);
    } catch (error) {
      console.error('Failed to get expired licenses:', error);
      return [];
    }
  }

  // Delete license from database
  async deleteLicense(id: string): Promise<void> {
    try {
      await databaseService.deleteLicense(id);
    } catch (error) {
      console.error('Failed to delete license:', error);
      throw error;
    }
  }

  // Reactivate license
  async reactivateLicense(id: string): Promise<void> {
    try {
      await databaseService.reactivateLicense(id);
      console.log('✅ License reactivated successfully');
    } catch (error) {
      console.error('Failed to reactivate license:', error);
      throw error;
    }
  }

  // Deactivate license
  async deactivateLicense(id: string): Promise<void> {
    try {
      await databaseService.deactivateLicense(id);
      console.log('✅ License deactivated successfully');
    } catch (error) {
      console.error('Failed to deactivate license:', error);
      throw error;
    }
  }

  // Get license statistics from database
  async getLicenseStats() {
    try {
      // Ensure database is initialized
      await this.ensureDatabaseInitialized();
      
      return await databaseService.getLicenseStats();
    } catch (error) {
      console.error('Failed to get license stats:', error);
      return { total: 0, active: 0, expired: 0, revenue: 0 };
    }
  }

  // Get license plans
  getLicensePlans(): LicensePlan[] {
    return this.PLANS;
  }

  // Format time remaining
  formatTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expirada';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
  }

  // Convert database license to internal format
  private convertDbLicense(dbLicense: LicenseRecord): License {
    return {
      id: dbLicense.id,
      key: dbLicense.key,
      clientName: dbLicense.client_name,
      duration: dbLicense.duration as License['duration'],
      price: dbLicense.price,
      createdAt: new Date(dbLicense.created_at),
      expiresAt: new Date(dbLicense.expires_at),
      isActive: dbLicense.is_active,
      isExpired: new Date() > new Date(dbLicense.expires_at)
    };
  }

  // Get license by key
  async getLicenseByKey(key: string): Promise<License | null> {
    try {
      const result = await databaseService.validateLicense(key);
      if (result.isValid && result.license) {
        return this.convertDbLicense(result.license);
      }
      return null;
    } catch (error) {
      console.error('Failed to get license by key:', error);
      return null;
    }
  }

  // Get device info for license
  async getLicenseWithDeviceInfo(key: string): Promise<{
    license: License | null;
    devices: any[];
    currentDevice?: any;
    deviceLimit?: number;
  }> {
    const license = await this.getLicenseByKey(key);
    
    if (!license) {
      return { license: null, devices: [] };
    }

    const deviceService = DeviceService.getInstance();
    const devices = deviceService.getLicenseDevices(key);
    const deviceLimit = deviceService.getDeviceLimit(license.duration);
    
    try {
      const currentDevice = await deviceService.getCurrentDeviceInfo();
      return { license, devices, currentDevice, deviceLimit };
    } catch (error) {
      return { license, devices, deviceLimit };
    }
  }
}

// Export the real license service instance
export const realLicenseService = RealLicenseService.getInstance();
export type { License, LicensePlan };
export default RealLicenseService;
