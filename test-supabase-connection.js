// Quick Supabase connection test
import { createClient } from '@supabase/supabase-js';

// USDT NOW Supabase Configuration
const supabaseUrl = 'https://yojwoqhktpzeovxhscvn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvandvcWhrdHB6ZW92eGhzY3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDYzODksImV4cCI6MjA3MjUyMjM4OX0.YIXFn6ZlC6iHyfDlHI4V0TiW_xEIchkpL1H96biiXbA';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Create client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase.from('licenses').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Try to fetch some data
    console.log('📊 Testing data fetch...');
    const { data: licenseData, error: fetchError } = await supabase
      .from('licenses')
      .select('*')
      .limit(5);
      
    if (fetchError) {
      console.error('❌ Data fetch failed:', fetchError.message);
      return false;
    }
    
    console.log('✅ Data fetch successful');
    console.log('📋 Found', licenseData?.length || 0, 'license records');
    
    // Test 3: Check if our keys exist
    console.log('🔑 Checking for admin keys...');
    const { data: adminKey, error: adminError } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', 'X39ZFv0V4EdpZ$Y+4Jo{N(|')
      .single();
      
    const { data: userKey, error: userError } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', 'X39ZFv0V4EdpZ$Y+4Jo{N(|1')
      .single();
    
    if (adminKey) {
      console.log('✅ Admin key found:', adminKey.client_name);
    } else {
      console.log('⚠️ Admin key not found');
    }
    
    if (userKey) {
      console.log('✅ User admin key found:', userKey.client_name);
    } else {
      console.log('⚠️ User admin key not found');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed with exception:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection is working correctly!');
  } else {
    console.log('\n💥 Supabase connection has issues!');
  }
}).catch(err => {
  console.error('\n💥 Test script failed:', err.message);
});
