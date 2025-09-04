// Mock Database Service with Encryption for USDT NOW FLASHER
// Complete offline database replacement with encrypted storage

interface MockLicenseRecord {
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

interface MockDeviceRecord {
  id: string;
  license_key: string;
  ip_address: string;
  user_agent: string;
  location: any;
  first_seen: string;
  last_seen: string;
}

interface MockPinRecord {
  id: string;
  license_key: string;
  pin_hash: string;
  created_at: string;
  updated_at: string;
}

interface MockTransactionRecord {
  id: string;
  license_key: string;
  transaction_type: 'flash_loan' | 'transfer' | 'swap';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  blockchain_tx_hash?: string;
  created_at: string;
  completed_at?: string;
  details: any;
}

class MockDatabaseService {
  private static instance: MockDatabaseService;
  private encryptionKey = 'USDT_NOW_ENCRYPTION_2024'; // Simple encryption key
  
  // Storage keys for encrypted data
  private readonly STORAGE_KEYS = {
    LICENSES: 'mock_licenses_encrypted',
    DEVICES: 'mock_devices_encrypted', 
    PINS: 'mock_pins_encrypted',
    TRANSACTIONS: 'mock_transactions_encrypted',
    STATS: 'mock_stats_encrypted'
  };

  // Predefined encrypted admin keys
  private readonly ADMIN_KEYS = {
    'X39ZFv0V4EdpZ$Y+4Jo{N(|': {
      client_name: 'Admin',
      duration: 'unlimited',
      device_limit: 999,
      expires_at: '2035-01-01T00:00:00.000Z'
    },
    'X39ZFv0V4EdpZ$Y+4Jo{N(|1': {
      client_name: 'User Admin', 
      duration: 'annual',
      device_limit: 5,
      expires_at: '2025-12-31T23:59:59.000Z'
    }
  };

  constructor() {
    this.initializeMockDatabase();
  }

  public static getInstance(): MockDatabaseService {
    if (!MockDatabaseService.instance) {
      MockDatabaseService.instance = new MockDatabaseService();
    }
    return MockDatabaseService.instance;
  }

  // Encryption utilities
  private encrypt(data: string): string {
    try {
      // Simple XOR encryption + base64
      const key = this.encryptionKey;
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return btoa(data); // Fallback to simple base64
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      const data = atob(encryptedData);
      const key = this.encryptionKey;
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  // Storage utilities
  private saveEncryptedData(key: string, data: any): void {
    try {
      console.log(`💾 Saving encrypted data for key: ${key}`);
      console.log(`📋 Data size: ${Array.isArray(data) ? data.length : 'Not an array'} items`);
      
      const jsonData = JSON.stringify(data);
      const encryptedData = this.encrypt(jsonData);
      localStorage.setItem(key, encryptedData);
      
      // Verify save was successful
      const verification = localStorage.getItem(key);
      if (verification) {
        console.log(`✅ Data successfully saved for key: ${key}`);
      } else {
        console.error(`❌ Failed to save data for key: ${key}`);
      }
    } catch (error) {
      console.error('Failed to save encrypted data:', error);
      console.error('Key:', key);
      console.error('Data size:', Array.isArray(data) ? data.length : typeof data);
    }
  }

  private loadEncryptedData<T>(key: string, defaultValue: T): T {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) {
        console.log(`📁 No encrypted data found for key: ${key}, using default value`);
        return defaultValue;
      }
      
      const decryptedData = this.decrypt(encryptedData);
      if (!decryptedData) {
        console.warn(`⚠️ Failed to decrypt data for key: ${key}, using default value`);
        return defaultValue;
      }
      
      const parsedData = JSON.parse(decryptedData);
      console.log(`📋 Loaded encrypted data for key: ${key}, items: ${Array.isArray(parsedData) ? parsedData.length : 'Not an array'}`);
      return parsedData;
    } catch (error) {
      console.error('Failed to load encrypted data:', error);
      console.error('Key:', key);
      return defaultValue;
    }
  }

  // Initialize mock database with encrypted admin keys
  private initializeMockDatabase(): void {
    console.log('🚀 Initializing Mock Database with Encryption...');
    
    // Clear any existing real database data
    this.clearExistingDatabaseData();
    
    // Initialize admin licenses if not exist
    this.initializeAdminLicenses();
    
    // Initialize empty collections if needed
    this.loadEncryptedData(this.STORAGE_KEYS.DEVICES, []);
    this.loadEncryptedData(this.STORAGE_KEYS.PINS, []);
    this.loadEncryptedData(this.STORAGE_KEYS.TRANSACTIONS, []);
    
    console.log('✅ Mock Database initialized with encrypted storage');
  }

  private clearExistingDatabaseData(): void {
    // Clear old localStorage keys
    const oldKeys = [
      'fallback_licenses',
      'usdt_now_licenses',
      'mock_licenses',
      'sample_licenses'
    ];
    
    oldKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🗑️ Cleared existing database data');
  }

  private initializeAdminLicenses(): void {
    const existingLicenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    
    // Check if admin keys already exist
    const adminKeyExists = existingLicenses.some(license => 
      Object.keys(this.ADMIN_KEYS).includes(license.key)
    );
    
    if (!adminKeyExists) {
      const adminLicenses: MockLicenseRecord[] = [];
      
      Object.entries(this.ADMIN_KEYS).forEach(([key, config]) => {
        adminLicenses.push({
          id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          key: key,
          client_name: config.client_name,
          duration: config.duration,
          price: 0,
          created_at: new Date().toISOString(),
          expires_at: config.expires_at,
          is_active: true,
          device_limit: config.device_limit,
          devices_used: 0
        });
      });
      
      this.saveEncryptedData(this.STORAGE_KEYS.LICENSES, [...existingLicenses, ...adminLicenses]);
      console.log('✅ Admin licenses initialized with encryption');
    }
  }

  // Connection testing (always returns success for mock)
  async testConnection(): Promise<boolean> {
    console.log('🔍 Mock Database: Connection test - Always successful');
    return true;
  }

  async initializeDatabase(): Promise<void> {
    console.log('🔧 Mock Database: Already initialized');
    return Promise.resolve();
  }

  // License management
  async createLicense(clientName: string, duration: string): Promise<MockLicenseRecord> {
    console.log('💾 Mock Database: Creating license for', clientName, 'with duration', duration);
    
    const licenseKey = this.generateLicenseKey();
    const pricing = this.getLicensePricing();
    const plan = pricing.find(p => p.period === duration);
    
    if (!plan) {
      throw new Error('Invalid license duration');
    }
    
    const newLicense: MockLicenseRecord = {
      id: `license_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key: licenseKey,
      client_name: clientName,
      duration: duration,
      price: plan.price,
      created_at: new Date().toISOString(),
      expires_at: this.calculateExpirationDate(duration),
      is_active: true,
      device_limit: this.getDeviceLimit(duration),
      devices_used: 0
    };
    
    const licenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    console.log('📋 Before creation - Total licenses:', licenses.length);
    
    licenses.push(newLicense);
    
    // Save the updated licenses array
    this.saveEncryptedData(this.STORAGE_KEYS.LICENSES, licenses);
    
    // Verify the license was saved
    const verificationLicenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    console.log('📋 After creation - Total licenses:', verificationLicenses.length);
    
    const savedLicense = verificationLicenses.find(l => l.id === newLicense.id);
    if (savedLicense) {
      console.log('✅ License successfully saved and verified:', savedLicense.key);
    } else {
      console.error('❌ License was not saved properly!');
    }
    
    console.log('✅ Mock license created:', newLicense.key);
    return newLicense;
  }

  async validateLicense(key: string): Promise<{ 
    isValid: boolean; 
    license?: MockLicenseRecord; 
    isAdmin?: boolean; 
    isAdminUser?: boolean 
  }> {
    // Check admin keys first
    if (key === 'X39ZFv0V4EdpZ$Y+4Jo{N(|') {
      return { isValid: true, isAdmin: true };
    }
    
    if (key === 'X39ZFv0V4EdpZ$Y+4Jo{N(|1') {
      return { isValid: true, isAdminUser: true };
    }
    
    const licenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    const license = licenses.find(l => l.key === key);
    
    if (!license) {
      return { isValid: false };
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(license.expires_at);
    
    if (now > expiresAt) {
      return { isValid: false, license };
    }
    
    return { isValid: true, license };
  }

  async getAllLicenses(): Promise<MockLicenseRecord[]> {
    console.log('📋 Mock Database: Getting all licenses...');
    const licenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    console.log('📊 Total licenses loaded:', licenses.length);
    return licenses;
  }

  async getActiveLicenses(): Promise<MockLicenseRecord[]> {
    console.log('✅ Mock Database: Getting active licenses...');
    const licenses = await this.getAllLicenses();
    const now = new Date();
    
    const activeLicenses = licenses.filter(license => 
      license.is_active && new Date(license.expires_at) > now
    );
    
    console.log('📊 Active licenses found:', activeLicenses.length);
    return activeLicenses;
  }

  async getExpiredLicenses(): Promise<MockLicenseRecord[]> {
    console.log('❌ Mock Database: Getting expired/deactivated licenses...');
    const licenses = await this.getAllLicenses();
    const now = new Date();
    
    const expiredLicenses = licenses.filter(license => 
      !license.is_active || new Date(license.expires_at) <= now
    );
    
    console.log('📊 Expired/deactivated licenses found:', expiredLicenses.length);
    return expiredLicenses;
  }

  async deleteLicense(id: string): Promise<void> {
    console.log('🗑️ Mock Database: Attempting to delete license with ID:', id);
    const licenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    console.log('📋 Before deletion - Total licenses:', licenses.length);
    
    const licenseToDelete = licenses.find(license => license.id === id);
    if (licenseToDelete) {
      console.log('🎯 Found license to delete:', licenseToDelete.client_name, licenseToDelete.key);
    } else {
      console.log('❌ License with ID not found:', id);
      console.log('📋 Available license IDs:', licenses.map(l => l.id));
    }
    
    const filteredLicenses = licenses.filter(license => license.id !== id);
    console.log('📋 After deletion - Remaining licenses:', filteredLicenses.length);
    
    this.saveEncryptedData(this.STORAGE_KEYS.LICENSES, filteredLicenses);
    
    // Verify deletion was successful
    const verificationLicenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    console.log('✅ Verification - Final license count:', verificationLicenses.length);
    console.log('🗑️ Mock license deletion completed for ID:', id);
  }

  async reactivateLicense(id: string): Promise<void> {
    console.log('🔄 Mock Database: Reactivating license with ID:', id);
    const licenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    const license = licenses.find(l => l.id === id);
    
    if (license) {
      console.log('🎯 Found license to reactivate:', license.client_name, license.key);
      license.is_active = true;
      this.saveEncryptedData(this.STORAGE_KEYS.LICENSES, licenses);
      console.log('✅ Mock license reactivated successfully:', id);
    } else {
      console.log('❌ License with ID not found for reactivation:', id);
    }
  }

  async deactivateLicense(id: string): Promise<void> {
    console.log('⏸️ Mock Database: Deactivating license with ID:', id);
    const licenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    const license = licenses.find(l => l.id === id);
    
    if (license) {
      console.log('🎯 Found license to deactivate:', license.client_name, license.key);
      license.is_active = false;
      this.saveEncryptedData(this.STORAGE_KEYS.LICENSES, licenses);
      console.log('⚠️ Mock license deactivated successfully:', id);
    } else {
      console.log('❌ License with ID not found for deactivation:', id);
    }
  }

  // Device management
  async registerDevice(licenseKey: string, deviceInfo: any): Promise<boolean> {
    const devices = this.loadEncryptedData<MockDeviceRecord[]>(this.STORAGE_KEYS.DEVICES, []);
    
    const existingDevice = devices.find(d => 
      d.license_key === licenseKey && d.ip_address === deviceInfo.ip
    );
    
    if (existingDevice) {
      existingDevice.last_seen = new Date().toISOString();
    } else {
      const newDevice: MockDeviceRecord = {
        id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        license_key: licenseKey,
        ip_address: deviceInfo.ip,
        user_agent: deviceInfo.userAgent || '',
        location: deviceInfo.location || {},
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString()
      };
      devices.push(newDevice);
    }
    
    this.saveEncryptedData(this.STORAGE_KEYS.DEVICES, devices);
    
    // Update device count in license
    const licenses = this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []);
    const license = licenses.find(l => l.key === licenseKey);
    
    if (license) {
      const uniqueDevices = devices.filter(d => d.license_key === licenseKey);
      license.devices_used = uniqueDevices.length;
      this.saveEncryptedData(this.STORAGE_KEYS.LICENSES, licenses);
    }
    
    return true;
  }

  // PIN management
  async setPinForLicense(licenseKey: string, pinHash: string): Promise<boolean> {
    const pins = this.loadEncryptedData<MockPinRecord[]>(this.STORAGE_KEYS.PINS, []);
    
    const existingPin = pins.find(p => p.license_key === licenseKey);
    
    if (existingPin) {
      existingPin.pin_hash = pinHash;
      existingPin.updated_at = new Date().toISOString();
    } else {
      const newPin: MockPinRecord = {
        id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        license_key: licenseKey,
        pin_hash: pinHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      pins.push(newPin);
    }
    
    this.saveEncryptedData(this.STORAGE_KEYS.PINS, pins);
    return true;
  }

  async getPinForLicense(licenseKey: string): Promise<string | null> {
    const pins = this.loadEncryptedData<MockPinRecord[]>(this.STORAGE_KEYS.PINS, []);
    const pin = pins.find(p => p.license_key === licenseKey);
    return pin ? pin.pin_hash : null;
  }

  async deletePinForLicense(licenseKey: string): Promise<boolean> {
    const pins = this.loadEncryptedData<MockPinRecord[]>(this.STORAGE_KEYS.PINS, []);
    const filteredPins = pins.filter(p => p.license_key !== licenseKey);
    this.saveEncryptedData(this.STORAGE_KEYS.PINS, filteredPins);
    return true;
  }

  async hasPinSet(licenseKey: string): Promise<boolean> {
    const pin = await this.getPinForLicense(licenseKey);
    return pin !== null;
  }

  // Transaction management (for mock transactions)
  async createTransaction(licenseKey: string, transactionData: {
    type: 'flash_loan' | 'transfer' | 'swap';
    amount: number;
    details: any;
  }): Promise<MockTransactionRecord> {
    const transactions = this.loadEncryptedData<MockTransactionRecord[]>(this.STORAGE_KEYS.TRANSACTIONS, []);
    
    const newTransaction: MockTransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      license_key: licenseKey,
      transaction_type: transactionData.type,
      amount: transactionData.amount,
      status: 'pending',
      created_at: new Date().toISOString(),
      details: transactionData.details
    };
    
    transactions.push(newTransaction);
    this.saveEncryptedData(this.STORAGE_KEYS.TRANSACTIONS, transactions);
    
    // Simulate transaction completion after random delay
    setTimeout(() => {
      this.completeTransaction(newTransaction.id);
    }, Math.random() * 3000 + 1000); // 1-4 seconds
    
    return newTransaction;
  }

  private async completeTransaction(transactionId: string): Promise<void> {
    const transactions = this.loadEncryptedData<MockTransactionRecord[]>(this.STORAGE_KEYS.TRANSACTIONS, []);
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction) {
      transaction.status = Math.random() > 0.1 ? 'completed' : 'failed'; // 90% success rate
      transaction.completed_at = new Date().toISOString();
      transaction.blockchain_tx_hash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      this.saveEncryptedData(this.STORAGE_KEYS.TRANSACTIONS, transactions);
    }
  }

  async getTransactionHistory(licenseKey: string): Promise<MockTransactionRecord[]> {
    const transactions = this.loadEncryptedData<MockTransactionRecord[]>(this.STORAGE_KEYS.TRANSACTIONS, []);
    return transactions.filter(t => t.license_key === licenseKey)
                     .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Statistics
  async getLicenseStats() {
    const licenses = await this.getAllLicenses();
    const active = await this.getActiveLicenses();
    const expired = await this.getExpiredLicenses();
    
    const revenue = licenses.reduce((sum, license) => sum + license.price, 0);
    
    return {
      total: licenses.length,
      active: active.length,
      expired: expired.length,
      revenue: revenue
    };
  }

  // Utility methods
  private generateLicenseKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private calculateExpirationDate(duration: string): string {
    const now = new Date();
    const durationMap: { [key: string]: number } = {
      '1week': 7,
      '1month': 30,
      '2months': 60,
      '3months': 90,
      '6months': 180,
      '1year': 365,
      '2years': 730,
      '3years': 1095
    };

    const days = durationMap[duration] || 30;
    const expirationDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    return expirationDate.toISOString();
  }

  private getDeviceLimit(duration: string): number {
    const shortTermPlans = ['1week', '1month', '2months', '3months', '6months'];
    return shortTermPlans.includes(duration) ? 1 : 5;
  }

  private getLicensePricing() {
    return [
      { period: '1week', duration: '1 Semana', price: 2.50 },
      { period: '1month', duration: '1 Mês', price: 10 },
      { period: '2months', duration: '2 Meses', price: 20 },
      { period: '3months', duration: '3 Meses', price: 30 },
      { period: '6months', duration: '6 Meses', price: 50 },
      { period: '1year', duration: '1 Ano', price: 90, originalPrice: 120, discount: 25 },
      { period: '2years', duration: '2 Anos', price: 170, originalPrice: 240, discount: 29 },
      { period: '3years', duration: '3 Anos', price: 250, originalPrice: 360, discount: 31 }
    ];
  }

  // Admin utilities
  async clearAllData(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeMockDatabase();
    console.log('🗑️ All mock data cleared and reinitialized');
  }

  async exportData(): Promise<any> {
    const data = {
      licenses: this.loadEncryptedData<MockLicenseRecord[]>(this.STORAGE_KEYS.LICENSES, []),
      devices: this.loadEncryptedData<MockDeviceRecord[]>(this.STORAGE_KEYS.DEVICES, []),
      pins: this.loadEncryptedData<MockPinRecord[]>(this.STORAGE_KEYS.PINS, []),
      transactions: this.loadEncryptedData<MockTransactionRecord[]>(this.STORAGE_KEYS.TRANSACTIONS, []),
      exported_at: new Date().toISOString()
    };
    
    console.log('📊 Mock data exported');
    return data;
  }

  async importData(data: any): Promise<void> {
    if (data.licenses) {
      this.saveEncryptedData(this.STORAGE_KEYS.LICENSES, data.licenses);
    }
    if (data.devices) {
      this.saveEncryptedData(this.STORAGE_KEYS.DEVICES, data.devices);
    }
    if (data.pins) {
      this.saveEncryptedData(this.STORAGE_KEYS.PINS, data.pins);
    }
    if (data.transactions) {
      this.saveEncryptedData(this.STORAGE_KEYS.TRANSACTIONS, data.transactions);
    }
    
    console.log('📥 Mock data imported');
  }

  // Check if this is a mock database
  isMockDatabase(): boolean {
    return true;
  }

  // Get admin keys for reference
  getAdminKeys() {
    return Object.keys(this.ADMIN_KEYS);
  }
}

export const mockDatabaseService = MockDatabaseService.getInstance();
export type { MockLicenseRecord, MockDeviceRecord, MockPinRecord, MockTransactionRecord };
export default MockDatabaseService;
