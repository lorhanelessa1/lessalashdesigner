import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSession, clearSession, getClients, addReferral, validateReferral,
  getSettings, saveSettings, deleteClient, getClientById,
  type Client,
} from "@/lib/store";
import { LogOut, UserPlus, Users, Check, Diamond, ChevronRight, Settings, Phone, FileText, Trash2, Shield } from "lucide-react";

type View = "clients" | "detail" | "addReferral" | "settings";

export default function Admin() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<View>("clients");
  const [selected, setSelected] = useState<Client | null>(null);
  const [friendName, setFriendName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [catalogUrl, setCatalogUrl] = useState("");
  const [adminPin, setAdminPin] = useState("");

  const refresh = async () => {
    const c = await getClients();
    setClients(c);
    return c;
  };

  useEffect(() => {
    const session = getSession();
    if (!session?.isAdmin) {
      navigate("/");
      return;
    }
    const init = async () => {
      await refresh();
      const s = await getSettings();
      setWhatsappNumber(s.whatsappNumber);
      setCatalogUrl(s.catalogPdfUrl);
      setAdminPin(s.adminPin);
    };
    init();
  }, [navigate]);

  const handleAddReferral = async () => {
    if (!selected || !friendName.trim() || !friendPhone.trim()) {
      setMsg("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const r = await addReferral(selected.id, friendName, friendPhone);
      if (!r) {
        setMsg("Limite de indicações atingido.");
        return;
      }
      setFriendName("");
      setFriendPhone("");
      setMsg("Indicação adicionada!");
      const updatedClients = await refresh();
      setSelected(updatedClients.find(c => c.id === selected.id) || null);
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (referralId: string) => {
    if (!selected) return;
    const settings = await getSettings();
    await validateReferral(selected.id, referralId, settings.adminPin);
    const updatedClients = await refresh();
    setSelected(updatedClients.find(c => c.id === selected.id) || null);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm("Deseja realmente excluir esta cliente?")) {
      await deleteClient(clientId);
      await refresh();
      setSelected(null);
      setView("clients");
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await saveSettings({
        whatsappNumber,
        catalogPdfUrl: catalogUrl,
        adminPin: adminPin || "1234",
      });
      setMsg("Configurações salvas!");
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Painel</p>
          <h2 className="font-display text-xl text-foreground">Administradora</h2>
          <p className="text-[9px] tracking-[0.15em] text-gold font-body mt-0.5">Lessa Lash Designer</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("settings")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
              view === "settings" ? "bg-gold/20 text-gold" : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => { clearSession(); navigate("/"); }}
            className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 space-y-4">
        {view === "settings" && (
          <>
            <button onClick={() => setView("clients")} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
            <h3 className="font-display text-lg flex items-center gap-2"><Settings className="w-4 h-4 text-gold" />Configurações</h3>
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-2">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /><label className="text-sm font-body font-medium">WhatsApp de Trabalho</label></div>
                <input type="tel" placeholder="5511999999999" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
                <p className="text-[10px] text-muted-foreground font-body">Número com código do país (ex: 5511999999999)</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-2">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gold" /><label className="text-sm font-body font-medium">Catálogo PDF (URL)</label></div>
                <input type="url" placeholder="https://exemplo.com/catalogo.pdf" value={catalogUrl} onChange={(e) => setCatalogUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
                <p className="text-[10px] text-muted-foreground font-body">Link direto do PDF do seu catálogo de serviços</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-2">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /><label className="text-sm font-body font-medium">PIN Admin</label></div>
                <input type="password" placeholder="****" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
                <p className="text-[10px] text-muted-foreground font-body">PIN de acesso ao painel administrativo</p>
              </div>
            </div>
            {msg && <p className="text-xs font-body text-center text-gold-dark">{msg}</p>}
            <button onClick={handleSaveSettings} disabled={loading} className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md mt-2 disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar Configurações"}
            </button>
          </>
        )}

        {view === "clients" && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gold" />
              <h3 className="font-display text-lg text-foreground">Clientes</h3>
              <span className="ml-auto text-xs text-muted-foreground font-body">{clients.length}</span>
            </div>
            {clients.length === 0 && <p className="text-center text-sm text-muted-foreground font-body py-12">Nenhuma cliente cadastrada ainda.</p>}
            {clients.map((c, i) => {
              const validated = c.referrals.filter(r => r.validated).length;
              return (
                <button key={c.id} onClick={() => { setSelected(c); setView("detail"); }} className="w-full text-left p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center gap-3" style={{ animation: `float-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms forwards`, opacity: 0 }}>
                  <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shrink-0"><Diamond className="w-4 h-4 text-primary-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{validated}/5 validadas</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </>
        )}

        {view === "detail" && selected && (
          <>
            <button onClick={() => setView("clients")} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
            <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground font-body">{selected.phone}</p>
                  <p className="text-xs text-muted-foreground font-body">Código: {selected.referralCode}</p>
                </div>
                <button onClick={() => handleDeleteClient(selected.id)} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors active:scale-95">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-body font-medium text-sm">Indicações</h4>
              {selected.referrals.length < 5 && (
                <button onClick={() => setView("addReferral")} className="flex items-center gap-1.5 text-xs font-body font-medium text-gold active:scale-95 transition-transform">
                  <UserPlus className="w-3.5 h-3.5" />Adicionar
                </button>
              )}
            </div>
            {selected.referrals.length === 0 && <p className="text-xs text-muted-foreground font-body text-center py-6">Nenhuma indicação registrada.</p>}
            {selected.referrals.map((ref) => (
              <div key={ref.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium truncate">{ref.friendName}</p>
                  <p className="text-xs text-muted-foreground font-body">{ref.friendPhone}</p>
                </div>
                {ref.validated ? (
                  <span className="text-[10px] tracking-wider uppercase font-body font-medium px-2.5 py-1 rounded-full bg-gold-light/20 text-gold-dark">Validada</span>
                ) : (
                  <button onClick={() => handleValidate(ref.id)} className="flex items-center gap-1 text-xs font-body font-medium px-3 py-1.5 rounded-full gradient-gold text-primary-foreground active:scale-95 transition-transform shadow-sm">
                    <Check className="w-3 h-3" />Validar
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {view === "addReferral" && selected && (
          <>
            <button onClick={() => { setView("detail"); setMsg(""); }} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
            <h3 className="font-display text-lg">Nova Indicação</h3>
            <p className="text-xs text-muted-foreground font-body">Para: {selected.name}</p>
            <div className="space-y-3 mt-4">
              <input type="text" placeholder="Nome da amiga indicada" value={friendName} onChange={(e) => setFriendName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
              <input type="tel" placeholder="Telefone da amiga" value={friendPhone} onChange={(e) => setFriendPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
            </div>
            {msg && <p className={`text-xs font-body text-center ${msg.includes("!") ? "text-gold-dark" : "text-destructive"}`}>{msg}</p>}
            <button onClick={handleAddReferral} disabled={loading} className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md mt-2 disabled:opacity-50">
              {loading ? "Registrando..." : "Registrar Indicação"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
