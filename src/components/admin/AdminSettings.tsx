import { useState, useEffect } from "react";
import { Settings, Phone, FileText, Shield } from "lucide-react";
import { getSettings, saveSettings } from "@/lib/store";

interface Props {
  onBack: () => void;
}

export function AdminSettings({ onBack }: Props) {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [catalogUrl, setCatalogUrl] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSettings().then(s => {
      setWhatsappNumber(s.whatsappNumber);
      setCatalogUrl(s.catalogPdfUrl);
      setAdminPin(s.adminPin);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSettings({ whatsappNumber, catalogPdfUrl: catalogUrl, adminPin: adminPin || "1234" });
      setMsg("Configurações salvas!");
      setTimeout(() => setMsg(""), 2000);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={onBack} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
      <h3 className="font-display text-lg flex items-center gap-2"><Settings className="w-4 h-4 text-gold" />Configurações</h3>

      <div className="space-y-4 mt-4">
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /><label className="text-sm font-body font-medium">WhatsApp de Trabalho</label></div>
          <input type="tel" placeholder="5511999999999" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gold" /><label className="text-sm font-body font-medium">Catálogo PDF (URL)</label></div>
          <input type="url" placeholder="https://exemplo.com/catalogo.pdf" value={catalogUrl} onChange={(e) => setCatalogUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /><label className="text-sm font-body font-medium">PIN Admin</label></div>
          <input type="password" placeholder="****" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
        </div>
      </div>

      {msg && <p className="text-xs font-body text-center text-gold-dark">{msg}</p>}

      <button onClick={handleSave} disabled={loading} className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md mt-2 disabled:opacity-50">
        {loading ? "Salvando..." : "Salvar Configurações"}
      </button>
    </>
  );
}
