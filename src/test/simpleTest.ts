import { transactionLimitsService } from "@/services/transactionLimitsService";

// Simple test for formatAmount function
const limits = transactionLimitsService.getUserLimits('test-key', '1year');
console.log('Annual limits:', limits);
console.log('Formatted max:', transactionLimitsService.formatAmount(limits.maxPerTransaction));
console.log('Formatted daily:', transactionLimitsService.formatAmount(limits.dailyLimit));
