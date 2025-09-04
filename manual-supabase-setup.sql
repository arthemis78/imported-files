-- USDT NOW - Manual table creation for Supabase
-- Copy and paste this into your Supabase SQL Editor and run it

-- 1. Create licenses table
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

-- 2. Insert admin keys
INSERT INTO public.licenses (key, client_name, duration, price, expires_at, device_limit) VALUES
    ('X39ZFv0V4EdpZ$Y+4Jo{N(|', 'Admin', 'unlimited', 0, '2035-01-01 00:00:00+00', 999),
    ('X39ZFv0V4EdpZ$Y+4Jo{N(|1', 'User Admin', 'annual', 0, '2025-12-31 23:59:59+00', 5)
ON CONFLICT (key) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    expires_at = EXCLUDED.expires_at,
    device_limit = EXCLUDED.device_limit;

-- 3. Set up RLS and permissions
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow access
CREATE POLICY IF NOT EXISTS "Allow all operations on licenses" ON public.licenses FOR ALL USING (true);

-- 5. Grant permissions
GRANT ALL ON public.licenses TO anon, authenticated;
GRANT USAGE ON SEQUENCE licenses_id_seq TO anon, authenticated;

-- Verify the setup
SELECT * FROM public.licenses;
