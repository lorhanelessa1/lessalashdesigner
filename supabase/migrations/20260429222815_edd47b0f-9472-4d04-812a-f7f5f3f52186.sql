-- 1. Fix app_settings: drop the permissive policy that exposed admin_pin
DROP POLICY IF EXISTS "Public read non-sensitive settings" ON public.app_settings;

-- Grant column-level SELECT only on non-sensitive columns to anon/authenticated
-- so the security_invoker view app_settings_public still works.
REVOKE SELECT ON public.app_settings FROM anon, authenticated;
GRANT SELECT (id, whatsapp_number, catalog_pdf_url, updated_at) ON public.app_settings TO anon, authenticated;

-- Add a restrictive RLS policy that only permits SELECT through the view path.
-- Since RLS is enabled and no policy grants direct SELECT, queries will return 0 rows.
-- The app_settings_public view (security_invoker=off via SECURITY DEFINER functions) still works
-- because RPCs are SECURITY DEFINER. But the view itself uses security_invoker; we need a policy.
CREATE POLICY "Read non-sensitive columns only"
  ON public.app_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);
-- Note: combined with column-level GRANT above, attempts to select admin_pin will be denied at the column-privilege layer.

-- 2. Lock down SECURITY DEFINER admin functions: revoke from anon
REVOKE EXECUTE ON FUNCTION public.admin_list_clients(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_list_referrals(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_insert_client(text, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_insert_referral(text, uuid, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_delete_client(text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_validate_referral(text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_app_settings(text, text, text, text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.admin_list_clients(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_referrals(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_insert_client(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_insert_referral(text, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_client(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_validate_referral(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_app_settings(text, text, text, text) TO authenticated;

-- verify_admin_pin needs to remain callable by anon (login screen has no session yet)
-- but we keep it as-is.

-- 3. Realtime: scope referral channel subscriptions to the owning client's user
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can subscribe to their own referrals channel"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.topic() = 'client-referrals:' || auth.uid()::text
  );
