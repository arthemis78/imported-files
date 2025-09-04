// Supabase configuration DISABLED - Using Mock Database
import { createClient } from '@supabase/supabase-js';

// Mock Supabase Configuration - ALL OPERATIONS DISABLED
const supabaseUrl = 'mock://disabled';
const supabaseAnonKey = 'mock_key_disabled';
const supabaseServiceKey = 'mock_service_key_disabled';

// Create Mock Supabase clients (all operations will fail gracefully)
export const supabase = createClient('https://mock.supabase.co', 'mock_key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabaseAdmin = createClient('https://mock.supabase.co', 'mock_service_key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Mock database configuration
export const dbConfig = {
  url: 'mock://disabled',
  anonKey: 'mock_disabled',
  serviceKey: 'mock_disabled',
  password: 'mock_disabled',
  enabled: false // IMPORTANT: All database operations disabled
};

console.log('🚫 Supabase DISABLED - Using Mock Database with Encryption');
console.log('🔒 All data stored locally with encryption');
console.log('🔑 Admin keys: X39ZFv0V4EdpZ$Y+4Jo{N(| and X39ZFv0V4EdpZ$Y+4Jo{N(|1');

// Export for backward compatibility
export default supabase;
