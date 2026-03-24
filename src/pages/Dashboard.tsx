import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Diamond, Heart, Send, Clock, Sparkles } from "lucide-react";
import { signOut, getClientByUserId, getValidatedCount, type Client } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { VIPCard } from "@/components/VIPCard";
import { ReferralHistory } from "@/components/ReferralHistory";
import { WhatsAppShare } from "@/components/WhatsAppShare";
import { ServicesCatalog } from "@/components/ServicesCatalog";
import { RewardCelebration } from "@/components/RewardCelebration";

type Tab = "card" | "history" | "invite" | "services";

export default function Dashboard() {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [tab, setTab] = useState<Tab>("card");
  const [showReward, setShowReward] = useState(false);
  const [newlyValidated, setNewlyValidated] = useState<string[]>([]);

  const refreshClient = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/"); return; }
    const c = await getClientByUserId(user.id);
    if (!c) { navigate("/"); return; }
    setClient(prev => {
      // Track newly validated for animation
      if (prev) {
        const prevValidated = prev.referrals.filter(r => r.validated).map(r => r.id);
        const newValidated = c.referrals.filter(r => r.validated && !prevValidated.includes(r.id));
        if (newValidated.length > 0) {
          setNewlyValidated(newValidated.map(r => r.id));
          setTimeout(() => setNewlyValidated([]), 2000);
        }
      }
      return c;
    });
    if (getValidatedCount(c) >= 5) setShowReward(true);
  };

  useEffect(() => {
    refreshClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/");
    });

    // Realtime: listen for referral changes
    const channel = supabase
      .channel('client-referrals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => {
        refreshClient();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  if (!client) return null;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "card", label: "Cartão VIP", icon: Diamond },
    { key: "history", label: "Indicações", icon: Clock },
    { key: "invite", label: "Indicar", icon: Send },
    { key: "services", label: "Serviços", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showReward && <RewardCelebration onClose={() => setShowReward(false)} />}

      <header className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div style={{ animation: "float-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Bem-vinda</p>
          <h2 className="font-display text-xl text-foreground">{client.name}</h2>
        </div>
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 active:scale-95"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="flex-1 px-6 pb-24 space-y-6">
        <div style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 80ms forwards", opacity: 0 }}>
          {tab === "card" && <VIPCard client={client} newlyValidated={newlyValidated} />}
          {tab === "history" && <ReferralHistory referrals={client.referrals} />}
          {tab === "invite" && <WhatsAppShare client={client} />}
          {tab === "services" && <ServicesCatalog />}
        </div>

        {tab === "card" && (
          <div
            className="p-5 rounded-xl bg-rose-soft border border-gold-light/20"
            style={{ animation: "float-up 0.6s cubic-bezier(0.16,1,0.3,1) 160ms forwards", opacity: 0 }}
          >
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">Como funciona</p>
                <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                  Indique 5 amigas e ganhe um procedimento premium gratuito. Cada indicação é validada após o agendamento da sua amiga.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border/50 px-4 py-3">
        <div className="flex justify-around max-w-sm mx-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
                tab === t.key ? "text-gold" : "text-muted-foreground"
              }`}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-[10px] font-body font-medium tracking-wide">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
