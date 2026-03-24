
-- Drop existing restrictive insert policy
DROP POLICY IF EXISTS "Users insert own client" ON public.clients;

-- Allow authenticated users to insert their own client record
CREATE POLICY "Users insert own client" ON public.clients
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow service-role or any authenticated user to insert clients without user_id (admin adding clients)
CREATE POLICY "Allow insert clients without user_id" ON public.clients
FOR INSERT TO authenticated
WITH CHECK (user_id IS NULL);
