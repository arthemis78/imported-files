// Security utilities for production deployment - DISABLED
export class SecurityManager {
  private static instance: SecurityManager;

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Initialize security measures
  public initializeSecurity(): void {
    console.log('Security measures initialized');
    if (!isProduction()) {
      console.log('Security restrictions disabled in development mode');
      return; // Skip security restrictions in development
    }
    
    // Enable security features only in production
    this.disableRightClick();
    this.disableKeyboardShortcuts();
    this.disableTextSelection();
    this.disableDevTools();
    this.addCopyrightProtection();
    this.obfuscateSourceCode();
  }

  // Disable right-click context menu only in production
  private disableRightClick(): void {
    if (!isProduction()) return;
    
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showWarning('Right-click is disabled for security reasons.');
      return false;
    });
  }

  // Disable common keyboard shortcuts only in production
  private disableKeyboardShortcuts(): void {
    if (!isProduction()) return;
    
    document.addEventListener('keydown', (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'x')
      ) {
        e.preventDefault();
        this.showWarning('This action is disabled for security reasons.');
        return false;
      }
    });
  }

  // Disable text selection only in production
  private disableTextSelection(): void {
    if (!isProduction()) return;
    
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    });

    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Detect and prevent dev tools
  private disableDevTools(): void {
    // Detect when dev tools are open
    let devtools = {open: false, orientation: null};
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          this.handleDevToolsOpen();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Additional dev tools detection
    const threshold = 160;
    setInterval(() => {
      if (window.innerHeight < threshold || window.innerWidth < threshold) {
        this.handleDevToolsOpen();
      }
    }, 1000);
  }

  // Handle when dev tools are detected
  private handleDevToolsOpen(): void {
    // Show warning but don't block in development
    if (!isProduction()) {
      console.warn('Dev tools detected in development mode - access allowed for debugging');
      return;
    }
      
    // In production, show warning but don't completely block
    console.warn('Developer tools detected in production environment');
    this.showWarning('Developer tools are disabled in production environments.');
  }

  // Add copyright protection notices only in production
  private addCopyrightProtection(): void {
    if (!isProduction()) return;
    
    // Add copyright to console
    console.clear();
    console.log('%c⚠️ WARNING', 'color: red; font-size: 30px; font-weight: bold;');
    console.log('%c🔒 This is a proprietary system. Unauthorized access is prohibited.', 'color: red; font-size: 16px;');
    console.log('%c© 2024 USDT NOW. All rights reserved.', 'color: blue; font-size: 14px;');
    
    // Add invisible copyright watermark
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      opacity: 0;
      pointer-events: none;
      z-index: -1;
    `;
    watermark.innerHTML = '© 2024 USDT NOW - Proprietary Software';
    document.body.appendChild(watermark);
  }

  // Obfuscate source code references only in production
  private obfuscateSourceCode(): void {
    if (!isProduction()) return;
    
    // Remove source map references in production
    if (process.env.NODE_ENV === 'production') {
      const scripts = document.getElementsByTagName('script');
      for (let script of scripts) {
        if (script.src && script.src.includes('.map')) {
          script.remove();
        }
      }
    }
  }

  // Show security warning
  private showWarning(message: string): void {
    // Create temporary warning overlay
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px;
      border-radius: 8px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    warning.textContent = message;
    document.body.appendChild(warning);

    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 3000);
  }

  // Encrypt sensitive data
  public encryptData(data: string): string {
    // Simple encryption for demo data
    return btoa(data.split('').reverse().join(''));
  }

  // Decrypt sensitive data
  public decryptData(encryptedData: string): string {
    try {
      return atob(encryptedData).split('').reverse().join('');
    } catch {
      return '';
    }
  }
}

export default SecurityManager;
