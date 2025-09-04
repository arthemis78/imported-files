import { useEffect, useRef } from 'react';
import PinService from '@/services/pinService';

interface UseActivityMonitorProps {
  licenseKey: string;
  isActive: boolean;
  onSessionExpired: () => void;
}

export const useActivityMonitor = ({ licenseKey, isActive, onSessionExpired }: UseActivityMonitorProps) => {
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pinService = PinService.getInstance();

  // Activity events to monitor
  const activityEvents = [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];

  // Update activity timestamp
  const updateActivity = () => {
    if (!isActive || !licenseKey) return;
    
    lastActivityRef.current = Date.now();
    pinService.updateActivity();
    
    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for 30 minutes
    timeoutRef.current = setTimeout(() => {
      console.log('🔒 Session expired due to inactivity');
      pinService.clearSession(licenseKey);
      onSessionExpired();
    }, 30 * 60 * 1000); // 30 minutes
  };

  // Initialize activity monitoring
  useEffect(() => {
    if (!isActive || !licenseKey) {
      // Clear timeout if not active
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Set initial timeout
    updateActivity();

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, licenseKey]);

  // Handle page visibility change (user switches tabs/minimizes)
  useEffect(() => {
    if (!isActive || !licenseKey) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop monitoring
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else {
        // Page is visible again, check if session is still valid
        const isSessionValid = pinService.isSessionAuthenticated(licenseKey);
        if (!isSessionValid) {
          console.log('🔒 Session expired while page was hidden');
          onSessionExpired();
        } else {
          // Restart monitoring
          updateActivity();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, licenseKey]);

  // Handle beforeunload (refresh/close)
  useEffect(() => {
    if (!isActive || !licenseKey) return;

    const handleBeforeUnload = () => {
      // Clear session on page unload to force PIN re-entry
      pinService.clearSession(licenseKey);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, licenseKey]);

  return { updateActivity };
};
