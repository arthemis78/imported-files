-- Create USDT NOW database tables
-- Run this SQL in your Supabase SQL Editor

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

-- 2. Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
    id SERIAL PRIMARY KEY,
    license_key VARCHAR(50) REFERENCES public.licenses(key) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    location JSONB,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(license_key, ip_address)
);

-- 3. Create pins table for PIN authentication
CREATE TABLE IF NOT EXISTS public.pins (
    id SERIAL PRIMARY KEY,
    license_key VARCHAR(50) UNIQUE NOT NULL REFERENCES public.licenses(key) ON DELETE CASCADE,
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert default admin licenses
INSERT INTO public.licenses (key, client_name, duration, price, expires_at, device_limit, devices_used) VALUES
    ('X39ZFv0V4EdpZ$Y+4Jo{N(|', 'Admin', 'unlimited', 0, '2035-01-01 00:00:00+00', 999, 0),
    ('X39ZFv0V4EdpZ$Y+4Jo{N(|1', 'User Admin', 'annual', 0, '2025-12-31 23:59:59+00', 5, 0)
ON CONFLICT (key) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    expires_at = EXCLUDED.expires_at,
    device_limit = EXCLUDED.device_limit;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL Security;
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

-- 6. Create policies to allow access
CREATE POLICY "Allow all operations on licenses" ON public.licenses FOR ALL USING (true);
CREATE POLICY "Allow all operations on devices" ON public.devices FOR ALL USING (true);
CREATE POLICY "Allow all operations on pins" ON public.pins FOR ALL USING (true);

-- 7. Grant permissions to anon and authenticated roles
GRANT ALL ON public.licenses TO anon, authenticated;
GRANT ALL ON public.devices TO anon, authenticated;
GRANT ALL ON public.pins TO anon, authenticated;
GRANT USAGE ON SEQUENCE licenses_id_seq TO anon, authenticated;
GRANT USAGE ON SEQUENCE devices_id_seq TO anon, authenticated;
GRANT USAGE ON SEQUENCE pins_id_seq TO anon, authenticated;
