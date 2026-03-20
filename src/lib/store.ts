export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  referralCode: string;
  referrals: Referral[];
  createdAt: string;
}

export interface Referral {
  id: string;
  friendName: string;
  friendPhone: string;
  validated: boolean;
  validatedAt?: string;
  createdAt: string;
}

const ADMIN_PIN = "1234";
const STORAGE_KEY = "lash_vip_data";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateId(): string {
  return crypto.randomUUID();
}

export function getClients(): Client[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveClients(clients: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function getClientByPhone(phone: string): Client | undefined {
  return getClients().find(c => c.phone === phone);
}

export function getClientById(id: string): Client | undefined {
  return getClients().find(c => c.id === id);
}

export function createClient(name: string, phone: string, email: string): Client {
  const clients = getClients();
  const client: Client = {
    id: generateId(),
    name,
    phone,
    email,
    referralCode: generateCode(),
    referrals: [],
    createdAt: new Date().toISOString(),
  };
  clients.push(client);
  saveClients(clients);
  return client;
}

export function addReferral(clientId: string, friendName: string, friendPhone: string): Referral | null {
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client || client.referrals.length >= 5) return null;
  const referral: Referral = {
    id: generateId(),
    friendName,
    friendPhone,
    validated: false,
    createdAt: new Date().toISOString(),
  };
  client.referrals.push(referral);
  saveClients(clients);
  return referral;
}

export function validateReferral(clientId: string, referralId: string, pin: string): boolean {
  if (pin !== ADMIN_PIN) return false;
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) return false;
  const referral = client.referrals.find(r => r.id === referralId);
  if (!referral) return false;
  referral.validated = true;
  referral.validatedAt = new Date().toISOString();
  saveClients(clients);
  return true;
}

export function getValidatedCount(client: Client): number {
  return client.referrals.filter(r => r.validated).length;
}

export function verifyAdminPin(pin: string): boolean {
  return pin === ADMIN_PIN;
}

// Session
const SESSION_KEY = "lash_vip_session";

export function setSession(clientId: string, isAdmin: boolean) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ clientId, isAdmin }));
}

export function getSession(): { clientId: string; isAdmin: boolean } | null {
  const d = localStorage.getItem(SESSION_KEY);
  return d ? JSON.parse(d) : null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
