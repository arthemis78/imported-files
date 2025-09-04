// Mock Database Test Function - Replaces Supabase Testing
import { mockDatabaseService } from '../services/mockDatabaseService';

// Check if user is admin (only these users can see database logs)
const isAdminUser = (licenseKey?: string): boolean => {
  const adminKeys = [
    'X39ZFv0V4EdpZ$Y+4Jo{N(|',   // Admin
    'X39ZFv0V4EdpZ$Y+4Jo{N(|1'   // User Admin
  ];
  return adminKeys.includes(licenseKey || '');
};

// Mock database connection test (always succeeds)
export const testSupabaseConnection = async (licenseKey?: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  // Only show logs and popups for admin users
  const isAdmin = isAdminUser(licenseKey);
  
  if (isAdmin) {
    console.log('🔍 TESTING MOCK DATABASE FOR ADMIN...');
    console.log('🔒 Database: Mock Database with Encryption');
    console.log('👤 License Key:', licenseKey);
  }
  
  try {
    if (isAdmin) {
      console.log('📱 Testing Mock Database connection...');
    }
    
    // Test 1: Basic connection (always succeeds for mock)
    if (isAdmin) {
      console.log('📊 TESTE 1: Conexão básica...');
    }
    
    const connectionTest = await mockDatabaseService.testConnection();
    
    if (isAdmin) {
      console.log('📈 Mock Database Response:', { connected: connectionTest });
    }
    
    // Test 2: Check for admin keys (only for admin users)
    if (isAdmin) {
      console.log('🔑 TESTE 2: Verificando chaves admin...');
      
      const adminValidation = await mockDatabaseService.validateLicense(licenseKey!);
      
      console.log('👤 Admin key result:', adminValidation);
      const adminKeyExists = adminValidation.isValid;
      
      // Test 3: Get license statistics
      const stats = await mockDatabaseService.getLicenseStats();
      
      if (isAdmin) {
        console.log('📈 Database Stats:', stats);
      }
      
      return {
        success: true,
        message: `✅ Mock Database conectado! Admin key: ${adminKeyExists ? 'Encontrada' : 'Não encontrada'}`,
        details: {
          connectionStatus: 'Connected',
          databaseType: 'Mock Database with Encryption',
          adminKeyFound: adminKeyExists,
          adminData: adminValidation,
          isAdmin: true,
          stats: stats,
          encryptionEnabled: true,
          storageType: 'localStorage'
        }
      };
    } else {
      // For non-admin users, return success without details
      return {
        success: true,
        message: 'Connection verified',
        details: {
          connectionStatus: 'Connected',
          databaseType: 'Mock Database',
          isAdmin: false
        }
      };
    }
    
  } catch (error) {
    const isAdmin = isAdminUser(licenseKey);
    
    if (isAdmin) {
      console.error('💥 ERRO NO TESTE MOCK DATABASE:', error);
    }
    
    return {
      success: false,
      message: isAdmin 
        ? `Erro na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        : 'Connection test failed',
      details: isAdmin ? error : null
    };
  }
};
