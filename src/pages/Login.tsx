import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Sparkles, ArrowLeft } from "lucide-react";
import { signIn, signUp, verifyAdminPin } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import loginBgMobile from "@/assets/login-bg-mobile.jpg";
import loginBgTablet from "@/assets/login-bg-tablet.jpg";
import loginBgDesktop from "@/assets/login-bg-desktop.jpg";
import { BrandHeader } from "@/components/BrandHeader";
import { ServicesCatalog } from "@/components/ServicesCatalog";
import loginBg from "@/assets/login-bg.png";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "services" | "forgot">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) navigate("/dashboard");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/dashboard");
    });
  }, [navigate]);

  // Use phone as email for Supabase auth (phone@lashvip.app)
  const phoneToEmail = (p: string) => `${p.replace(/\D/g, "")}@lashvip.app`;

  const handleLogin = async () => {
    setError("");
    if (!phone.trim() || !password.trim()) {
      setError("Preencha celular e senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(phoneToEmail(phone), password);
    } catch (e: any) {
      const message = e.message || "";
      setError(message === "Invalid login credentials" ? "Celular ou senha inválidos." : message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!phone.trim() || !password.trim()) {
      setError("Preencha celular e senha.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const fallbackName = name.trim() || phone;

    setLoading(true);
    try {
      await signUp(phoneToEmail(phone), password, fallbackName, phone);
    } catch (e: any) {
      const message = e.message || "";

      if (message.includes("already registered")) {
        try {
          await signIn(phoneToEmail(phone), password);
          return;
        } catch {
          setError("Este celular já está cadastrado. Tente entrar com sua senha.");
          return;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmin = async () => {
    setError("");
    setLoading(true);
    try {
      const valid = await verifyAdminPin(pin.trim());
      if (!valid) {
        setError("PIN inválido.");
        return;
      }
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-bg {
          background-image: url('${loginBgMobile}');
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .login-bg {
            background-image: url('${loginBgTablet}');
          }
        }
        @media (min-width: 1024px) {
          .login-bg {
            background-image: url('${loginBgDesktop}');
          }
        }
      `}</style>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-background relative bg-no-repeat bg-cover bg-center login-bg"
      >
      {/* Sophisticated luxury overlay for legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsla(350, 45%, 95%, 0.35) 0%, hsla(350, 40%, 92%, 0.6) 45%, hsla(350, 35%, 88%, 0.85) 100%), linear-gradient(180deg, hsla(38, 45%, 55%, 0.08) 0%, transparent 30%, transparent 70%, hsla(0, 0%, 8%, 0.15) 100%)",
        }}
      />
      <button
        onClick={() => setShowAdmin(true)}
        className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      <div style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }} className="mb-10">
        <BrandHeader size="lg" />
      </div>

      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-4" style={{ animation: "float-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <h3 className="font-display text-lg text-center">Acesso Admin</h3>
            <input type="password" placeholder="PIN da administradora" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
            {error && showAdmin && <p className="text-xs text-destructive font-body text-center">{error}</p>}
            <button onClick={handleAdmin} disabled={loading} className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50">
              {loading ? "Verificando..." : "Acessar Painel"}
            </button>
            <button onClick={() => { setShowAdmin(false); setError(""); setPin(""); }} className="w-full py-2 text-xs text-muted-foreground font-body">Cancelar</button>
          </div>
        </div>
      )}

      {mode === "forgot" ? (
        <div className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-5" style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}>
          <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="flex items-center gap-1 text-xs text-gold font-body font-medium active:scale-95 transition-transform">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <div className="text-center space-y-1">
            <h3 className="font-display text-lg">Recuperar Senha</h3>
            <p className="text-xs text-muted-foreground font-body">Digite seu celular para recuperar o acesso</p>
          </div>
          <input type="tel" placeholder="Seu celular" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
          {error && <p className="text-xs text-destructive font-body text-center">{error}</p>}
          {success && <p className="text-xs text-gold-dark font-body text-center">{success}</p>}
          <button
            onClick={async () => {
              setError(""); setSuccess("");
              if (!phone.trim()) { setError("Digite seu celular."); return; }
              setLoading(true);
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(phoneToEmail(phone), {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                setSuccess("Procure a administradora para redefinir sua senha.");
              } catch (e: any) { setError(e.message); } finally { setLoading(false); }
            }}
            disabled={loading}
            className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Recuperar Senha"}
          </button>
        </div>
      ) : mode === "services" ? (
        <div className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-5" style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}>
          <button onClick={() => setMode("login")} className="text-xs text-gold font-body font-medium active:scale-95 transition-transform">← Voltar</button>
          <ServicesCatalog />
        </div>
      ) : (
        <div className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-5" style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}>
          <div className="flex gap-1 p-1 rounded-full bg-muted/50">
            {([
              { key: "login" as const, label: "Entrar" },
              { key: "register" as const, label: "Cadastrar" },
              { key: "services" as const, label: "Serviços" },
            ]).map((m) => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); setError(""); setSuccess(""); }}
                className={`flex-1 text-xs font-body font-medium py-2 rounded-full transition-all duration-200 ${
                  mode === m.key ? "gradient-gold text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.key === "services" ? (
                  <span className="flex items-center justify-center gap-1"><Sparkles className="w-3 h-3" />{m.label}</span>
                ) : m.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === "register" && (
              <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
            )}
            <input type="tel" placeholder="Seu celular" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow" />
          </div>

          {error && !showAdmin && <p className="text-xs text-destructive font-body text-center">{error}</p>}
          {success && <p className="text-xs text-gold-dark font-body text-center">{success}</p>}

          <button onClick={mode === "login" ? handleLogin : handleRegister} disabled={loading} className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50">
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar Conta"}
          </button>

          {mode === "login" && (
            <button onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} className="w-full text-xs text-muted-foreground font-body hover:text-gold transition-colors">
              Esqueci minha senha
            </button>
          )}
        </div>
      )}

      <p className="mt-8 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-body" style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 200ms forwards", opacity: 0 }}>
        Exclusivo para clientes VIP
      </p>
      </div>
    </div>
    </>
  );
}
