-- Add user_id column to clients table (links to auth.users)
ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX idx_clients_user_id ON public.clients(user_id);

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow public read clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public update clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public delete clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public read referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow public insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow public update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow public read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Allow public update settings" ON public.app_settings;

-- Clients: all authenticated can read (admin needs to see all)
CREATE POLICY "Authenticated read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own client" ON public.clients FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own client" ON public.clients FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- Referrals
CREATE POLICY "Authenticated read referrals" ON public.referrals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update referrals" ON public.referrals FOR UPDATE TO authenticated USING (true);

-- Settings: everyone can read, authenticated can update
CREATE POLICY "Anyone read settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true);