// Device management service with IP tracking
import axios from 'axios';

interface DeviceInfo {
  ip: string;
  userAgent: string;
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
}

interface LicenseDevice {
  ip: string;
  userAgent: string;
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  firstSeen: string;
  lastSeen: string;
}

class DeviceService {
  private static instance: DeviceService;

  public static getInstance(): DeviceService {
    if (!DeviceService.instance) {
      DeviceService.instance = new DeviceService();
    }
    return DeviceService.instance;
  }

  async getCurrentDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Try primary IP service with location data
      const response = await axios.get('https://ipapi.co/json/', {
        timeout: 5000
      });
      
      return {
        ip: response.data.ip,
        userAgent: navigator.userAgent,
        location: {
          country: response.data.country_name || 'Unknown',
          region: response.data.region || 'Unknown',
          city: response.data.city || 'Unknown',
          timezone: response.data.timezone || 'Unknown'
        }
      };
    } catch (error) {
      // Fallback to simple IP service
      try {
        const response = await axios.get('https://api.ipify.org?format=json', {
          timeout: 5000
        });
        
        return {
          ip: response.data.ip,
          userAgent: navigator.userAgent
        };
      } catch (fallbackError) {
        // Ultimate fallback - use localhost (for development)
        return {
          ip: '127.0.0.1',
          userAgent: navigator.userAgent,
          location: {
            country: 'Development',
            region: 'Local',
            city: 'Localhost',
            timezone: 'UTC'
          }
        };
      }
    }
  }

  getDeviceLimit(licenseDuration: string): number {
    // Short-term plans: 1 device
    const shortTermPlans = ['1week', '1month', '2months', '3months', '6months'];
    
    // Long-term plans: 5 devices
    const longTermPlans = ['1year', '2years', '3years'];
    
    if (shortTermPlans.includes(licenseDuration.toLowerCase())) {
      return 1;
    } else if (longTermPlans.includes(licenseDuration.toLowerCase())) {
      return 5;
    }
    
    // Default to 1 device for unknown plans
    return 1;
  }

  getLicenseDevices(licenseKey: string): LicenseDevice[] {
    const stored = localStorage.getItem(`devices_${licenseKey}`);
    return stored ? JSON.parse(stored) : [];
  }

  saveLicenseDevices(licenseKey: string, devices: LicenseDevice[]): void {
    localStorage.setItem(`devices_${licenseKey}`, JSON.stringify(devices));
  }

  async validateDeviceAccess(licenseKey: string, licenseDuration: string): Promise<{
    allowed: boolean;
    currentDevice: DeviceInfo;
    deviceCount: number;
    deviceLimit: number;
    message?: string;
  }> {
    const currentDevice = await this.getCurrentDeviceInfo();
    const existingDevices = this.getLicenseDevices(licenseKey);
    const deviceLimit = this.getDeviceLimit(licenseDuration);
    
    // Check if current device is already registered
    const existingDevice = existingDevices.find(device => 
      device.ip === currentDevice.ip || 
      device.userAgent === currentDevice.userAgent
    );
    
    if (existingDevice) {
      // Update last seen time for existing device
      existingDevice.lastSeen = new Date().toISOString();
      this.saveLicenseDevices(licenseKey, existingDevices);
      
      return {
        allowed: true,
        currentDevice,
        deviceCount: existingDevices.length,
        deviceLimit
      };
    }
    
    // Check if device limit is reached
    if (existingDevices.length >= deviceLimit) {
      return {
        allowed: false,
        currentDevice,
        deviceCount: existingDevices.length,
        deviceLimit,
        message: `Device limit reached. This license allows ${deviceLimit} device(s). Contact support to remove devices.`
      };
    }
    
    // Register new device
    const newDevice: LicenseDevice = {
      ip: currentDevice.ip,
      userAgent: currentDevice.userAgent,
      location: currentDevice.location,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    
    const updatedDevices = [...existingDevices, newDevice];
    this.saveLicenseDevices(licenseKey, updatedDevices);
    
    return {
      allowed: true,
      currentDevice,
      deviceCount: updatedDevices.length,
      deviceLimit,
      message: `Device registered successfully. ${updatedDevices.length}/${deviceLimit} devices used.`
    };
  }

  removeDevice(licenseKey: string, deviceIP: string): void {
    const devices = this.getLicenseDevices(licenseKey);
    const updatedDevices = devices.filter(device => device.ip !== deviceIP);
    this.saveLicenseDevices(licenseKey, updatedDevices);
  }

  clearAllDevices(licenseKey: string): void {
    localStorage.removeItem(`devices_${licenseKey}`);
  }
}

export default DeviceService;
export type { DeviceInfo, LicenseDevice };
