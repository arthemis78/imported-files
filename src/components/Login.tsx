import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Lock, 
  Coins, 
  CreditCard,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { realLicenseService } from "@/services/realLicenseService";
import DeviceService from "@/services/deviceService";
import LanguageToggle from "./LanguageToggle";
import TorToggle from "./TorToggle";
import TorService from "@/services/torService";

interface LoginProps {
  onLogin: (licenseKey: string, isAdmin?: boolean) => void;
  onShowPlans: () => void;
}

const Login = ({ onLogin, onShowPlans }: LoginProps) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userIP, setUserIP] = useState<string>("");
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const torService = TorService.getInstance();

  // Get user's IP when component loads and monitor TOR status
  useEffect(() => {
    const loadUserIP = async () => {
      try {
        // Always check TOR first
        if (torService.isActive()) {
          // Always fetch fresh TOR IP when TOR is active
          const torIP = await torService.getTorIP();
          if (torIP) {
            setUserIP(torIP);
            console.log('Login: Using TOR IP:', torIP);
            return;
          } else {
            // If TOR IP fails completely, still show that TOR is active
            setUserIP('TOR Active (IP Hidden)');
            console.log('Login: TOR active but IP fetch failed');
            return;
          }
        }
        
        // Only get regular IP when TOR is not active
        const deviceService = DeviceService.getInstance();
        const deviceInfo = await deviceService.getCurrentDeviceInfo();
        setUserIP(deviceInfo.ip);
        console.log('Login: Using regular IP:', deviceInfo.ip);
      } catch (error) {
        console.error('Login: Failed to get IP:', error);
        setUserIP('IP Hidden');
      }
    };
    
    // Load initial IP
    loadUserIP();
    
    // Listen for TOR status changes
    const handleTorStatusChange = async (isConnected: boolean) => {
      if (isConnected) {
        // When TOR connects, immediately get TOR IP
        console.log('Login: TOR connected, fetching TOR IP...');
        const torIP = await torService.getTorIP();
        if (torIP) {
          setUserIP(torIP);
          console.log('Login: TOR IP updated:', torIP);
        } else {
          setUserIP('TOR Active (IP Hidden)');
          console.log('Login: TOR active but IP fetch failed');
        }
      } else {
        // When TOR disconnects, get regular IP
        console.log('Login: TOR disconnected, getting regular IP...');
        try {
          const deviceService = DeviceService.getInstance();
          const deviceInfo = await deviceService.getCurrentDeviceInfo();
          setUserIP(deviceInfo.ip);
          console.log('Login: Regular IP updated:', deviceInfo.ip);
        } catch (error) {
          console.error('Login: Failed to get regular IP:', error);
          setUserIP('IP Hidden');
        }
      }
    };
    
    torService.addListener(handleTorStatusChange);
    
    return () => {
      torService.removeListener(handleTorStatusChange);
    };
  }, []);

  const handleLogin = async () => {
    if (!licenseKey) {
      toast({
        title: t("error"),
        description: t("enter_license_key"),
        variant: "destructive",
      });
      return;
    }

    if (licenseKey.length > 24) {
      toast({
        title: t("error"),
        description: t("license_key_too_long"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const validation = await realLicenseService.validateLicense(licenseKey);
      
      if (validation.isValid) {
        if (validation.isAdmin) {
          toast({
            title: t("admin_login_success"),
            description: t("welcome_admin"),
            className: "border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-100 shadow-xl shadow-purple-500/20",
          });
          onLogin(licenseKey, true); // Admin login
        } else if (validation.isAdminUser) {
          toast({
            title: language === "pt" ? "Acesso de Usuário Admin!" : "Admin User Access!",
            description: language === "pt" ? "Bem-vindo! Acesso especial liberado." : "Welcome! Special access granted.",
            className: "border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-100 shadow-xl shadow-yellow-500/20",
          });
          onLogin(licenseKey, false); // Regular user login with special access
        } else {
          const license = validation.license!;
          const timeRemaining = realLicenseService.formatTimeRemaining(license.expiresAt);
          
          let successMessage = `${t("welcome")} ${license.clientName}! ${t("expires_in")}: ${timeRemaining}`;
          
          if (validation.deviceMessage) {
            successMessage += `. ${validation.deviceMessage}`;
          }
          
          toast({
            title: t("license_valid"),
            description: successMessage,
            className: "border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-100 shadow-xl shadow-green-500/20",
          });
          onLogin(licenseKey, false); // Regular user login
        }
      } else {
        let errorMessage = t("invalid_or_expired_license");
        
        if (validation.deviceMessage) {
          errorMessage = validation.deviceMessage;
        }
        
        toast({
          title: t("access_denied"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: "Connection error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Background - positioned at top level */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Enhanced animated circuit pattern */}
          <div className="absolute inset-0 opacity-15">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit)" />
            </svg>
          </div>
          
          {/* Enhanced floating orbs with more dynamic animation */}
          <div className="absolute top-1/5 left-1/5 w-48 h-48 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse animate-float-dynamic"></div>
          <div className="absolute bottom-1/5 right-1/5 w-72 h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse animate-float-dynamic" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-2/5 right-1/3 w-60 h-60 bg-gradient-to-r from-green-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse animate-float-dynamic" style={{ animationDelay: "3s" }}></div>
          
          {/* Additional animated elements for more depth */}
          <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse animate-float-dynamic" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-52 h-52 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse animate-float-dynamic" style={{ animationDelay: "2.5s" }}></div>
        </div>
      </div>
      
      {/* Main content - transparent background */}
      <div className="min-h-screen flex items-center justify-center p-4 fade-in-slide-up relative" style={{ background: 'transparent' }}>
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center animate-logo-float overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="USDT NOW Logo" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback to icon if logo image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Coins className="h-10 w-10 text-white hidden" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-crypto bg-clip-text text-transparent">
                USDT NOW
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("flash_loan_tron")}
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="crypto-card p-8 space-y-6 bg-gradient-to-br from-slate-800/90 to-gray-900/90 backdrop-blur-lg border-gray-700/50">
            <div className="space-y-2 text-center">
              <Lock className="mx-auto h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">{language === "pt" ? "Acesso Privado" : "Private Access"}</h2>
              <p className="text-muted-foreground">
                {t("enter_license_key_desc")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === "pt" ? "Digite sua chave privada para acessar o sistema" : "Enter your private key to access the system"}</label>
                <Input
                  type="text"
                  placeholder={t("enter_license_key_placeholder")}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="bg-input/50 border-border/50 h-12 font-mono"
                  maxLength={24}
                />
                <p className="text-xs text-muted-foreground">
                  24 {t("characters")} ({licenseKey.length}/24)
                </p>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-12 gradient-primary hover:scale-105 transition-all duration-200 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("checking")}</span>
                  </div>
                ) : (
                  t("access_system")
                )}
              </Button>
            </div>

            {/* Controls moved to login block */}
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Button
                onClick={onShowPlans}
                variant="outline"
                size="sm"
                className="bg-purple-600/20 border-purple-400 text-purple-400 hover:bg-purple-600/30"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {language === "pt" ? "Planos" : "Plans"}
              </Button>
              <TorToggle />
              <LanguageToggle />
            </div>

            {/* License Info */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("need_license")}:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>• {t("plans_available")}: 1 {t("week")} - 3 {t("years")}</span>
                  <Button
                    onClick={() => window.open('https://t.me/+lk6DfBs5zhMwYWM0', '_blank')}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div>• {t("prices_from")} $2.50</div>
                {userIP && (
                  <div className="text-blue-400 font-mono">
                    • {torService.isActive() 
                      ? (language === "pt" ? "IP TOR" : "TOR IP")
                      : (language === "pt" ? "Seu IP" : "Your IP")
                    }: {userIP}
                    {torService.isActive() && (
                      <span className="text-green-400 ml-2">
                        🔒 {language === "pt" ? "TOR" : "TOR"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.2; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(1.1); }
            }
            .animate-pulse {
              animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes fadeInSlideUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .fade-in-slide-up {
              animation: fadeInSlideUp 0.6s ease-out forwards;
            }
            
            @keyframes floatDynamic {
              0% { transform: translateY(0) translateX(0) rotate(0deg); }
              25% { transform: translateY(-30px) translateX(20px) rotate(5deg); }
              50% { transform: translateY(0) translateX(40px) rotate(10deg); }
              75% { transform: translateY(30px) translateX(20px) rotate(5deg); }
              100% { transform: translateY(0) translateX(0) rotate(0deg); }
            }
            .animate-float-dynamic {
              animation: floatDynamic 10s ease-in-out infinite;
            }
            
            @keyframes logoFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
            }
            .animate-logo-float {
              animation: logoFloat 3s ease-in-out infinite;
            }
          `}</style>
        </div>
      </div>
    </>
  );
};

export default Login;
