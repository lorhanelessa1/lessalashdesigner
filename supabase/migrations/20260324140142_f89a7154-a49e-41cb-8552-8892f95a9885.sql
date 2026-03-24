
-- Allow anon to read clients (for admin panel which uses PIN auth)
CREATE POLICY "Anon read clients" ON public.clients
FOR SELECT TO anon
USING (true);

-- Allow anon to read referrals (for admin panel)
CREATE POLICY "Anon read referrals" ON public.referrals
FOR SELECT TO anon
USING (true);

-- Allow anon to insert referrals (admin adding referrals)
CREATE POLICY "Anon insert referrals" ON public.referrals
FOR INSERT TO anon
WITH CHECK (true);

-- Allow anon to update referrals (admin validating)
CREATE POLICY "Anon update referrals" ON public.referrals
FOR UPDATE TO anon
USING (true);

-- Allow anon to insert clients (admin adding clients)
CREATE POLICY "Anon insert clients" ON public.clients
FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

-- Allow anon to delete clients (admin deleting)
CREATE POLICY "Anon delete clients" ON public.clients
FOR DELETE TO anon
USING (true);

-- Allow anon to update app_settings (admin updating settings)
CREATE POLICY "Anon update settings" ON public.app_settings
FOR UPDATE TO anon
USING (true);
