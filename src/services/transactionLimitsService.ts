// Transaction Limits Service - Manages generation limits for different user types
export interface UserLimits {
  maxPerTransaction: number;
  dailyLimit: number;
  isUnlimited: boolean;
  userType: 'admin' | 'personal_user' | 'weekly' | 'monthly' | 'annual' | 'regular';
}

export interface TransactionHistory {
  date: string;
  totalGenerated: number;
  transactionCount: number;
}

class TransactionLimitsService {
  private static instance: TransactionLimitsService;
  
  // Your specific user keys
  private readonly PERSONAL_USER_KEY = 'X39ZFv0V4EdpZ$Y+4Jo{N(|1'; // Your personal key
  private readonly ADMIN_KEY = 'X39ZFv0V4EdpZ$Y+4Jo{N(|'; // Admin key
  
  // Additional admin keys
  private readonly ADMIN_KEYS = [
    'X39ZFv0V4EdpZ$Y+4Jo{N(|'
  ];

  public static getInstance(): TransactionLimitsService {
    if (!TransactionLimitsService.instance) {
      TransactionLimitsService.instance = new TransactionLimitsService();
    }
    return TransactionLimitsService.instance;
  }

  // Get user limits based on license key and plan type
  getUserLimits(licenseKey: string, planType?: string): UserLimits {
    // Admin users (unlimited)
    if (this.ADMIN_KEYS.includes(licenseKey)) {
      return {
        maxPerTransaction: 5_000_000_000_000, // 5 trillion
        dailyLimit: -1, // No daily limit
        isUnlimited: true,
        userType: 'admin'
      };
    }

    // Your personal user key (special privileges)
    if (licenseKey === this.PERSONAL_USER_KEY) {
      return {
        maxPerTransaction: 5_000_000_000_000, // 5 trillion
        dailyLimit: -1, // No daily limit
        isUnlimited: true,
        userType: 'personal_user'
      };
    }

    // Plan-based limits for other users
    if (planType) {
      const shortTermPlans = ['1week', '1month', '2months', '3months'];
      const mediumTermPlans = ['6months'];
      const longTermPlans = ['1year', '2years', '3years'];

      if (shortTermPlans.includes(planType)) {
        return {
          maxPerTransaction: 1_000_000_000, // 1 billion
          dailyLimit: 5_000_000_000, // 5 billion per day
          isUnlimited: false,
          userType: planType.includes('week') ? 'weekly' : 'monthly'
        };
      }

      if (mediumTermPlans.includes(planType)) {
        return {
          maxPerTransaction: 1_000_000_000, // 1 billion
          dailyLimit: 5_000_000_000, // 5 billion per day
          isUnlimited: false,
          userType: 'monthly'
        };
      }

      if (longTermPlans.includes(planType)) {
        return {
          maxPerTransaction: 500_000_000_000, // 500 billion per transaction
          dailyLimit: 2_000_000_000_000, // 2 trillion per day
          isUnlimited: false,
          userType: 'annual'
        };
      }
    }

    // Default limits for regular users
    return {
      maxPerTransaction: 1_000_000_000, // 1 billion
      dailyLimit: 5_000_000_000, // 5 billion per day
      isUnlimited: false,
      userType: 'regular'
    };
  }

  // Validate if transaction amount is within limits
  validateTransaction(licenseKey: string, amount: number, planType?: string): {
    isValid: boolean;
    error?: string;
    limits: UserLimits;
  } {
    const limits = this.getUserLimits(licenseKey, planType);

    // Check per-transaction limit
    if (amount > limits.maxPerTransaction) {
      return {
        isValid: false,
        error: `Maximum per transaction: ${this.formatAmount(limits.maxPerTransaction)}`,
        limits
      };
    }

    // Check daily limit (if applicable)
    if (limits.dailyLimit > 0) {
      const todayUsage = this.getTodayUsage(licenseKey);
      if (todayUsage + amount > limits.dailyLimit) {
        const remaining = limits.dailyLimit - todayUsage;
        return {
          isValid: false,
          error: `Daily limit exceeded. Remaining: ${this.formatAmount(remaining)}`,
          limits
        };
      }
    }

    return { isValid: true, limits };
  }

  // Get today's usage for a user
  getTodayUsage(licenseKey: string): number {
    const today = new Date().toDateString();
    const storageKey = `daily_usage_${licenseKey}_${today}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? parseFloat(stored) : 0;
  }

  // Record a transaction
  recordTransaction(licenseKey: string, amount: number): void {
    const today = new Date().toDateString();
    const storageKey = `daily_usage_${licenseKey}_${today}`;
    const currentUsage = this.getTodayUsage(licenseKey);
    localStorage.setItem(storageKey, (currentUsage + amount).toString());

    // Also record in transaction history
    this.addToHistory(licenseKey, amount);
  }

  // Add transaction to history
  private addToHistory(licenseKey: string, amount: number): void {
    const today = new Date().toDateString();
    const historyKey = `tx_history_${licenseKey}`;
    const stored = localStorage.getItem(historyKey);
    let history: TransactionHistory[] = stored ? JSON.parse(stored) : [];

    const todayEntry = history.find(h => h.date === today);
    if (todayEntry) {
      todayEntry.totalGenerated += amount;
      todayEntry.transactionCount += 1;
    } else {
      history.push({
        date: today,
        totalGenerated: amount,
        transactionCount: 1
      });
    }

    // Keep only last 30 days
    history = history.slice(-30);
    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  // Format amount for display
  formatAmount(amount: number): string {
    if (amount >= 1_000_000_000_000) {
      return `${(amount / 1_000_000_000_000).toFixed(1)}T`;
    }
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M`;
    }
    return amount.toLocaleString();
  }

  // Get remaining daily limit
  getRemainingDaily(licenseKey: string, planType?: string): number {
    const limits = this.getUserLimits(licenseKey, planType);
    if (limits.dailyLimit <= 0) return -1; // Unlimited
    
    const used = this.getTodayUsage(licenseKey);
    return Math.max(0, limits.dailyLimit - used);
  }

  // Get user type description
  getUserTypeDescription(userType: string, language: string = 'en'): string {
    const descriptions = {
      en: {
        admin: 'Admin User - No Limits',
        personal_user: 'Personal User - Unlimited Access',
        weekly: 'Weekly Plan - 5B Daily',
        monthly: 'Monthly Plan - 5B Daily',
        annual: 'Annual Plan - 500T Daily',
        regular: 'Regular User - 1B Daily'
      },
      pt: {
        admin: 'Usuário Admin - Sem Limites',
        personal_user: 'Usuário Pessoal - Acesso Ilimitado',
        weekly: 'Plano Semanal - 5B Diário',
        monthly: 'Plano Mensal - 5B Diário',
        annual: 'Plano Anual - 500T Diário',
        regular: 'Usuário Regular - 1B Diário'
      }
    };

    return descriptions[language as keyof typeof descriptions]?.[userType as keyof typeof descriptions['en']] || userType;
  }

  // Clear daily usage (for testing)
  clearDailyUsage(licenseKey: string): void {
    const today = new Date().toDateString();
    const storageKey = `daily_usage_${licenseKey}_${today}`;
    localStorage.removeItem(storageKey);
  }

  // Get usage statistics
  getUsageStats(licenseKey: string): {
    todayUsage: number;
    totalTransactions: number;
    averagePerTransaction: number;
  } {
    const historyKey = `tx_history_${licenseKey}`;
    const stored = localStorage.getItem(historyKey);
    const history: TransactionHistory[] = stored ? JSON.parse(stored) : [];

    const todayUsage = this.getTodayUsage(licenseKey);
    const totalTransactions = history.reduce((sum, h) => sum + h.transactionCount, 0);
    const totalGenerated = history.reduce((sum, h) => sum + h.totalGenerated, 0);
    const averagePerTransaction = totalTransactions > 0 ? totalGenerated / totalTransactions : 0;

    return {
      todayUsage,
      totalTransactions,
      averagePerTransaction
    };
  }
}

export const transactionLimitsService = TransactionLimitsService.getInstance();
export type { UserLimits, TransactionHistory };
export default TransactionLimitsService;
