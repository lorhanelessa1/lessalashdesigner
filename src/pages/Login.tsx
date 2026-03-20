import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Diamond } from "lucide-react";
import { getClientByPhone, createClient, setSession, verifyAdminPin } from "@/lib/store";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "admin">("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      {/* Logo area */}
      <div
        className="text-center space-y-4 mb-10"
        style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl gradient-gold flex items-center justify-center shadow-lg">
          <Diamond className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-foreground leading-tight">Lash VIP</h1>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mt-1">
            Programa de Indicações
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl bg-card border border-border/50 shadow-xl p-6 space-y-5"
        style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 100ms forwards", opacity: 0 }}
      >
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-full bg-muted/50">
          {(["login", "register", "admin"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 text-xs font-body font-medium py-2 rounded-full transition-all duration-200 ${
                mode === m
                  ? "gradient-gold text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Entrar" : m === "register" ? "Cadastrar" : "Admin"}
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

          {mode !== "admin" && (
            <>
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
            </>
          )}

          {mode === "admin" && (
            <input
              type="password"
              placeholder="PIN da administradora"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold-light/50 transition-shadow"
            />
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive font-body text-center">{error}</p>
        )}

        <button
          onClick={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleAdmin}
          className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          {mode === "login" ? "Entrar" : mode === "register" ? "Criar Conta" : "Acessar Painel"}
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
