import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BrandHeader } from "@/components/BrandHeader";
import { KeyRound } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via recovery link — stay on this page
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    setError("");
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="text-center space-y-4" style={{ animation: "celebrate 0.8s cubic-bezier(0.16,1,0.3,1) forwards" }}>
          <div className="w-16 h-16 mx-auto rounded-full gradient-gold flex items-center justify-center shadow-lg">
            <KeyRound className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl text-foreground">Senha atualizada!</h2>
          <p className="text-sm text-muted-foreground font-body">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="mb-10" style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }}>
        <BrandHeader size="lg" />
      </div>

      <div
        className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-5"
        style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}
      >
        <div className="text-center space-y-1">
          <h3 className="font-display text-lg">Nova Senha</h3>
          <p className="text-xs text-muted-foreground font-body">Digite sua nova senha abaixo</p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
          />
        </div>

        {error && <p className="text-xs text-destructive font-body text-center">{error}</p>}

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50"
        >
          {loading ? "Atualizando..." : "Atualizar Senha"}
        </button>
      </div>

      <p className="mt-8 text-[9px] tracking-[0.15em] text-gold/60 font-body">
        Criado por Lessa Lash Designer
      </p>
    </div>
  );
}
