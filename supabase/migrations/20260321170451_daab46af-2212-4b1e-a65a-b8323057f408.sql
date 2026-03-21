-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT DEFAULT '',
  referral_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  friend_phone TEXT NOT NULL,
  validated BOOLEAN NOT NULL DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_settings table (single row for app config)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT NOT NULL DEFAULT '5500000000000',
  catalog_pdf_url TEXT DEFAULT '',
  admin_pin TEXT NOT NULL DEFAULT '1234',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings row
INSERT INTO public.app_settings (whatsapp_number, catalog_pdf_url, admin_pin)
VALUES ('5500000000000', '', '1234');

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Since this app uses phone+PIN auth (no Supabase auth), we allow anon access
-- The admin PIN check is done in application logic
CREATE POLICY "Allow public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public read referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Allow public insert referrals" ON public.referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update referrals" ON public.referrals FOR UPDATE USING (true);

CREATE POLICY "Allow public read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON public.app_settings FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_referrals_client_id ON public.referrals(client_id);
CREATE INDEX idx_clients_phone ON public.clients(phone);