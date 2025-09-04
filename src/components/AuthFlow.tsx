import { useState } from "react";
import Login from "./Login";

interface AuthFlowProps {
  onSuccess: (licenseKey: string, isAdmin?: boolean) => void;
  onShowPlans: () => void;
}

const AuthFlow = ({ onSuccess, onShowPlans }: AuthFlowProps) => {
  // Handle successful license validation - go directly to success without PIN
  const handleLicenseSuccess = (licenseKey: string, adminStatus: boolean = false) => {
    console.log('🔓 No PIN required - direct access granted for:', licenseKey);
    onSuccess(licenseKey, adminStatus);
  };

  // Render login component only - no PIN authentication
  return (
    <Login 
      onLogin={handleLicenseSuccess}
      onShowPlans={onShowPlans}
    />
  );
};

export default AuthFlow;
