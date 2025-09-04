import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  ExternalLink, 
  History, 
  CheckCircle, 
  Clock 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Transaction {
  id: string;
  amount: number;
  address: string;
  hash: string;
  timestamp: Date;
  status: "completed" | "pending";
  gasFee: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const { toast } = useToast();
  const { t, formatNumber, language } = useLanguage();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("copied"),
      description: t("copied_to_clipboard"),
    });
  };

  const formatDate = (date: Date) => {
    if (language === "pt") {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (transactions.length === 0) {
    return (
      <Card className="crypto-card text-center p-12">
        <History className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">{t("no_transactions_yet")}</h3>
        <p className="text-muted-foreground">
          {t("flash_loan_operations_appear")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="crypto-card space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <History className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-semibold">{t("transaction_history")}</h2>
        </div>
        <p className="text-muted-foreground">
          {transactions.length} {transactions.length === 1 ? t("operation_performed") : t("operations_performed")}
        </p>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="relative bg-muted/20 rounded-xl p-4 border border-border/50 hover-scale transition-all duration-200"
          >
            {/* Transaction Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  #{transactions.length - index}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {formatNumber(transaction.amount)} USDT
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
              </div>
              
                <Badge 
                  variant="outline" 
                  className={`
                    ${transaction.status === 'completed' 
                      ? 'border-primary/50 text-primary bg-primary/10' 
                      : 'border-secondary/50 text-secondary bg-secondary/10'
                    }
                  `}
                >
                  {transaction.status === 'completed' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("confirmed")}
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      {t("pending")}
                    </>
                  )}
                </Badge>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("address")}
                    </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-background/50 px-2 py-1 rounded font-mono">
                      {truncateAddress(transaction.address)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.address)}
                      className="h-7 w-7 p-0 hover:bg-primary/20"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("gas_fee")}
                    </label>
                  <p className="text-sm font-medium mt-1">
                    {transaction.gasFee.toFixed(2)} TRX
                  </p>
                </div>
              </div>

              <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("transaction_hash")}
                  </label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-sm bg-background/50 px-2 py-1 rounded font-mono flex-1">
                    {truncateHash(transaction.hash)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.hash)}
                    className="h-7 w-7 p-0 hover:bg-primary/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-secondary/20"
                    onClick={() => window.open(`https://tronscan.org/#/transaction/${transaction.hash}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress indicator for pending transactions */}
            {transaction.status === 'pending' && (
              <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("processing")}</span>
                    <span>{t("seconds_remaining")}</span>
                  </div>
                <div className="w-full bg-muted/50 rounded-full h-1.5">
                  <div className="bg-gradient-secondary h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {transactions.length > 5 && (
        <div className="text-center pt-4">
          <Button variant="outline" className="hover-scale">
            {t("view_all_transactions")}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default TransactionHistory;
