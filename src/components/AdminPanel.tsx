import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  DollarSign, 
  Clock, 
  Trash2, 
  Copy,
  CheckCircle,
  XCircle,
  Crown,
  Key,
  Calendar,
  TrendingUp,
  Monitor,
  MapPin,
  Globe,
  Send,
  RotateCcw,
  Pause,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { realLicenseService, type License, type LicensePlan } from "@/services/realLicenseService";
import DeviceService from "@/services/deviceService";
import LanguageToggle from "./LanguageToggle";
import TorToggle from "./TorToggle";
import TorService from "@/services/torService";

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  // Initialize with empty arrays and load from mock database
  const [licenses, setLicenses] = useState<License[]>([]);
  const [activeLicenses, setActiveLicenses] = useState<License[]>([]);
  const [expiredLicenses, setExpiredLicenses] = useState<License[]>([]);
  const [plans, setPlans] = useState<LicensePlan[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    revenue: 0
  });
  const [licenseDevices, setLicenseDevices] = useState<{[key: string]: any[]}>({});
  const [currentIP, setCurrentIP] = useState<string>("");
  
  // Pagination states
  const [activePagination, setActivePagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0
  });
  const [expiredPagination, setExpiredPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0
  });
  
  // New license form
  const [clientName, setClientName] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<License['duration']>('1month');
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const { t, formatNumber, language } = useLanguage();
  const deviceService = DeviceService.getInstance();
  const torService = TorService.getInstance();

  // Load data on component mount
  useEffect(() => {
    // Initialize database to add sample deactivated license
    const initializeDatabase = async () => {
      try {
        await realLicenseService.getLicenseStats(); // This will trigger database initialization
      } catch (error) {
        console.log('Database initialization completed');
      }
    };
    
    initializeDatabase();
    loadData();
    loadCurrentIP();
    
    // Listen for TOR status changes
    const handleTorStatusChange = async (isConnected: boolean) => {
      if (isConnected) {
        // When TOR connects, immediately get fresh TOR IP
        console.log('AdminPanel: TOR connected, fetching TOR IP...');
        const torIP = await torService.getTorIP();
        if (torIP) {
          setCurrentIP(torIP);
          console.log('AdminPanel: TOR IP updated:', torIP);
        } else {
          setCurrentIP('TOR Active (IP Hidden)');
          console.log('AdminPanel: TOR active but IP fetch failed');
        }
      } else {
        // When TOR disconnects, get regular IP
        console.log('AdminPanel: TOR disconnected, getting regular IP...');
        try {
          const deviceInfo = await deviceService.getCurrentDeviceInfo();
          setCurrentIP(deviceInfo.ip);
          console.log('AdminPanel: Regular IP updated:', deviceInfo.ip);
        } catch (error) {
          console.error('AdminPanel: Failed to get regular IP:', error);
          setCurrentIP('IP Hidden');
        }
      }
    };
    
    torService.addListener(handleTorStatusChange);
    
    return () => {
      torService.removeListener(handleTorStatusChange);
    };
  }, []);

  const loadCurrentIP = async () => {
    try {
      // Prioritize TOR IP if TOR is active
      if (torService.isActive()) {
        // Always fetch fresh TOR IP when TOR is active
        const torIP = await torService.getTorIP();
        if (torIP) {
          setCurrentIP(torIP);
          console.log('AdminPanel: Using TOR IP:', torIP);
          return;
        } else {
          // If TOR IP fails completely, still show that TOR is active
          setCurrentIP('TOR Active (IP Hidden)');
          console.log('AdminPanel: TOR active but IP fetch failed');
          return;
        }
      }
      
      // Only get regular IP when TOR is not active
      const deviceInfo = await deviceService.getCurrentDeviceInfo();
      setCurrentIP(deviceInfo.ip);
      console.log('AdminPanel: Using regular IP:', deviceInfo.ip);
    } catch (error) {
      console.error('AdminPanel: Failed to get IP:', error);
      setCurrentIP('IP Hidden');
    }
  };

  // Update pagination totals when license data changes
  useEffect(() => {
    setActivePagination(prev => ({ ...prev, totalItems: activeLicenses.length }));
    setExpiredPagination(prev => ({ ...prev, totalItems: expiredLicenses.length }));
  }, [activeLicenses, expiredLicenses]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading license data...');
      const allLicenses = await realLicenseService.getAllLicenses();
      const active = await realLicenseService.getActiveLicenses();
      const expired = await realLicenseService.getExpiredLicenses();
      const licensePlans = realLicenseService.getLicensePlans();
      const statistics = await realLicenseService.getLicenseStats();

      console.log('📊 Data loaded:', {
        allLicenses: allLicenses.length,
        active: active.length,
        expired: expired.length,
        stats: statistics
      });

      setLicenses(allLicenses);
      setActiveLicenses(active);
      setExpiredLicenses(expired);
      setPlans(licensePlans);
      setStats(statistics);
      
      // Load device information for all licenses
      const devices: {[key: string]: any[]} = {};
      [...active, ...expired].forEach(license => {
        devices[license.key] = deviceService.getLicenseDevices(license.key);
      });
      setLicenseDevices(devices);
      
      console.log('✅ License data loaded and state updated successfully');
    } catch (error) {
      console.error('Failed to load license data:', error);
      toast({
        title: t("error"),
        description: "Failed to load license data",
        variant: "destructive",
      });
    }
  };

  const handleCreateLicense = async () => {
    if (!clientName.trim()) {
      toast({
        title: t("error"),
        description: t("enter_client_name"),
        variant: "destructive",
      });
      return;
    }

    console.log('🔑 Creating license for:', clientName.trim(), 'Duration:', selectedDuration);
    setIsCreating(true);

    try {
      const newLicense = await realLicenseService.createLicense(clientName.trim(), selectedDuration);
      console.log('✅ License created successfully:', newLicense);
      
      toast({
        title: t("license_created"),
        description: `${t("license_for")} ${clientName} ${t("created_successfully")}`,
        className: "border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-100 shadow-xl shadow-green-500/20",
      });

      // Reset form
      setClientName("");
      setSelectedDuration('1month');
      
      // Force immediate reload of data
      console.log('🔄 Reloading license data after creation...');
      await loadData();
      console.log('✅ License data reloaded successfully');
    } catch (error) {
      console.error('❌ License creation error:', error);
      
      // More detailed error message
      let errorMessage = t("failed_create_license");
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: t("error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLicense = async (license: License) => {
    try {
      await realLicenseService.deleteLicense(license.id);
      toast({
        title: t("license_deleted"),
        description: `${t("license_for")} ${license.clientName} ${t("deleted_successfully")}`,
      });
      await loadData();
    } catch (error) {
      console.error('License deletion error:', error);
      toast({
        title: t("error"),
        description: "Failed to delete license",
        variant: "destructive",
      });
    }
  };

  const handleReactivateLicense = async (license: License) => {
    try {
      await realLicenseService.reactivateLicense(license.id);
      toast({
        title: language === "pt" ? "Licença Reativada" : "License Reactivated",
        description: `${t("license_for")} ${license.clientName} ${language === "pt" ? "foi reativada" : "has been reactivated"}`,
        className: "border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-100 shadow-xl shadow-green-500/20",
      });
      await loadData();
    } catch (error) {
      console.error('License reactivation error:', error);
      toast({
        title: t("error"),
        description: language === "pt" ? "Falha ao reativar licença" : "Failed to reactivate license",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateLicense = async (license: License) => {
    try {
      await realLicenseService.deactivateLicense(license.id);
      toast({
        title: language === "pt" ? "Licença Desativada" : "License Deactivated",
        description: `${t("license_for")} ${license.clientName} ${language === "pt" ? "foi desativada" : "has been deactivated"}`,
        className: "border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-100 shadow-xl shadow-yellow-500/20",
      });
      await loadData();
    } catch (error) {
      console.error('License deactivation error:', error);
      toast({
        title: t("error"),
        description: language === "pt" ? "Falha ao desativar licença" : "Failed to deactivate license",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("copied"),
      description: `${type} ${t("copied_to_clipboard")}`,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <React.Fragment>
    <div className="min-h-screen p-4 md:p-8 fade-in-rotate relative">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-crypto bg-clip-text text-transparent flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span>ADMIN PANEL</span>
            </h1>
            <p className="text-muted-foreground">
              {t("license_management_system")}
            </p>
            {currentIP && (
              <p className="text-sm text-blue-400 font-mono">
                {torService.isActive() 
                  ? (language === "pt" ? "IP TOR" : "TOR IP")
                  : (language === "pt" ? "Seu IP" : "Your IP")
                }: {currentIP}
                {torService.isActive() && (
                  <span className="text-green-400 ml-2">
                    🔒 {language === "pt" ? "TOR" : "TOR"}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <TorToggle />
            <LanguageToggle />
            
            {/* Telegram Button */}
            <Button
              onClick={() => window.open('https://t.me/+lk6DfBs5zhMwYWM0', '_blank')}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
            >
              <Send className="h-4 w-4 mr-2" />
              {language === "pt" ? "Suporte" : "Support"}
            </Button>
            
            <Button 
              onClick={onLogout} 
              variant="outline"
              className="text-red-400 border-red-400 hover:bg-red-400/20 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {language === "pt" ? "Sair" : "Logout"}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="crypto-card hover-scale bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
            <div className="p-6 space-y-2">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("total_licenses")}
                </span>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {stats.total}
              </p>
              <p className="text-xs text-muted-foreground">{t("all_time")}</p>
            </div>
          </Card>

          <Card className="crypto-card hover-scale bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
            <div className="p-6 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("active_licenses")}
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {stats.active}
              </p>
              <p className="text-xs text-muted-foreground">{t("currently_valid")}</p>
            </div>
          </Card>

          <Card className="crypto-card hover-scale bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20 animate-slide-in-left" style={{ animationDelay: "0.3s" }}>
            <div className="p-6 space-y-2">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("expired_licenses")}
                </span>
              </div>
              <p className="text-3xl font-bold text-red-400">
                {stats.expired}
              </p>
              <p className="text-xs text-muted-foreground">{t("no_longer_valid")}</p>
            </div>
          </Card>

          <Card className="crypto-card hover-scale bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 animate-slide-in-left" style={{ animationDelay: "0.4s" }}>
            <div className="p-6 space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("total_revenue")}
                </span>
              </div>
              <p className="text-3xl font-bold text-yellow-400">
                ${formatNumber(stats.revenue)}
              </p>
              <p className="text-xs text-muted-foreground">{t("gross_revenue")}</p>
            </div>
          </Card>
        </div>

        {/* License Generator */}
        <Card className="crypto-card bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 animate-slide-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Plus className="h-6 w-6 text-purple-400 animate-float" />
                <h2 className="text-2xl font-semibold">{t("generate_new_license")}</h2>
              </div>
              <p className="text-muted-foreground">
                {t("create_license_for_client")}
              </p>
            </div>

          <Separator className="bg-border/50" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("client_name")}</label>
                <Input
                  placeholder={t("enter_client_name_placeholder")}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-input/50 border-border/50 h-12"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("license_duration")}</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value as License['duration'])}
                  className="w-full h-12 px-3 rounded-md border border-border/50 bg-input/50 text-foreground"
                >
                  {plans.map((plan) => (
                    <option key={plan.period} value={plan.period}>
                      {plan.duration} - ${plan.price}
                      {plan.discount && ` (${plan.discount}% OFF)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-0">Action</label>
                <Button
                  onClick={handleCreateLicense}
                  disabled={isCreating || !clientName.trim()}
                  className="w-full h-12 gradient-primary hover:scale-105 transition-all duration-200 text-white font-semibold"
                >
                  {isCreating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t("creating_license")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>{t("generate_license")}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
          </div>
        </Card>

        {/* Active Licenses */}
        <Card className="crypto-card bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 animate-slide-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h2 className="text-2xl font-semibold">{t("active_licenses")} ({activeLicenses.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {language === "pt" ? "Mostrar:" : "Show:"}
                  </span>
                  <select 
                    value={activePagination.itemsPerPage}
                    onChange={(e) => setActivePagination({...activePagination, itemsPerPage: parseInt(e.target.value), currentPage: 1})}
                    className="bg-input border border-border rounded px-2 py-1 text-sm"
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
            </div>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            {activeLicenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t("no_active_licenses")}
              </p>
            ) : (
              <>
                {activeLicenses
                  .slice(
                    (activePagination.currentPage - 1) * activePagination.itemsPerPage,
                    activePagination.currentPage * activePagination.itemsPerPage
                  )
                  .map((license) => {
                const devices = licenseDevices[license.key] || [];
                const deviceLimit = deviceService.getDeviceLimit(license.duration);
                
                return (
                  <div key={license.id} className="border border-green-500/20 bg-green-500/5 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{license.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {license.duration} • ${license.price} • {t("expires")}: {formatDate(license.expiresAt)}
                        </div>
                        <div className="text-xs text-green-600">
                          {t("time_remaining")}: {realLicenseService.formatTimeRemaining(license.expiresAt)}
                        </div>
                        {/* Display License Key */}
                        <div className="bg-black/20 rounded p-2 mt-2">
                          <div className="text-xs text-muted-foreground mb-1">{t("license_key")}:</div>
                          <div className="font-mono text-sm text-green-400 break-all">{license.key}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => copyToClipboard(license.key, t("license_key"))}
                          variant="ghost"
                          size="sm"
                          className="h-10 px-3 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          {language === "pt" ? "Copiar" : "Copy"}
                        </Button>
                        <Button
                          onClick={() => handleDeactivateLicense(license)}
                          variant="ghost"
                          size="sm"
                          className="h-10 px-3 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/20"
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          {language === "pt" ? "Desativar" : "Deactivate"}
                        </Button>
                        <Button
                          onClick={() => handleDeleteLicense(license)}
                          variant="ghost"
                          size="sm"
                          className="h-10 px-3 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {language === "pt" ? "Excluir" : "Delete"}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Device Information */}
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Monitor className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {language === "pt" ? "Dispositivos" : "Devices"}: {devices.length}/{deviceLimit}
                          </span>
                        </div>
                        <Badge variant={devices.length >= deviceLimit ? "destructive" : "secondary"} className="text-xs">
                          {devices.length >= deviceLimit 
                            ? (language === "pt" ? "Limite Atingido" : "Limit Reached")
                            : (language === "pt" ? "Disponível" : "Available")
                          }
                        </Badge>
                      </div>
                      
                      {devices.length > 0 && (
                        <div className="space-y-1">
                          {devices.map((device, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <Globe className="h-3 w-3 text-gray-400" />
                                <span className="font-mono text-blue-400">{device.ip}</span>
                                {device.location && (
                                  <span className="text-muted-foreground">
                                    {device.location.city}, {device.location.country}
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-foreground">
                                {new Date(device.lastSeen).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {devices.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          {language === "pt" ? "Nenhum dispositivo registrado" : "No devices registered"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
                
                {/* Active Licenses Pagination - Always show controls */}
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      {language === "pt" ? "Mostrando" : "Showing"} {((activePagination.currentPage - 1) * activePagination.itemsPerPage) + 1} {language === "pt" ? "a" : "to"} {Math.min(activePagination.currentPage * activePagination.itemsPerPage, activeLicenses.length)} {language === "pt" ? "de" : "of"} {activeLicenses.length} {language === "pt" ? "licenças" : "licenses"}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActivePagination({...activePagination, currentPage: activePagination.currentPage - 1})}
                        disabled={activePagination.currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.ceil(activeLicenses.length / activePagination.itemsPerPage) }, (_, i) => i + 1)
                          .filter(page => 
                            page === 1 || 
                            page === Math.ceil(activeLicenses.length / activePagination.itemsPerPage) ||
                            Math.abs(page - activePagination.currentPage) <= 1
                          )
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="text-muted-foreground px-1">...</span>
                              )}
                              <Button
                                variant={activePagination.currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActivePagination({...activePagination, currentPage: page})}
                                className="h-8 w-8 p-0"
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))
                        }
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActivePagination({...activePagination, currentPage: activePagination.currentPage + 1})}
                        disabled={activePagination.currentPage >= Math.ceil(activeLicenses.length / activePagination.itemsPerPage)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              </>
            )}
          </div>
          </div>
        </Card>

        {/* Expired/Deactivated Licenses */}
        <Card className="crypto-card bg-gradient-to-br from-red-500/5 to-pink-500/5 border-red-500/20 animate-slide-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-6 w-6 text-red-400" />
                  <h2 className="text-2xl font-semibold">{language === "pt" ? "Licenças Expiradas/Desativadas" : "Expired/Deactivated Licenses"} ({expiredLicenses.length})</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {language === "pt" ? "Mostrar:" : "Show:"}
                  </span>
                  <select 
                    value={expiredPagination.itemsPerPage}
                    onChange={(e) => setExpiredPagination({...expiredPagination, itemsPerPage: parseInt(e.target.value), currentPage: 1})}
                    className="bg-input border border-border rounded px-2 py-1 text-sm"
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>
            </div>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            {expiredLicenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {language === "pt" ? "Nenhuma licença expirada ou desativada" : "No expired or deactivated licenses"}
              </p>
            ) : (
              <>
                {expiredLicenses
                  .slice(
                    (expiredPagination.currentPage - 1) * expiredPagination.itemsPerPage,
                    expiredPagination.currentPage * expiredPagination.itemsPerPage
                  )
                  .map((license) => {
                const devices = licenseDevices[license.key] || [];
                const deviceLimit = deviceService.getDeviceLimit(license.duration);
                const isExpired = new Date() > new Date(license.expiresAt);
                const isDeactivated = !license.isActive;
                
                return (
                  <div key={license.id} className="border border-red-500/20 bg-red-500/5 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{license.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {license.duration} • ${license.price} • {t("expires")}: {formatDate(license.expiresAt)}
                        </div>
                        <div className="text-xs text-red-600">
                          {isDeactivated && !isExpired 
                            ? (language === "pt" ? "Status: Desativada" : "Status: Deactivated")
                            : isExpired 
                            ? (language === "pt" ? "Status: Expirada" : "Status: Expired")
                            : (language === "pt" ? "Status: Inativa" : "Status: Inactive")
                          }
                        </div>
                        {/* Display License Key for deactivated licenses */}
                        <div className="bg-black/20 rounded p-2 mt-2">
                          <div className="text-xs text-muted-foreground mb-1">{t("license_key")}:</div>
                          <div className="font-mono text-sm text-red-400 break-all">{license.key}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => copyToClipboard(license.key, t("license_key"))}
                          variant="ghost"
                          size="sm"
                          className="h-10 px-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          {language === "pt" ? "Copiar" : "Copy"}
                        </Button>
                        {/* Show reactivate button only for deactivated (not expired) licenses */}
                        {isDeactivated && !isExpired && (
                          <Button
                            onClick={() => handleReactivateLicense(license)}
                            variant="ghost"
                            size="sm"
                            className="h-10 px-3 text-green-500 hover:text-green-400 hover:bg-green-500/20"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {language === "pt" ? "Reativar" : "Reactivate"}
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteLicense(license)}
                          variant="ghost"
                          size="sm"
                          className="h-10 px-3 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {language === "pt" ? "Excluir" : "Delete"}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Device Information */}
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Monitor className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {language === "pt" ? "Dispositivos Registrados" : "Registered Devices"}: {devices.length}/{deviceLimit}
                        </span>
                      </div>
                      
                      {devices.length > 0 && (
                        <div className="space-y-1">
                          {devices.map((device, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <Globe className="h-3 w-3 text-gray-400" />
                                <span className="font-mono text-blue-400">{device.ip}</span>
                                {device.location && (
                                  <span className="text-muted-foreground">
                                    {device.location.city}, {device.location.country}
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-foreground">
                                {new Date(device.lastSeen).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {devices.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          {language === "pt" ? "Nenhum dispositivo foi registrado" : "No devices were registered"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
                
                {/* Expired Licenses Pagination - Always show controls */}
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      {language === "pt" ? "Mostrando" : "Showing"} {((expiredPagination.currentPage - 1) * expiredPagination.itemsPerPage) + 1} {language === "pt" ? "a" : "to"} {Math.min(expiredPagination.currentPage * expiredPagination.itemsPerPage, expiredLicenses.length)} {language === "pt" ? "de" : "of"} {expiredLicenses.length} {language === "pt" ? "licenças" : "licenses"}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpiredPagination({...expiredPagination, currentPage: expiredPagination.currentPage - 1})}
                        disabled={expiredPagination.currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.ceil(expiredLicenses.length / expiredPagination.itemsPerPage) }, (_, i) => i + 1)
                          .filter(page => 
                            page === 1 || 
                            page === Math.ceil(expiredLicenses.length / expiredPagination.itemsPerPage) ||
                            Math.abs(page - expiredPagination.currentPage) <= 1
                          )
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="text-muted-foreground px-1">...</span>
                              )}
                              <Button
                                variant={expiredPagination.currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setExpiredPagination({...expiredPagination, currentPage: page})}
                                className="h-8 w-8 p-0"
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))
                        }
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpiredPagination({...expiredPagination, currentPage: expiredPagination.currentPage + 1})}
                        disabled={expiredPagination.currentPage >= Math.ceil(expiredLicenses.length / expiredPagination.itemsPerPage)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              </>
            )}
          </div>
          </div>
        </Card>
      </div>
    </div>
    
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
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.1); }
          }
          .animate-pulse {
            animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes fadeInRotate {
            from { opacity: 0; transform: translateY(20px) rotateX(10deg); }
            to { opacity: 1; transform: translateY(0) rotateX(0); }
          }
          .fade-in-rotate {
            animation: fadeInRotate 0.7s ease-out forwards;
            transform-style: preserve-3d;
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
          
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-left {
            animation: slideInLeft 0.6s ease-out forwards;
          }
          
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-in-up {
            animation: slideInUp 0.6s ease-out forwards;
          }
        `}</style>
      </div>
  </React.Fragment>
);
};

export default AdminPanel;
