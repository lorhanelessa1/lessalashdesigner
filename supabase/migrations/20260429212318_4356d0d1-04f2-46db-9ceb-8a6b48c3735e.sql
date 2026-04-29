
-- Função segura para validar PIN admin no servidor (sem expor o valor)
CREATE OR REPLACE FUNCTION public.verify_admin_pin(_pin text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_settings WHERE admin_pin = _pin
  );
$$;

-- View pública só com campos não-sensíveis das settings
CREATE OR REPLACE VIEW public.app_settings_public AS
SELECT id, whatsapp_number, catalog_pdf_url, updated_at
FROM public.app_settings;

GRANT SELECT ON public.app_settings_public TO anon, authenticated;

-- Função segura para atualizar settings (requer PIN)
CREATE OR REPLACE FUNCTION public.update_app_settings(
  _pin text,
  _whatsapp_number text,
  _catalog_pdf_url text,
  _new_admin_pin text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_pin(_pin) THEN
    RETURN false;
  END IF;

  UPDATE public.app_settings
  SET whatsapp_number = COALESCE(_whatsapp_number, whatsapp_number),
      catalog_pdf_url = COALESCE(_catalog_pdf_url, catalog_pdf_url),
      admin_pin = COALESCE(NULLIF(_new_admin_pin, ''), admin_pin),
      updated_at = now();
  RETURN true;
END;
$$;

-- Função segura para validar indicação (requer PIN)
CREATE OR REPLACE FUNCTION public.admin_validate_referral(
  _pin text,
  _referral_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_pin(_pin) THEN
    RETURN false;
  END IF;

  UPDATE public.referrals
  SET validated = true, validated_at = now()
  WHERE id = _referral_id;
  RETURN true;
END;
$$;

-- Função admin: listar todas as clientes (requer PIN)
CREATE OR REPLACE FUNCTION public.admin_list_clients(_pin text)
RETURNS SETOF public.clients
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_pin(_pin) THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM public.clients ORDER BY created_at DESC;
END;
$$;

-- Função admin: listar todas as indicações (requer PIN)
CREATE OR REPLACE FUNCTION public.admin_list_referrals(_pin text)
RETURNS SETOF public.referrals
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_pin(_pin) THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM public.referrals ORDER BY created_at DESC;
END;
$$;

-- Função admin: cadastrar cliente manualmente (requer PIN)
CREATE OR REPLACE FUNCTION public.admin_insert_client(
  _pin text,
  _name text,
  _phone text,
  _email text,
  _referral_code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF NOT public.verify_admin_pin(_pin) THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.clients (name, phone, email, referral_code)
  VALUES (_name, _phone, _email, _referral_code)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Função admin: adicionar indicação (requer PIN)
CREATE OR REPLACE FUNCTION public.admin_insert_referral(
  _pin text,
  _client_id uuid,
  _friend_name text,
  _friend_phone text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  cnt int;
BEGIN
  IF NOT public.verify_admin_pin(_pin) THEN
    RETURN NULL;
  END IF;
  SELECT COUNT(*) INTO cnt FROM public.referrals WHERE client_id = _client_id;
  IF cnt >= 5 THEN RETURN NULL; END IF;
  INSERT INTO public.referrals (client_id, friend_name, friend_phone)
  VALUES (_client_id, _friend_name, _friend_phone)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Função admin: deletar cliente (requer PIN)
CREATE OR REPLACE FUNCTION public.admin_delete_client(_pin text, _client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.verify_admin_pin(_pin) THEN RETURN false; END IF;
  DELETE FROM public.referrals WHERE client_id = _client_id;
  DELETE FROM public.clients WHERE id = _client_id;
  RETURN true;
END;
$$;

-- ============== Reescreve políticas RLS ==============

-- APP_SETTINGS: bloqueia tudo direto (acesso só via funções/view)
DROP POLICY IF EXISTS "Anon update settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated update settings" ON public.app_settings;

-- CLIENTS
DROP POLICY IF EXISTS "Allow insert clients without user_id" ON public.clients;
DROP POLICY IF EXISTS "Anon delete clients" ON public.clients;
DROP POLICY IF EXISTS "Anon insert clients" ON public.clients;
DROP POLICY IF EXISTS "Anon read clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated delete clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated read clients" ON public.clients;
DROP POLICY IF EXISTS "Users insert own client" ON public.clients;
DROP POLICY IF EXISTS "Users update own client" ON public.clients;

CREATE POLICY "Users read own client"
  ON public.clients FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own client"
  ON public.clients FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own client"
  ON public.clients FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- REFERRALS
DROP POLICY IF EXISTS "Anon insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anon read referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anon update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated read referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated update referrals" ON public.referrals;

CREATE POLICY "Users read own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY "Users insert own referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));
