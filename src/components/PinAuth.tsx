import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Eye, EyeOff, Shield, Clock, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import PinService from "@/services/pinService";

interface PinAuthProps {
  licenseKey: string;
  isSetupMode?: boolean;
  onSuccess: () => void;
  onBack?: () => void;
}

const PinAuth = ({ licenseKey, isSetupMode = false, onSuccess, onBack }: PinAuthProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState("");
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const pinService = PinService.getInstance();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update remaining session time
  useEffect(() => {
    if (!isSetupMode) {
      const updateTime = () => {
        const time = pinService.formatRemainingTime(licenseKey);
        setRemainingTime(time);
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [licenseKey, isSetupMode]);

  // Handle PIN input change
  const handlePinChange = (value: string, index: number, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newPin = isConfirm ? confirmPin : pin;
    const pinArray = newPin.split('');
    
    if (value.length === 1) {
      pinArray[index] = value;
      const updatedPin = pinArray.join('');
      
      if (isConfirm) {
        setConfirmPin(updatedPin.slice(0, 6));
      } else {
        setPin(updatedPin.slice(0, 6));
      }

      // Move to next input
      if (index < 5 && value) {
        const nextInput = inputRefs.current[index + 1 + (isConfirm ? 6 : 0)];
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (value.length === 0) {
      pinArray[index] = '';
      const updatedPin = pinArray.join('');
      
      if (isConfirm) {
        setConfirmPin(updatedPin);
      } else {
        setPin(updatedPin);
      }

      // Move to previous input
      if (index > 0) {
        const prevInput = inputRefs.current[index - 1 + (isConfirm ? 6 : 0)];
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent, isConfirm = false) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (isConfirm) {
      setConfirmPin(pastedData);
    } else {
      setPin(pastedData);
    }

    // Focus last filled input
    const index = Math.min(pastedData.length - 1, 5);
    const targetInput = inputRefs.current[index + (isConfirm ? 6 : 0)];
    if (targetInput) {
      setTimeout(() => targetInput.focus(), 0);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (pin.length !== 6) {
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt" ? "PIN deve ter 6 dígitos" : "PIN must have 6 digits",
        variant: "destructive",
      });
      return;
    }

    if (isSetupMode && pin !== confirmPin) {
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt" ? "PINs não coincidem" : "PINs do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSetupMode) {
        // Setup new PIN
        const success = pinService.setPin(licenseKey, pin);
        if (success) {
          toast({
            title: language === "pt" ? "PIN Configurado" : "PIN Set",
            description: language === "pt" ? "PIN configurado com sucesso!" : "PIN set successfully!",
          });
          onSuccess();
        } else {
          throw new Error("Failed to set PIN");
        }
      } else {
        // Validate existing PIN
        const isValid = pinService.validatePin(licenseKey, pin);
        if (isValid) {
          toast({
            title: language === "pt" ? "Acesso Liberado" : "Access Granted",
            description: language === "pt" ? "PIN correto!" : "Correct PIN!",
          });
          onSuccess();
        } else {
          toast({
            title: language === "pt" ? "PIN Incorreto" : "Incorrect PIN",
            description: language === "pt" ? "Tente novamente" : "Try again",
            variant: "destructive",
          });
          setPin("");
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      console.error('PIN operation error:', error);
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt" ? "Erro interno" : "Internal error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 6 && (!isSetupMode || confirmPin.length === 6)) {
      handleSubmit();
    }
  };

  // Check if admin key
  const isAdmin = pinService.isAdminKey(licenseKey);
  const adminPin = pinService.getAdminPin(licenseKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              {isSetupMode ? (
                <Shield className="h-12 w-12 text-blue-500" />
              ) : (
                <Lock className="h-12 w-12 text-yellow-500" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {isSetupMode 
                ? (language === "pt" ? "Configurar PIN" : "Setup PIN")
                : (language === "pt" ? "Digite seu PIN" : "Enter your PIN")
              }
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSetupMode 
                ? (language === "pt" ? "Configure um PIN de 6 dígitos para proteção" : "Set up a 6-digit PIN for protection")
                : (language === "pt" ? "Digite seu PIN de 6 dígitos para continuar" : "Enter your 6-digit PIN to continue")
              }
            </p>
            
            {/* Admin info */}
            {isAdmin && (
              <Badge variant="secondary" className="text-xs">
                <Key className="h-3 w-3 mr-1" />
                {language === "pt" ? "Conta Admin" : "Admin Account"}
                {adminPin && isSetupMode && (
                  <span className="ml-2">PIN: {adminPin}</span>
                )}
              </Badge>
            )}

            {/* Session time remaining */}
            {!isSetupMode && remainingTime && (
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {language === "pt" ? "Sessão expira em" : "Session expires in"}: {remainingTime}
                </span>
              </div>
            )}
          </div>

          {/* PIN Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isSetupMode 
                  ? (language === "pt" ? "Novo PIN (6 dígitos)" : "New PIN (6 digits)")
                  : (language === "pt" ? "PIN (6 dígitos)" : "PIN (6 digits)")
                }
              </label>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type={showPin ? "text" : "password"}
                    maxLength={1}
                    value={pin[index] || ""}
                    onChange={(e) => handlePinChange(e.target.value, index)}
                    onPaste={(e) => handlePaste(e)}
                    onKeyDown={handleKeyPress}
                    className="w-12 h-12 text-center text-lg font-mono bg-input/50 border-border/50"
                    placeholder="•"
                  />
                ))}
              </div>
            </div>

            {/* Confirm PIN (setup mode only) */}
            {isSetupMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "pt" ? "Confirmar PIN (6 dígitos)" : "Confirm PIN (6 digits)"}
                </label>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={`confirm-${index}`}
                      ref={(el) => (inputRefs.current[index + 6] = el)}
                      type={showPin ? "text" : "password"}
                      maxLength={1}
                      value={confirmPin[index] || ""}
                      onChange={(e) => handlePinChange(e.target.value, index, true)}
                      onPaste={(e) => handlePaste(e, true)}
                      onKeyDown={handleKeyPress}
                      className="w-12 h-12 text-center text-lg font-mono bg-input/50 border-border/50"
                      placeholder="•"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Show PIN toggle */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                className="text-xs"
              >
                {showPin ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    {language === "pt" ? "Ocultar PIN" : "Hide PIN"}
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    {language === "pt" ? "Mostrar PIN" : "Show PIN"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || pin.length !== 6 || (isSetupMode && confirmPin.length !== 6)}
              className="w-full h-12"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === "pt" ? "Processando..." : "Processing..."}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Unlock className="h-4 w-4" />
                  <span>
                    {isSetupMode 
                      ? (language === "pt" ? "Configurar PIN" : "Setup PIN")
                      : (language === "pt" ? "Desbloquear" : "Unlock")
                    }
                  </span>
                </div>
              )}
            </Button>

            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                {language === "pt" ? "Voltar" : "Back"}
              </Button>
            )}
          </div>

          {/* Help text */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            {isSetupMode ? (
              <>
                <p>{language === "pt" ? "• Use 6 dígitos (0-9)" : "• Use 6 digits (0-9)"}</p>
                <p>{language === "pt" ? "• Será solicitado a cada 30 minutos" : "• Will be required every 30 minutes"}</p>
                {isAdmin && (
                  <p className="text-blue-400">
                    {language === "pt" ? "• Admin padrão: 000000" : "• Default admin: 000000"}
                  </p>
                )}
              </>
            ) : (
              <>
                <p>{language === "pt" ? "• Digite seu PIN de 6 dígitos" : "• Enter your 6-digit PIN"}</p>
                <p>{language === "pt" ? "• Sessão válida por 30 minutos" : "• Session valid for 30 minutes"}</p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PinAuth;
