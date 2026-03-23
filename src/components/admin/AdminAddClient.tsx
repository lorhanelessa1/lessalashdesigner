import { useState } from "react";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onBack: () => void;
  onClientAdded: () => void;
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function AdminAddClient({ onBack, onClientAdded }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      setMsg("Nome e telefone são obrigatórios.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const { error } = await supabase.from("clients").insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        referral_code: generateCode(),
      });
      if (error) throw error;
      setMsg("Cliente adicionada com sucesso!");
      setName(""); setPhone(""); setEmail("");
      onClientAdded();
      setTimeout(() => setMsg(""), 2000);
    } catch (e: any) {
      setMsg(e.message || "Erro ao adicionar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={onBack} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
      <h3 className="font-display text-lg flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-emerald-500" />Nova Cliente
      </h3>

      <div className="space-y-3 mt-4">
        <input
          type="text" placeholder="Nome da cliente"
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
        />
        <input
          type="tel" placeholder="Telefone"
          value={phone} onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
        />
        <input
          type="email" placeholder="Email (opcional)"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
        />
      </div>

      {msg && <p className={`text-xs font-body text-center ${msg.includes("sucesso") ? "text-gold-dark" : "text-destructive"}`}>{msg}</p>}

      <button
        onClick={handleAdd} disabled={loading}
        className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md mt-2 disabled:opacity-50"
      >
        {loading ? "Cadastrando..." : "Cadastrar Cliente"}
      </button>
    </>
  );
}
