import { useState, useEffect } from "react";
import AuthFlow from "@/components/AuthFlow";
import Dashboard from "@/components/Dashboard";
import AdminPanel from "@/components/AdminPanel";
import PlansPage from "@/components/PlansPage";
import { realLicenseService } from "@/services/realLicenseService";

const Index = () => {
  console.log('🔥 Index component starting...');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [currentLicenseKey, setCurrentLicenseKey] = useState<string>("");
  const [currentLicensePlan, setCurrentLicensePlan] = useState<string | undefined>(undefined);

  // Simple session restoration
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('usdt_now_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.isAuthenticated && session.licenseKey) {
          setIsAuthenticated(true);
          setIsAdmin(session.isAdmin || false);
          setCurrentLicenseKey(session.licenseKey);
          console.log('✅ Session restored for:', session.licenseKey);
        }
      }
    } catch (error) {
      console.error('Session restore error:', error);
      localStorage.removeItem('usdt_now_session');
    }
  }, []);

  // Save session
  useEffect(() => {
    const session = {
      isAuthenticated,
      isAdmin,
      licenseKey: currentLicenseKey,
      timestamp: new Date().getTime()
    };
    localStorage.setItem('usdt_now_session', JSON.stringify(session));
  }, [isAuthenticated, isAdmin, currentLicenseKey]);

  const handleAuthSuccess = async (licenseKey: string, adminAccess = false) => {
    console.log('✅ Auth success:', licenseKey, adminAccess);
    setCurrentLicenseKey(licenseKey);
    setIsAuthenticated(true);
    setIsAdmin(adminAccess);
    setShowPlans(false);
    
    // If not admin, get the license plan type
    if (!adminAccess) {
      try {
        const license = await realLicenseService.getLicenseByKey(licenseKey);
        console.log('License data:', license);
        if (license) {
          setCurrentLicensePlan(license.duration);
          console.log('✅ License plan set:', license.duration);
        }
      } catch (error) {
        console.error('Error getting license plan:', error);
      }
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setShowPlans(false);
    setCurrentLicenseKey("");
    setCurrentLicensePlan(undefined);
    localStorage.removeItem('usdt_now_session');
  };

  const handleShowPlans = () => {
    setShowPlans(true);
  };

  const handleBackToLogin = () => {
    setShowPlans(false);
  };

  console.log('🔄 Index rendering with state:', { showPlans, isAuthenticated, isAdmin });

  try {
    return (
      <div style={{ background: 'transparent' }}>
        {showPlans ? (
          <PlansPage onBack={handleBackToLogin} />
        ) : !isAuthenticated ? (
          <AuthFlow onSuccess={handleAuthSuccess} onShowPlans={handleShowPlans} />
        ) : isAdmin ? (
          <AdminPanel onLogout={handleLogout} />
        ) : (
          <Dashboard 
            onLogout={handleLogout} 
            licenseKey={currentLicenseKey} 
            planType={currentLicensePlan}
          />
        )}
        {console.log('Rendering Dashboard with licenseKey:', currentLicenseKey, 'planType:', currentLicensePlan)}
      </div>
    );
  } catch (error) {
    console.error('❌ Index render error:', error);
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>❌ Component Error</h1>
          <p>Failed to load USDT NOW FLASHER components</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
};

export default Index;
