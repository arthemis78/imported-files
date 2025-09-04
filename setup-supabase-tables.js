// Setup Supabase tables directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yojwoqhktpzeovxhscvn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvandvcWhrdHB6ZW92eGhzY3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzkxNTU5MywiZXhwIjoyMDQ5NDkxNTkzfQ.BjE-fCIm8nCi5zZs7fxjw4dxA5MnIqpJzlr3E_m8lXo';

async function setupTables() {
  console.log('🔧 Setting up Supabase tables...');
  
  // Create client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Create licenses table with SQL
    console.log('📊 Creating licenses table...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create licenses table
        CREATE TABLE IF NOT EXISTS public.licenses (
            id SERIAL PRIMARY KEY,
            key VARCHAR(50) UNIQUE NOT NULL,
            client_name VARCHAR(255) NOT NULL,
            duration VARCHAR(50) NOT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            device_limit INTEGER DEFAULT 1,
            devices_used INTEGER DEFAULT 0
        );

        -- Enable RLS
        ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

        -- Create policy
        CREATE POLICY IF NOT EXISTS "Allow all operations on licenses" ON public.licenses FOR ALL USING (true);

        -- Grant permissions
        GRANT ALL ON public.licenses TO anon, authenticated;
        GRANT USAGE ON SEQUENCE licenses_id_seq TO anon, authenticated;

        -- Insert admin keys
        INSERT INTO public.licenses (key, client_name, duration, price, expires_at, device_limit) VALUES
            ('X39ZFv0V4EdpZ$Y+4Jo{N(|', 'Admin', 'unlimited', 0, '2035-01-01 00:00:00+00', 999),
            ('X39ZFv0V4EdpZ$Y+4Jo{N(|1', 'User Admin', 'annual', 0, '2025-12-31 23:59:59+00', 5)
        ON CONFLICT (key) DO UPDATE SET
            client_name = EXCLUDED.client_name,
            expires_at = EXCLUDED.expires_at,
            device_limit = EXCLUDED.device_limit;
      `
    });

    if (error) {
      console.log('❌ SQL execution failed:', error.message);
      
      // Fallback: try direct table creation
      console.log('🔄 Trying fallback method...');
      
      const { error: fallbackError } = await supabase
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
          },
          {
            key: 'X39ZFv0V4EdpZ$Y+4Jo{N(|1',
            client_name: 'User Admin',
            duration: 'annual',
            price: 0,
            expires_at: '2025-12-31T23:59:59Z',
            device_limit: 5,
            is_active: true
          }
        ]);
        
      if (fallbackError) {
        console.log('❌ Fallback also failed:', fallbackError.message);
        console.log('\n📝 MANUAL SETUP REQUIRED:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Copy and paste the content of manual-supabase-setup.sql');
        console.log('4. Run the SQL');
        return false;
      } else {
        console.log('✅ Fallback successful - admin keys inserted!');
      }
    } else {
      console.log('✅ Tables created successfully!');
    }

    // Verify setup
    const { data: verifyData, error: verifyError } = await supabase
      .from('licenses')
      .select('*')
      .in('key', ['X39ZFv0V4EdpZ$Y+4Jo{N(|', 'X39ZFv0V4EdpZ$Y+4Jo{N(|1']);

    if (verifyError) {
      console.log('⚠️ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Verification successful!');
      console.log('📋 Admin keys found:', verifyData.length);
      verifyData.forEach(license => {
        console.log(`  - ${license.key}: ${license.client_name}`);
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

setupTables().then(success => {
  if (success) {
    console.log('🎉 Supabase setup completed successfully!');
  } else {
    console.log('❌ Supabase setup failed. Manual intervention required.');
  }
  process.exit(success ? 0 : 1);
});
