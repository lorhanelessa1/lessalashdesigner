import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { getClientByPhone, createClient, setSession, verifyAdminPin } from "@/lib/store";
import { BrandHeader } from "@/components/BrandHeader";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    const client = getClientByPhone(phone);
    if (!client) {
      setError("Telefone não encontrado. Crie sua conta.");
      return;
    }
    setSession(client.id, false);
    navigate("/dashboard");
  };

  const handleRegister = () => {
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (getClientByPhone(phone)) {
      setError("Este telefone já está cadastrado.");
      return;
    }
    const client = createClient(name, phone, email);
    setSession(client.id, false);
    navigate("/dashboard");
  };

  const handleAdmin = () => {
    setError("");
    if (!verifyAdminPin(pin)) {
      setError("PIN inválido.");
      return;
    }
    setSession("admin", true);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background relative">
      {/* Admin icon - top right, discrete */}
      <button
        onClick={() => setShowAdmin(true)}
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {/* Brand */}
      <div style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }} className="mb-10">
        <BrandHeader size="lg" />
      </div>

      {/* Admin modal */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/60 backdrop-blur-sm px-6">
          <div
            className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-4"
            style={{ animation: "float-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <h3 className="font-display text-lg text-center">Acesso Admin</h3>
            <input
              type="password"
              placeholder="PIN da administradora"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
            />
            {error && showAdmin && (
              <p className="text-xs text-destructive font-body text-center">{error}</p>
            )}
            <button
              onClick={handleAdmin}
              className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Acessar Painel
            </button>
            <button
              onClick={() => { setShowAdmin(false); setError(""); setPin(""); }}
              className="w-full py-2 text-xs text-muted-foreground font-body"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-5"
        style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}
      >
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-full bg-muted/50">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 text-xs font-body font-medium py-2 rounded-full transition-all duration-200 ${
                mode === m
                  ? "gradient-gold text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
            />
          )}

          <input
            type="tel"
            placeholder="Seu telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
          />

          {mode === "register" && (
            <input
              type="email"
              placeholder="E-mail (opcional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
            />
          )}
        </div>

        {error && !showAdmin && (
          <p className="text-xs text-destructive font-body text-center">{error}</p>
        )}

        <button
          onClick={mode === "login" ? handleLogin : handleRegister}
          className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          {mode === "login" ? "Entrar" : "Criar Conta"}
        </button>
      </div>

      <p
        className="mt-8 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-body"
        style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 200ms forwards", opacity: 0 }}
      >
        Exclusivo para clientes VIP
      </p>
    </div>
  );
}
