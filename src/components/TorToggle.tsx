import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck } from "lucide-react";
import TorService from "@/services/torService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const TorToggle = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();
  const torService = TorService.getInstance();

  useEffect(() => {
    // Set initial state
    setIsConnected(torService.isActive());

    // Listen for status changes
    const handleStatusChange = (status: boolean) => {
      setIsConnected(status);
      setIsConnecting(false);
    };

    torService.addListener(handleStatusChange);

    return () => {
      torService.removeListener(handleStatusChange);
    };
  }, []);

  const handleToggle = async () => {
    if (isConnected) {
      // Disconnect from TOR
      setIsConnecting(true);
      await torService.disconnect();
      toast({
        title: language === "pt" ? "TOR Desconectado" : "TOR Disconnected",
        description: language === "pt" ? "Conexão TOR foi desativada" : "TOR connection has been disabled",
        variant: "destructive",
      });
    } else {
      // Connect to TOR
      setIsConnecting(true);
      toast({
        title: language === "pt" ? "Conectando ao TOR..." : "Connecting to TOR...",
        description: language === "pt" ? "Estabelecendo conexão segura" : "Establishing secure connection",
      });
      
      const success = await torService.connect();
      
      if (success) {
        toast({
          title: language === "pt" ? "TOR Conectado" : "TOR Connected",
          description: language === "pt" ? "Conexão TOR ativa e segura" : "TOR connection active and secure",
        });
      } else {
        toast({
          title: language === "pt" ? "Falha na Conexão TOR" : "TOR Connection Failed",
          description: language === "pt" ? "Não foi possível conectar ao TOR" : "Could not connect to TOR network",
          variant: "destructive",
        });
      }
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className={`transition-all duration-300 ${
        isConnected 
          ? "bg-green-600/20 border-green-400 text-green-400 hover:bg-green-600/30" 
          : "bg-red-600/20 border-red-400 text-red-400 hover:bg-red-600/30"
      }`}
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          <span className="text-sm">
            {language === "pt" ? "Conectando..." : "Connecting..."}
          </span>
        </>
      ) : isConnected ? (
        <>
          <ShieldCheck className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {language === "pt" ? "TOR Ativo" : "TOR Active"}
          </span>
        </>
      ) : (
        <>
          <Shield className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {language === "pt" ? "TOR Inativo" : "TOR Inactive"}
          </span>
        </>
      )}
    </Button>
  );
};

export default TorToggle;
