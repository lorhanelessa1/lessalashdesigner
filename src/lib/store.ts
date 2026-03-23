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
  adminPin: "1234",
};

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// --- Auth ---
export async function signUp(email: string, password: string, name: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Erro ao criar conta");

  const { error: clientError } = await supabase.from("clients").insert({
    user_id: data.user.id,
    name,
    phone,
    email: null,
    referral_code: generateCode(),
  });
  if (clientError) throw clientError;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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

// --- Settings ---
export async function getSettings(): Promise<AppSettings> {
  const { data } = await supabase
    .from("app_settings")
    .select("*")
    .limit(1)
    .single();

  if (!data) return { ...DEFAULT_SETTINGS };
  return {
    whatsappNumber: data.whatsapp_number,
    catalogPdfUrl: data.catalog_pdf_url || "",
    adminPin: data.admin_pin,
  };
}

export async function saveSettings(settings: Partial<AppSettings>) {
  const current = await getSettings();
  const merged = { ...current, ...settings };
  const { data: existing } = await supabase.from("app_settings").select("id").limit(1).single();
  if (existing) {
    await supabase.from("app_settings").update({
      whatsapp_number: merged.whatsappNumber,
      catalog_pdf_url: merged.catalogPdfUrl,
      admin_pin: merged.adminPin,
    }).eq("id", existing.id);
  }
}

// --- Clients ---
async function mapClientFromDb(row: any): Promise<Client> {
  const { data: referrals } = await supabase
    .from("referrals")
    .select("*")
    .eq("client_id", row.id)
    .order("created_at", { ascending: true });

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    referralCode: row.referral_code,
    userId: row.user_id || undefined,
    referrals: (referrals || []).map((r: any) => ({
      id: r.id,
      friendName: r.friend_name,
      friendPhone: r.friend_phone,
      validated: r.validated,
      validatedAt: r.validated_at || undefined,
      createdAt: r.created_at,
    })),
    createdAt: row.created_at,
  };
}

export async function getClients(): Promise<Client[]> {
  const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (!data) return [];
  return Promise.all(data.map(mapClientFromDb));
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!data) return undefined;
  return mapClientFromDb(data);
}

export async function deleteClient(clientId: string): Promise<boolean> {
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  return !error;
}

// --- Referrals ---
export async function addReferral(clientId: string, friendName: string, friendPhone: string): Promise<Referral | null> {
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
  return {
    id: data.id,
    friendName: data.friend_name,
    friendPhone: data.friend_phone,
    validated: data.validated,
    validatedAt: data.validated_at || undefined,
    createdAt: data.created_at,
  };
}

export async function validateReferral(clientId: string, referralId: string, pin: string): Promise<boolean> {
  const settings = await getSettings();
  if (pin !== settings.adminPin) return false;
  const { error } = await supabase
    .from("referrals")
    .update({ validated: true, validated_at: new Date().toISOString() })
    .eq("id", referralId)
    .eq("client_id", clientId);
  return !error;
}

export function getValidatedCount(client: Client): number {
  return client.referrals.filter(r => r.validated).length;
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const settings = await getSettings();
  return pin === settings.adminPin;
}
