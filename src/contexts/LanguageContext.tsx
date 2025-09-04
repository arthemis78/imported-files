import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "pt";

interface Translations {
  [key: string]: {
    en: string;
    pt: string;
  };
}

const translations: Translations = {
  // Login page
  "access_restricted": {
    en: "Restricted Access",
    pt: "Acesso Restrito"
  },
  "enter_access_key": {
    en: "Enter your access key to continue",
    pt: "Digite sua chave de acesso para continuar"
  },
  "access_key": {
    en: "Access Key",
    pt: "Chave de Acesso"
  },
  "enter_key": {
    en: "Enter your key...",
    pt: "Digite sua chave..."
  },
  "enter": {
    en: "Enter",
    pt: "Entrar"
  },
  "checking": {
    en: "Checking...",
    pt: "Verificando..."
  },
  "login_success": {
    en: "Login successful!",
    pt: "Login realizado!"
  },
  "welcome_usdt_now": {
    en: "Welcome to USDT NOW",
    pt: "Bem-vindo ao USDT NOW"
  },
  "access_denied": {
    en: "Access denied",
    pt: "Acesso negado"
  },
  "invalid_access_key": {
    en: "Invalid access key",
    pt: "Chave de acesso inválida"
  },
  "error": {
    en: "Error",
    pt: "Erro"
  },
  "secure_system": {
    en: "Secure system • End-to-end encryption",
    pt: "Sistema seguro • Criptografia end-to-end"
  },
  "flash_loan_tron": {
    en: "Flash Loan USDT • Tron Network",
    pt: "Flash Loan USDT • Rede Tron"
  },

  // Login with credentials
  "enter_credentials": {
    en: "Enter your credentials to continue",
    pt: "Digite suas credenciais para continuar"
  },
  "username": {
    en: "Username",
    pt: "Usuário"
  },
  "password": {
    en: "Password",
    pt: "Senha"
  },
  "enter_username": {
    en: "Enter username...",
    pt: "Digite o usuário..."
  },
  "enter_password": {
    en: "Enter password...",
    pt: "Digite a senha..."
  },
  "login": {
    en: "Login",
    pt: "Entrar"
  },
  "invalid_credentials": {
    en: "Invalid username or password",
    pt: "Usuário ou senha inválidos"
  },
  "demo_credentials": {
    en: "Demo Credentials",
    pt: "Credenciais de Demonstração"
  },

  // Dashboard - Network and blockchain specific
  "tron_network_online": {
    en: "Tron Network Online",
    pt: "Rede Tron Online"
  },
  "network_offline": {
    en: "Network Offline",
    pt: "Rede Offline"
  },
  "energy_cost": {
    en: "Energy Cost:",
    pt: "Custo de Energia:"
  },
  "bandwidth_cost": {
    en: "Bandwidth Cost:",
    pt: "Custo de Largura de Banda:"
  },
  "gas_cost_usd": {
    en: "Gas Cost (USD):",
    pt: "Custo de Gas (USD):"
  },
  "flash_loan_failed": {
    en: "Failed to generate flash loan",
    pt: "Falha ao gerar flash loan"
  },
  "failed": {
    en: "Failed",
    pt: "Falhou"
  },

  // Wallet connection
  "connect_wallet": {
    en: "Connect Wallet",
    pt: "Conectar Carteira"
  },
  "connecting": {
    en: "Connecting...",
    pt: "Conectando..."
  },
  "wallet_connected": {
    en: "Wallet Connected!",
    pt: "Carteira Conectada!"
  },
  "connected_to": {
    en: "Connected to",
    pt: "Conectado a"
  },
  "wallet_connection_failed": {
    en: "Wallet Connection Failed",
    pt: "Falha na Conexão da Carteira"
  },
  "install_tronlink": {
    en: "Please install TronLink extension",
    pt: "Por favor, instale a extensão TronLink"
  },
  "wallet_disconnected": {
    en: "Wallet Disconnected",
    pt: "Carteira Desconectada"
  },
  "wallet_disconnected_desc": {
    en: "Your wallet has been disconnected",
    pt: "Sua carteira foi desconectada"
  },
  "wallet_required": {
    en: "Wallet Required",
    pt: "Carteira Necessária"
  },
  "connect_wallet_first": {
    en: "Please connect your wallet first",
    pt: "Por favor, conecte sua carteira primeiro"
  },
  "wallet_required_warning": {
    en: "Connect your TronLink wallet to generate fake USDT",
    pt: "Conecte sua carteira TronLink para gerar USDT fake"
  },
  "connected_to_wallet": {
    en: "Connected to wallet",
    pt: "Conectado à carteira"
  },
  "insufficient_trx": {
    en: "Insufficient TRX",
    pt: "TRX Insuficiente"
  },
  "need_more_trx_gas": {
    en: "You need more TRX to pay for gas fees",
    pt: "Você precisa de mais TRX para pagar as taxas de gas"
  },
  "enter_amount": {
    en: "Please enter an amount",
    pt: "Por favor, digite um valor"
  },
  "fake_usdt_balance": {
    en: "Fake USDT Balance",
    pt: "Saldo USDT Fake"
  },
  "fake_usdt_generated": {
    en: "Fake USDT generated successfully!",
    pt: "USDT fake gerado com sucesso!"
  },
  "generating_fake_usdt": {
    en: "Generating Fake USDT...",
    pt: "Gerando USDT Fake..."
  },
  "generate_fake_usdt": {
    en: "Generate Fake USDT",
    pt: "Gerar USDT Fake"
  },
  "connect_wallet_to_generate": {
    en: "Connect Wallet to Generate",
    pt: "Conectar Carteira para Gerar"
  },

  // Real Flash Loans
  "arbitrage_opportunities": {
    en: "Arbitrage Opportunities",
    pt: "Oportunidades de Arbitragem"
  },
  "active_now": {
    en: "active now",
    pt: "ativas agora"
  },
  "total_profits": {
    en: "Total Profits",
    pt: "Lucros Totais"
  },
  "flash_loans_executed": {
    en: "Flash Loans Executed",
    pt: "Flash Loans Executados"
  },
  "real_transactions": {
    en: "real transactions",
    pt: "transações reais"
  },
  "arbitrage_success": {
    en: "arbitrage success",
    pt: "sucesso arbitragem"
  },
  "avg_profit": {
    en: "Avg Profit",
    pt: "Lucro Médio"
  },
  "per_loan": {
    en: "per loan",
    pt: "por loan"
  },
  "protocol": {
    en: "Protocol:",
    pt: "Protocolo:"
  },
  "flash_loan_fee": {
    en: "Flash Loan Fee:",
    pt: "Taxa Flash Loan:"
  },
  "best_opportunity": {
    en: "Best Opportunity:",
    pt: "Melhor Oportunidade:"
  },
  "execution_time": {
    en: "Execution Time:",
    pt: "Tempo de Execução:"
  },
  "amount_too_small": {
    en: "Amount Too Small",
    pt: "Valor Muito Pequeno"
  },
  "minimum_flash_loan": {
    en: "Minimum for flash loan",
    pt: "Mínimo para flash loan"
  },
  "need_more_trx_flash": {
    en: "You need at least 10 TRX for flash loan gas fees",
    pt: "Você precisa de pelo menos 10 TRX para taxas de gas do flash loan"
  },
  "real_flash_loan_executed": {
    en: "Real Flash Loan Executed!",
    pt: "Flash Loan Real Executado!"
  },
  "expected_profit": {
    en: "Expected profit",
    pt: "Lucro esperado"
  },
  "arbitrage_failed": {
    en: "Arbitrage execution failed",
    pt: "Execução de arbitragem falhou"
  },
  "executing_arbitrage": {
    en: "Executing Arbitrage...",
    pt: "Executando Arbitragem..."
  },
  "connect_wallet_flash_loan": {
    en: "Connect Wallet for Flash Loan",
    pt: "Conectar Carteira para Flash Loan"
  },
  "execute_flash_loan": {
    en: "Execute Flash Loan",
    pt: "Executar Flash Loan"
  },
  "real_flash_loan_generator": {
    en: "Real Flash Loan Generator",
    pt: "Gerador de Flash Loan Real"
  },
  "execute_real_arbitrage": {
    en: "Execute real arbitrage with borrowed USDT",
    pt: "Execute arbitragem real com USDT emprestado"
  },

  // License System
  "license_access": {
    en: "License Access",
    pt: "Acesso por Licença"
  },
  "enter_license_key_desc": {
    en: "Enter your valid license key to access the system",
    pt: "Digite sua chave de licença válida para acessar o sistema"
  },
  "license_key": {
    en: "License Key",
    pt: "Chave de Licença"
  },
  "enter_license_key": {
    en: "Please enter your license key",
    pt: "Por favor, digite sua chave de licença"
  },
  "enter_license_key_placeholder": {
    en: "Enter your 24-character license key...",
    pt: "Digite sua chave de licença de 24 caracteres..."
  },
  "license_key_too_long": {
    en: "License key cannot exceed 24 characters",
    pt: "Chave de licença não pode exceder 24 caracteres"
  },
  "max_24_characters": {
    en: "Maximum 24 characters",
    pt: "Máximo 24 caracteres"
  },
  "admin_login_success": {
    en: "Admin Login Successful!",
    pt: "Login de Admin Realizado!"
  },
  "welcome_admin": {
    en: "Welcome to the Admin Panel",
    pt: "Bem-vindo ao Painel do Administrador"
  },
  "license_valid": {
    en: "License Valid!",
    pt: "Licença Válida!"
  },
  "welcome": {
    en: "Welcome",
    pt: "Bem-vindo"
  },
  "expires_in": {
    en: "Expires in",
    pt: "Expira em"
  },
  "invalid_or_expired_license": {
    en: "Invalid or expired license key",
    pt: "Chave de licença inválida ou expirada"
  },
  "access_system": {
    en: "Access System",
    pt: "Acessar Sistema"
  },
  "need_license": {
    en: "Need a license?",
    pt: "Precisa de uma licença?"
  },
  "plans_available": {
    en: "Plans available",
    pt: "Planos disponíveis"
  },
  "week": {
    en: "week",
    pt: "semana"
  },
  "years": {
    en: "years",
    pt: "anos"
  },
  "prices_from": {
    en: "Prices from",
    pt: "Preços a partir de"
  },

  // Admin Panel
  "license_management_system": {
    en: "License Management System",
    pt: "Sistema de Gerenciamento de Licenças"
  },
  "logout": {
    en: "Logout",
    pt: "Sair"
  },
  "total_licenses": {
    en: "Total Licenses",
    pt: "Total de Licenças"
  },
  "all_time": {
    en: "all time",
    pt: "todo o tempo"
  },
  "active_licenses": {
    en: "Active Licenses",
    pt: "Licenças Ativas"
  },
  "currently_valid": {
    en: "currently valid",
    pt: "atualmente válidas"
  },
  "expired_licenses": {
    en: "Expired Licenses",
    pt: "Licenças Expiradas"
  },
  "no_longer_valid": {
    en: "no longer valid",
    pt: "não mais válidas"
  },
  "total_revenue": {
    en: "Total Revenue",
    pt: "Receita Total"
  },
  "gross_revenue": {
    en: "gross revenue",
    pt: "receita bruta"
  },
  "generate_new_license": {
    en: "Generate New License",
    pt: "Gerar Nova Licença"
  },
  "create_license_for_client": {
    en: "Create a new license for a client",
    pt: "Criar uma nova licença para um cliente"
  },
  "client_name": {
    en: "Client Name",
    pt: "Nome do Cliente"
  },
  "enter_client_name": {
    en: "Please enter the client name",
    pt: "Por favor, digite o nome do cliente"
  },
  "enter_client_name_placeholder": {
    en: "Enter client name...",
    pt: "Digite o nome do cliente..."
  },
  "license_duration": {
    en: "License Duration",
    pt: "Duração da Licença"
  },
  "pricing_table": {
    en: "Pricing Table",
    pt: "Tabela de Preços"
  },
  "discounted_plans": {
    en: "Discounted Plans",
    pt: "Planos com Desconto"
  },
  "creating_license": {
    en: "Creating License...",
    pt: "Criando Licença..."
  },
  "generate_license": {
    en: "Generate License",
    pt: "Gerar Licença"
  },
  "pricing_plans": {
    en: "Pricing Plans",
    pt: "Planos de Preços"
  },
  "available_license_plans": {
    en: "Available license plans and pricing",
    pt: "Planos de licença disponíveis e preços"
  },
  "payment_info": {
    en: "Payment Information",
    pt: "Informações de Pagamento"
  },
  "payment_methods": {
    en: "Payment methods",
    pt: "Métodos de pagamento"
  },
  "instant_activation": {
    en: "Instant activation",
    pt: "Ativação instantânea"
  },
  "no_active_licenses": {
    en: "No active licenses found",
    pt: "Nenhuma licença ativa encontrada"
  },
  "expires": {
    en: "Expires",
    pt: "Expira"
  },
  "time_remaining": {
    en: "Time remaining",
    pt: "Tempo restante"
  },
  "no_expired_licenses": {
    en: "No expired licenses found",
    pt: "Nenhuma licença expirada encontrada"
  },
  "expired_on": {
    en: "Expired on",
    pt: "Expirou em"
  },
  "expired": {
    en: "Expired",
    pt: "Expirada"
  },
  "license_created": {
    en: "License Created!",
    pt: "Licença Criada!"
  },
  "license_for": {
    en: "License for",
    pt: "Licença para"
  },
  "created_successfully": {
    en: "created successfully",
    pt: "criada com sucesso"
  },
  "failed_create_license": {
    en: "Failed to create license",
    pt: "Falha ao criar licença"
  },
  "license_deleted": {
    en: "License Deleted!",
    pt: "Licença Deletada!"
  },
  "deleted_successfully": {
    en: "deleted successfully",
    pt: "deletada com sucesso"
  },
  "system_online": {
    en: "System Online",
    pt: "Sistema Online"
  },
  "flash_loan_generator_subtitle": {
    en: "Flash Loan Generator • Tron Network",
    pt: "Flash Loan Generator • Rede Tron"
  },
  "total_generated": {
    en: "Total Generated",
    pt: "Total Gerado"
  },
  "transactions": {
    en: "transactions",
    pt: "transações"
  },
  "total_volume": {
    en: "Total Volume",
    pt: "Volume Total"
  },
  "success_rate": {
    en: "Success Rate",
    pt: "Taxa de Sucesso"
  },
  "operations": {
    en: "operations",
    pt: "operações"
  },
  "flash_loan_generator": {
    en: "Flash Loan Generator",
    pt: "Flash Loan Generator"
  },
  "generate_usdt_instantly": {
    en: "Generate USDT on Tron network instantly",
    pt: "Gere USDT na rede Tron instantaneamente"
  },
  "usdt_address_tron": {
    en: "USDT Address (Tron Network)",
    pt: "Endereço USDT (Rede Tron)"
  },
  "amount_usdt": {
    en: "Amount (USDT)",
    pt: "Quantidade (USDT)"
  },
  "estimated_gas": {
    en: "Estimated Gas Fee:",
    pt: "Gas Fee estimado:"
  },
  "estimated_time": {
    en: "Estimated time:",
    pt: "Tempo estimado:"
  },
  "success_rate_value": {
    en: "Success rate:",
    pt: "Taxa de sucesso:"
  },
  "generate_usdt": {
    en: "Generate USDT",
    pt: "Gerar USDT"
  },
  "generating_flash_loan": {
    en: "Generating Flash Loan...",
    pt: "Gerando Flash Loan..."
  },
  "latest_transaction": {
    en: "Latest Transaction",
    pt: "Última Transação"
  },
  "recent_operation_details": {
    en: "Details of the most recent operation",
    pt: "Detalhes da operação mais recente"
  },
  "amount": {
    en: "Amount:",
    pt: "Valor:"
  },
  "address": {
    en: "Address",
    pt: "Endereço"
  },
  "transaction_hash": {
    en: "Transaction Hash",
    pt: "Hash da Transação"
  },
  "gas_fee": {
    en: "Gas Fee",
    pt: "Gas Fee"
  },
  "status": {
    en: "Status",
    pt: "Status"
  },
  "confirmed": {
    en: "Confirmed",
    pt: "Confirmado"
  },
  "copied": {
    en: "Copied!",
    pt: "Copiado!"
  },
  "copied_to_clipboard": {
    en: "Text copied to clipboard",
    pt: "Texto copiado para a área de transferência"
  },
  "fill_all_fields": {
    en: "Fill in all fields",
    pt: "Preencha todos os campos"
  },
  "invalid_address": {
    en: "Invalid address",
    pt: "Endereço inválido"
  },
  "tron_address_format": {
    en: "TRON address must start with 'T' and have 34 characters",
    pt: "Endereço TRON deve começar com 'T' e ter 34 caracteres"
  },
  "invalid_amount": {
    en: "Invalid amount",
    pt: "Valor inválido"
  },
  "amount_range": {
    en: "Amount must be between 0.01 and 1,000,000,000 USDT",
    pt: "O valor deve estar entre 0.01 e 1.000.000.000 USDT"
  },
  "flash_loan_executed": {
    en: "Flash Loan Executed!",
    pt: "Flash Loan Executado!"
  },
  "usdt_generated_success": {
    en: "USDT generated successfully",
    pt: "USDT gerados com sucesso"
  },

  // Transaction History
  "transaction_history": {
    en: "Transaction History",
    pt: "Histórico de Transações"
  },
  "operations_performed": {
    en: "operations performed",
    pt: "operações realizadas"
  },
  "operation_performed": {
    en: "operation performed",
    pt: "operação realizada"
  },
  "no_transactions_yet": {
    en: "No transactions yet",
    pt: "Nenhuma transação ainda"
  },
  "flash_loan_operations_appear": {
    en: "Your flash loan operations will appear here",
    pt: "Suas operações de flash loan aparecerão aqui"
  },
  "pending": {
    en: "Pending",
    pt: "Pendente"
  },
  "processing": {
    en: "Processing...",
    pt: "Processando..."
  },
  "seconds_remaining": {
    en: "~30s remaining",
    pt: "~30s restantes"
  },
  "view_all_transactions": {
    en: "View All Transactions",
    pt: "Ver Todas as Transações"
  },

  // USDT Info
  "usdt_info_title": {
    en: "About Generated USDT",
    pt: "Sobre o USDT Gerado"
  },
  "usdt_info_desc": {
    en: "Understanding your generated tokens",
    pt: "Entendendo seus tokens gerados"
  },
  "what_you_can_do": {
    en: "What you can do",
    pt: "O que você pode fazer"
  },
  "transferable": {
    en: "Transferable between Tron wallets",
    pt: "Transferível entre carteiras Tron"
  },
  "swappable": {
    en: "Swappable on DEXs (SunSwap, JustSwap)",
    pt: "Negociável em DEXs (SunSwap, JustSwap)"
  },
  "stakeable": {
    en: "Usable in liquidity pools",
    pt: "Utilizável em pools de liquidez"
  },
  "smart_contracts": {
    en: "Works with Tron DApps",
    pt: "Funciona com DApps da Tron"
  },
  "limitations": {
    en: "Limitations",
    pt: "Limitações"
  },
  "no_real_value": {
    en: "No real monetary value",
    pt: "Sem valor monetário real"
  },
  "detection_possible": {
    en: "May be detected by advanced analysis",
    pt: "Pode ser detectado por análise avançada"
  },
  "durability": {
    en: "Durability",
    pt: "Durabilidade"
  },
  "permanent_blockchain": {
    en: "Permanent on Tron blockchain",
    pt: "Permanente na blockchain Tron"
  },
  "no_expiration": {
    en: "No automatic expiration",
    pt: "Sem expiração automática"
  },
  "use_cases": {
    en: "Use Cases",
    pt: "Casos de Uso"
  },
  "testing_dapps": {
    en: "Testing DApps and smart contracts",
    pt: "Testar DApps e contratos inteligentes"
  },
  "demonstrations": {
    en: "Demonstrations and learning",
    pt: "Demonstrações e aprendizado"
  },
  "defi_practice": {
    en: "DeFi operations practice",
    pt: "Prática de operações DeFi"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initialize language from localStorage or default to "en"
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('usdt_now_language');
      return (savedLanguage === 'pt' || savedLanguage === 'en') ? savedLanguage as Language : 'en';
    } catch (error) {
      console.error('Error loading language preference:', error);
      return 'en';
    }
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('usdt_now_language', language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const formatNumber = (num: number): string => {
    if (language === "pt") {
      return num.toLocaleString("pt-BR");
    }
    return num.toLocaleString("en-US");
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
