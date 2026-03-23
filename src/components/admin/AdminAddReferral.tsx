import { useState } from "react";
import { addReferral, type Client } from "@/lib/store";

interface Props {
  client: Client;
  onBack: () => void;
  onAdded: () => void;
}

export function AdminAddReferral({ client, onBack, onAdded }: Props) {
  const [friendName, setFriendName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleAdd = async () => {
    if (!friendName.trim() || !friendPhone.trim()) {
      setMsg("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const r = await addReferral(client.id, friendName, friendPhone);
      if (!r) { setMsg("Limite de indicações atingido."); return; }
      setFriendName(""); setFriendPhone("");
      setMsg("Indicação adicionada!");
      onAdded();
      setTimeout(() => setMsg(""), 2000);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={onBack} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
      <h3 className="font-display text-lg">Nova Indicação</h3>
      <p className="text-xs text-muted-foreground font-body">Para: {client.name}</p>
      <div className="space-y-3 mt-4">
        <input type="text" placeholder="Nome da amiga indicada" value={friendName} onChange={(e) => setFriendName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
        <input type="tel" placeholder="Telefone da amiga" value={friendPhone} onChange={(e) => setFriendPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
      </div>
      {msg && <p className={`text-xs font-body text-center ${msg.includes("!") ? "text-gold-dark" : "text-destructive"}`}>{msg}</p>}
      <button onClick={handleAdd} disabled={loading} className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md mt-2 disabled:opacity-50">
        {loading ? "Registrando..." : "Registrar Indicação"}
      </button>
    </>
  );
}
