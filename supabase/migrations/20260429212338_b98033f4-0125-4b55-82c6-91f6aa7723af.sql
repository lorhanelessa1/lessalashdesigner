
DROP VIEW IF EXISTS public.app_settings_public;
CREATE VIEW public.app_settings_public
WITH (security_invoker = true) AS
SELECT id, whatsapp_number, catalog_pdf_url, updated_at
FROM public.app_settings;

GRANT SELECT ON public.app_settings_public TO anon, authenticated;

-- Permitir leitura via view (RLS na tabela base ainda bloqueia colunas sensíveis pq ninguém tem policy)
-- Como a view é security_invoker, precisamos de uma policy SELECT na tabela base
CREATE POLICY "Public read non-sensitive settings"
  ON public.app_settings FOR SELECT TO anon, authenticated
  USING (true);
