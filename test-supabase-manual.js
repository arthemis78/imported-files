// Manual Supabase connection test
import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://yojwoqhktpzeovxhscvn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvandvcWhrdHB6ZW92eGhzY3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDYzODksImV4cCI6MjA3MjUyMjM4OX0.YIXFn6ZlC6iHyfDlHI4V0TiW_xEIchkpL1H96biiXbA';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvandvcWhrdHB6ZW92eGhzY3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk0NjM4OSwiZXhwIjoyMDcyNTIyMzg5fQ.489V2Knp_CVNxGfI530aOfT3N1dLN4q21z4EGylcTuE';

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...');
  console.log('📍 URL:', supabaseUrl);
  
  // Test with anon key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test basic connection
    console.log('\n📊 Test 1: Basic connection...');
    const { data, error } = await supabase.from('licenses').select('count').limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      
      if (error.message.includes('does not exist')) {
        console.log('\n🔧 Table does not exist. Creating with service role...');
        
        // Try with service role
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        // Create table manually
        const { data: createResult, error: createError } = await supabaseAdmin
          .from('licenses')
          .upsert([
            {
              key: 'X39ZFv0V4EdpZ$Y+4Jo{N(|',
              client_name: 'Admin',
              duration: 'unlimited',
              price: 0,
              expires_at: '2035-01-01T00:00:00Z',
              device_limit: 999,
              is_active: true
            }
          ]);
          
        if (createError) {
          console.log('❌ Create error:', createError.message);
          console.log('\n📝 MANUAL STEPS NEEDED:');
          console.log('1. Go to your Supabase dashboard');
          console.log('2. Open SQL Editor');
          console.log('3. Run the SQL from manual-supabase-setup.sql file');
        } else {
          console.log('✅ Table created successfully!');
        }
      }
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Response:', data);
    
    // Test admin key lookup
    console.log('\n🔑 Test 2: Admin key lookup...');
    const { data: adminData, error: adminError } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', 'X39ZFv0V4EdpZ$Y+4Jo{N(|')
      .single();
      
    if (adminError) {
      console.log('⚠️ Admin key not found:', adminError.message);
    } else {
      console.log('✅ Admin key found:', adminData);
    }
    
    return true;
    
  } catch (error) {
    console.log('💥 Connection failed:', error.message);
    return false;
  }
}

// Run the test
testSupabase().then(success => {
  console.log('\n🎯 RESULT:', success ? '✅ SUCCESS' : '❌ FAILED');
}).catch(error => {
  console.log('\n💥 TEST CRASHED:', error.message);
});
