// PIN authentication service for session management
export class PinService {
  private static instance: PinService;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private timeoutId: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();

  public static getInstance(): PinService {
    if (!PinService.instance) {
      PinService.instance = new PinService();
    }
    return PinService.instance;
  }

  // Check if PIN is set for license key
  public hasPinSet(licenseKey: string): boolean {
    const pin = localStorage.getItem(`pin_${licenseKey}`);
    return pin !== null && pin.length === 6;
  }

  // Set PIN for license key
  public setPin(licenseKey: string, pin: string): boolean {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return false;
    }
    
    // Hash the PIN for security (simple hash for demo)
    const hashedPin = btoa(pin + licenseKey);
    localStorage.setItem(`pin_${licenseKey}`, hashedPin);
    
    // Set session as authenticated
    this.setSessionAuthenticated(licenseKey);
    return true;
  }

  // Validate PIN for license key
  public validatePin(licenseKey: string, pin: string): boolean {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return false;
    }

    const storedHash = localStorage.getItem(`pin_${licenseKey}`);
    if (!storedHash) {
      return false;
    }

    const hashedPin = btoa(pin + licenseKey);
    const isValid = storedHash === hashedPin;
    
    if (isValid) {
      this.setSessionAuthenticated(licenseKey);
    }
    
    return isValid;
  }

  // Check if session is authenticated
  public isSessionAuthenticated(licenseKey: string): boolean {
    const sessionKey = `session_${licenseKey}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (!sessionData) {
      return false;
    }

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check if session is expired
      if (now - session.timestamp > this.sessionTimeout) {
        this.clearSession(licenseKey);
        return false;
      }

      // Update last activity
      this.updateActivity();
      return true;
    } catch {
      this.clearSession(licenseKey);
      return false;
    }
  }

  // Set session as authenticated
  private setSessionAuthenticated(licenseKey: string): void {
    const sessionKey = `session_${licenseKey}`;
    const sessionData = {
      timestamp: Date.now(),
      authenticated: true,
      pageLoadTime: Date.now() // Track when this session was created
    };
    
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    this.startSessionTimeout(licenseKey);
    this.updateActivity();
  }

  // Clear session
  public clearSession(licenseKey: string): void {
    const sessionKey = `session_${licenseKey}`;
    localStorage.removeItem(sessionKey);
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Start session timeout
  private startSessionTimeout(licenseKey: string): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.clearSession(licenseKey);
      // Trigger session expired event
      window.dispatchEvent(new CustomEvent('sessionExpired', { detail: { licenseKey } }));
    }, this.sessionTimeout);
  }
  
  // Get current time (can be overridden for testing)
  private now(): number {
    return Date.now();
  }

  // Update activity timestamp
  public updateActivity(): void {
    this.lastActivity = Date.now();
  }

  // Get predefined PIN for admin keys
  public getAdminPin(licenseKey: string): string | null {
    const adminKeys = ['X39ZFv0V4EdpZ$Y+4Jo{N(|', 'X39ZFv0V4EdpZ$Y+4Jo{N(|1'];
    
    if (adminKeys.includes(licenseKey)) {
      return '000000'; // Default admin PIN
    }
    
    return null;
  }

  // Check if license key is admin
  public isAdminKey(licenseKey: string): boolean {
    const adminKeys = ['X39ZFv0V4EdpZ$Y+4Jo{N(|', 'X39ZFv0V4EdpZ$Y+4Jo{N(|1'];
    return adminKeys.includes(licenseKey);
  }

  // Initialize admin PINs automatically (disabled to remove PIN requirement)
  public initializeAdminPins(): void {
    // PIN authentication disabled - no initialization needed
    console.log('🚫 PIN authentication disabled');
  }

  // Reset PIN (admin only)
  public resetPin(licenseKey: string): void {
    localStorage.removeItem(`pin_${licenseKey}`);
    this.clearSession(licenseKey);
    
    // Dispatch session expired event
    window.dispatchEvent(new CustomEvent('sessionExpired', { detail: { licenseKey } }));
  }

  // Get remaining session time
  public getRemainingSessionTime(licenseKey: string): number {
    const sessionKey = `session_${licenseKey}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (!sessionData) {
      return 0;
    }

    try {
      const session = JSON.parse(sessionData);
      const elapsed = Date.now() - session.timestamp;
      const remaining = Math.max(0, this.sessionTimeout - elapsed);
      return remaining;
    } catch {
      return 0;
    }
  }

  // Mark page access to distinguish from background sessions
  public markPageAccess(licenseKey: string): void {
    const sessionKey = `session_${licenseKey}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        
        // Only update pageLoadTime if this is a new page load
        // or if the session is still active
        const now = Date.now();
        const isNewPageLoad = !session.pageLoadTime || (now - session.pageLoadTime) > 5000;
        
        if (isNewPageLoad) {
          session.pageLoadTime = now;
        }
        
        // Keep the session active
        session.timestamp = now;
        localStorage.setItem(sessionKey, JSON.stringify(session));
        
        // Restart the session timeout
        this.startSessionTimeout(licenseKey);
      } catch {
        // If there's an error, clear the session
        this.clearSession(licenseKey);
      }
    }
  }

  // Format remaining time as string
  public formatRemainingTime(licenseKey: string): string {
    const remaining = this.getRemainingSessionTime(licenseKey);
    if (remaining === 0) return '0:00';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    // Format with leading zero for single-digit minutes
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default PinService;
