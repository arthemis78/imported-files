import { ArrowLeft, Check, Users, Clock, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { transactionLimitsService } from "@/services/transactionLimitsService";

interface PlansPageProps {
  onBack: () => void;
}

const PlansPage = ({ onBack }: PlansPageProps) => {
  const { language, t } = useLanguage();

  // Get formatted limits for different plan types
  const getPlanLimits = (planType: string) => {
    const limits = transactionLimitsService.getUserLimits('dummy-key', planType);
    return {
      maxPerTransaction: transactionLimitsService.formatAmount(limits.maxPerTransaction),
      dailyLimit: limits.dailyLimit > 0 
        ? transactionLimitsService.formatAmount(limits.dailyLimit) 
        : (language === 'pt' ? 'Sem limite' : 'No limit')
    };
  };

  // Get specific limits for different plan categories
  const shortTermLimits = getPlanLimits('1week');
  const annualLimits = {
    maxPerTransaction: '500B',
    dailyLimit: '2T'
  };

  const plans = [
    {
      name: "1 Week",
      duration: "1week",
      price: "$2.50",
      devices: 1,
      maxPerTransaction: shortTermLimits.maxPerTransaction,
      dailyLimit: shortTermLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${shortTermLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${shortTermLimits.dailyLimit}`, 
        "24/7 Support",
        "Instant Activation"
      ]
    },
    {
      name: "1 Month",
      duration: "1month", 
      price: "$10.00",
      devices: 1,
      maxPerTransaction: shortTermLimits.maxPerTransaction,
      dailyLimit: shortTermLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${shortTermLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${shortTermLimits.dailyLimit}`,
        "24/7 Support",
        "Instant Activation",
        "Priority Processing"
      ]
    },
    {
      name: "2 Months",
      duration: "2months",
      price: "$20.00", 
      devices: 1,
      maxPerTransaction: shortTermLimits.maxPerTransaction,
      dailyLimit: shortTermLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${shortTermLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${shortTermLimits.dailyLimit}`,
        "24/7 Support", 
        "Instant Activation",
        "Priority Processing",
        "Extended Access"
      ]
    },
    {
      name: "3 Months",
      duration: "3months",
      price: "$30.00",
      devices: 1,
      maxPerTransaction: shortTermLimits.maxPerTransaction,
      dailyLimit: shortTermLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${shortTermLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${shortTermLimits.dailyLimit}`,
        "24/7 Support",
        "Instant Activation", 
        "Priority Processing",
        "Extended Access"
      ]
    },
    {
      name: "6 Months",
      duration: "6months",
      price: "$50.00",
      devices: 1,
      maxPerTransaction: shortTermLimits.maxPerTransaction,
      dailyLimit: shortTermLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${shortTermLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${shortTermLimits.dailyLimit}`,
        "24/7 Support",
        "Instant Activation",
        "Priority Processing", 
        "Extended Access",
        "Advanced Features"
      ]
    },
    {
      name: "1 Year",
      duration: "1year", 
      price: "$90.00",
      originalPrice: "$120.00",
      discount: "25% OFF",
      devices: 5,
      popular: true,
      maxPerTransaction: annualLimits.maxPerTransaction,
      dailyLimit: annualLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${annualLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${annualLimits.dailyLimit}`,
        "24/7 Support",
        "Instant Activation",
        "Priority Processing",
        "Extended Access", 
        "Advanced Features",
        "Multi-Device Support"
      ]
    },
    {
      name: "2 Years",
      duration: "2years",
      price: "$170.00", 
      originalPrice: "$240.00",
      discount: "29% OFF",
      devices: 5,
      maxPerTransaction: annualLimits.maxPerTransaction,
      dailyLimit: annualLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${annualLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${annualLimits.dailyLimit}`,
        "24/7 Support",
        "Instant Activation",
        "Priority Processing",
        "Extended Access",
        "Advanced Features", 
        "Multi-Device Support",
        "Premium Benefits"
      ]
    },
    {
      name: "3 Years",
      duration: "3years",
      price: "$250.00",
      originalPrice: "$360.00", 
      discount: "31% OFF",
      devices: 5,
      bestValue: true,
      maxPerTransaction: annualLimits.maxPerTransaction,
      dailyLimit: annualLimits.dailyLimit,
      features: [
        "Flash Loan Access",
        "Real USDT Generation",
        `Max ${annualLimits.maxPerTransaction} per transaction`,
        `Daily limit: ${annualLimits.dailyLimit}`,
        "24/7 Support",
        "Instant Activation",
        "Priority Processing",
        "Extended Access",
        "Advanced Features",
        "Multi-Device Support", 
        "Premium Benefits",
        "Lifetime Updates"
      ]
    }
  ];

  const handleTelegramContact = () => {
    window.open('https://t.me/+lk6DfBs5zhMwYWM0', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "pt" ? "Voltar ao Login" : "Back to Login"}
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {language === "pt" ? "Planos de Licença" : "License Plans"}
            </h1>
            <p className="text-gray-300">
              {language === "pt" 
                ? "Escolha o plano ideal para suas necessidades" 
                : "Choose the perfect plan for your needs"}
            </p>
          </div>
          
          <div className="w-[120px]"></div> {/* Spacer for centering */}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.duration}
              className={`relative bg-white/10 border-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-purple-400 shadow-lg shadow-purple-400/25' : ''
              } ${
                plan.bestValue ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/25' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                  {language === "pt" ? "Mais Popular" : "Most Popular"}
                </Badge>
              )}
              
              {plan.bestValue && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white">
                  {language === "pt" ? "Melhor Valor" : "Best Value"}
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-white">
                  {plan.name}
                </CardTitle>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-green-400">
                      {plan.price}
                    </span>
                  </div>
                  
                  {plan.discount && (
                    <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                      {plan.discount}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{plan.devices} {language === "pt" ? "Dispositivo(s)" : "Device(s)"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{plan.name}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleTelegramContact}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                >
                  {language === "pt" ? "Comprar Agora" : "Buy Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>{language === "pt" ? "Como Comprar" : "How to Purchase"}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
                <div className="space-y-2">
                  <div className="font-semibold text-white">
                    {language === "pt" ? "1. Contato" : "1. Contact"}
                  </div>
                  <p>{language === "pt" ? "Entre em contato pelo Telegram" : "Contact us via Telegram"}</p>
                  <Button 
                    onClick={handleTelegramContact}
                    variant="outline" 
                    size="sm"
                    className="bg-blue-600/20 border-blue-400 text-blue-400 hover:bg-blue-600/30"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {language === "pt" ? "Abrir Telegram" : "Open Telegram"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-white">
                    {language === "pt" ? "2. Pagamento" : "2. Payment"}
                  </div>
                  <p>{language === "pt" ? "Somente Crypto" : "Crypto Only"}</p>
                  <div className="text-xs text-green-400">
                    {language === "pt" ? "BTC, ETH, LTC e qualquer crypto aceitável" : "BTC, ETH, LTC and any acceptable crypto"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-white">
                    {language === "pt" ? "3. Ativação" : "3. Activation"}
                  </div>
                  <p>{language === "pt" ? "Receba sua licença instantaneamente" : "Receive your license instantly"}</p>
                  <div className="text-xs text-purple-400">
                    {language === "pt" ? "Ativação em segundos" : "Activation in seconds"}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <p className="text-xs text-gray-400">
                  {language === "pt" 
                    ? "Todas as licenças incluem suporte 24/7 e garantia de funcionamento" 
                    : "All licenses include 24/7 support and working guarantee"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlansPage;
