import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  referralCode: string;
  referrals: Referral[];
  createdAt: string;
  userId?: string;
}

export interface Referral {
  id: string;
  friendName: string;
  friendPhone: string;
  validated: boolean;
  validatedAt?: string;
  createdAt: string;
}

export interface AppSettings {
  whatsappNumber: string;
  catalogPdfUrl: string;
  adminPin: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  whatsappNumber: "5500000000000",
  catalogPdfUrl: "",
  adminPin: "",
};

const ADMIN_PIN_KEY = "lash_admin_pin";

export function setAdminPin(pin: string) {
  sessionStorage.setItem(ADMIN_PIN_KEY, pin);
}
export function getAdminPin(): string {
  return sessionStorage.getItem(ADMIN_PIN_KEY) || "";
}
export function clearAdminPin() {
  sessionStorage.removeItem(ADMIN_PIN_KEY);
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function phoneFromEmail(email?: string | null): string {
  const localPart = email?.split("@")[0] || "";
  return normalizePhone(localPart);
}

async function ensureClientRecord({
  userId,
  email,
  name,
  phone,
}: {
  userId: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
}) {
  const normalizedPhone = normalizePhone(phone || phoneFromEmail(email));
  const displayName = name?.trim() || normalizedPhone || "Cliente VIP";

  const { data: existing, error: existingError } = await supabase
    .from("clients")
    .select("id, name, phone, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const updates: { name?: string; phone?: string; email?: string } = {};
    if (!existing.name && displayName) updates.name = displayName;
    if (!existing.phone && normalizedPhone) updates.phone = normalizedPhone;
    if (!existing.email && email) updates.email = email;
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", existing.id);
      if (updateError) throw updateError;
    }
    return;
  }

  const { error: insertError } = await supabase.from("clients").insert({
    user_id: userId,
    name: displayName,
    phone: normalizedPhone,
    email: email || null,
    referral_code: generateCode(),
  });
  if (insertError) throw insertError;
}

// --- Auth ---
export async function signUp(email: string, password: string, name: string, phone: string) {
  const normalizedPhone = normalizePhone(phone);
  const displayName = name.trim() || normalizedPhone || "Cliente VIP";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: displayName, phone: normalizedPhone } },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Erro ao criar conta");

  if (data.session) {
    await ensureClientRecord({
      userId: data.user.id,
      email: data.user.email,
      name: displayName,
      phone: normalizedPhone,
    });
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data.user) {
    await ensureClientRecord({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      phone: data.user.user_metadata?.phone || phoneFromEmail(email),
    });
  }
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getClientByUserId(userId: string): Promise<Client | undefined> {
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return undefined;
  return mapClientFromDb(data);
}

// --- Settings (public read via view; admin pin never exposed) ---
export async function getSettings(): Promise<AppSettings> {
  const { data } = await supabase
    .from("app_settings_public" as any)
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!data) return { ...DEFAULT_SETTINGS };
  return {
    whatsappNumber: (data as any).whatsapp_number,
    catalogPdfUrl: (data as any).catalog_pdf_url || "",
    adminPin: "", // never returned to client
  };
}

export async function saveSettings(settings: Partial<AppSettings> & { currentPin?: string }) {
  const pin = settings.currentPin || getAdminPin();
  if (!pin) throw new Error("PIN admin obrigatório");
  const { data, error } = await supabase.rpc("update_app_settings", {
    _pin: pin,
    _whatsapp_number: settings.whatsappNumber ?? null,
    _catalog_pdf_url: settings.catalogPdfUrl ?? null,
    _new_admin_pin: settings.adminPin ?? "",
  });
  if (error) throw error;
  if (!data) throw new Error("PIN admin inválido");
  if (settings.adminPin) setAdminPin(settings.adminPin);
}

// --- Clients ---
function mapReferralRow(r: any): Referral {
  return {
    id: r.id,
    friendName: r.friend_name,
    friendPhone: r.friend_phone,
    validated: r.validated,
    validatedAt: r.validated_at || undefined,
    createdAt: r.created_at,
  };
}

async function mapClientFromDb(row: any, allReferrals?: any[]): Promise<Client> {
  let refs: any[];
  if (allReferrals) {
    refs = allReferrals.filter((r) => r.client_id === row.id);
  } else {
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("client_id", row.id)
      .order("created_at", { ascending: true });
    refs = data || [];
  }
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    referralCode: row.referral_code,
    userId: row.user_id || undefined,
    referrals: refs.map(mapReferralRow),
    createdAt: row.created_at,
  };
}

export async function getClients(): Promise<Client[]> {
  const pin = getAdminPin();
  if (!pin) return [];
  const { data: clients, error } = await supabase.rpc("admin_list_clients", { _pin: pin });
  if (error || !clients) return [];
  const { data: refs } = await supabase.rpc("admin_list_referrals", { _pin: pin });
  return Promise.all((clients as any[]).map((c) => mapClientFromDb(c, (refs as any[]) || [])));
}

export async function getClientById(id: string): Promise<Client | undefined> {
  // Try authenticated own-client read first
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (data) return mapClientFromDb(data);
  // Fallback for admin
  const all = await getClients();
  return all.find((c) => c.id === id);
}

export async function deleteClient(clientId: string): Promise<boolean> {
  const pin = getAdminPin();
  if (!pin) return false;
  const { data, error } = await supabase.rpc("admin_delete_client", {
    _pin: pin,
    _client_id: clientId,
  });
  return !error && !!data;
}

// --- Referrals ---
export async function addReferral(clientId: string, friendName: string, friendPhone: string): Promise<Referral | null> {
  const pin = getAdminPin();
  // Admin path
  if (pin) {
    const { data, error } = await supabase.rpc("admin_insert_referral", {
      _pin: pin,
      _client_id: clientId,
      _friend_name: friendName,
      _friend_phone: friendPhone,
    });
    if (error || !data) return null;
    const { data: row } = await supabase.from("referrals").select("*").eq("id", data as string).maybeSingle();
    return row ? mapReferralRow(row) : null;
  }
  // Client path (own client)
  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId);
  if ((count || 0) >= 5) return null;
  const { data, error } = await supabase
    .from("referrals")
    .insert({ client_id: clientId, friend_name: friendName, friend_phone: friendPhone })
    .select()
    .single();
  if (error || !data) return null;
  return mapReferralRow(data);
}

export async function validateReferral(_clientId: string, referralId: string, pin: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("admin_validate_referral", {
    _pin: pin,
    _referral_id: referralId,
  });
  return !error && !!data;
}

export function getValidatedCount(client: Client): number {
  return client.referrals.filter((r) => r.validated).length;
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("verify_admin_pin", { _pin: pin });
  if (error) return false;
  if (data) setAdminPin(pin);
  return !!data;
}

export async function adminInsertClient(name: string, phone: string, email: string): Promise<string | null> {
  const pin = getAdminPin();
  if (!pin) return null;
  const { data, error } = await supabase.rpc("admin_insert_client", {
    _pin: pin,
    _name: name,
    _phone: normalizePhone(phone),
    _email: email,
    _referral_code: generateCode(),
  });
  if (error) return null;
  return (data as string) || null;
}
