import { transactionLimitsService } from "@/services/transactionLimitsService";

// Test function to verify annual limits
const testAnnualLimits = () => {
  console.log('Testing annual limits...');
  
  // Test with annual plan types
  const annualPlans = ['1year', '2years', '3years'];
  
  annualPlans.forEach(plan => {
    const limits = transactionLimitsService.getUserLimits('test-key', plan);
    console.log(`Plan: ${plan}`, limits);
  });
  
  // Test with short term plan types
  const shortPlans = ['1week', '1month', '2months', '3months'];
  
  shortPlans.forEach(plan => {
    const limits = transactionLimitsService.getUserLimits('test-key', plan);
    console.log(`Plan: ${plan}`, limits);
  });
  
  // Test with medium term plan types
  const mediumPlans = ['6months'];
  
  mediumPlans.forEach(plan => {
    const limits = transactionLimitsService.getUserLimits('test-key', plan);
    console.log(`Plan: ${plan}`, limits);
  });
};

testAnnualLimits();
