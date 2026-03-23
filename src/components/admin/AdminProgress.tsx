import { BarChart3, Diamond } from "lucide-react";
import type { Client } from "@/lib/store";

interface Props {
  clients: Client[];
  onBack: () => void;
}

export function AdminProgress({ clients, onBack }: Props) {
  const sorted = [...clients].sort((a, b) => {
    const aV = a.referrals.filter(r => r.validated).length;
    const bV = b.referrals.filter(r => r.validated).length;
    return bV - aV;
  });

  return (
    <>
      <button onClick={onBack} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
      <h3 className="font-display text-lg flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-blue-400" />Progresso das Indicações
      </h3>

      {sorted.length === 0 && <p className="text-center text-sm text-muted-foreground font-body py-12">Nenhuma cliente cadastrada.</p>}

      {sorted.map((c, i) => {
        const validated = c.referrals.filter(r => r.validated).length;
        const total = c.referrals.length;
        const pct = (validated / 5) * 100;
        const completed = validated >= 5;

        return (
          <div
            key={c.id}
            className={`p-4 rounded-xl border shadow-sm space-y-2 ${completed ? "bg-gold-light/10 border-gold/30" : "bg-card border-border/50"}`}
            style={{ animation: `float-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms forwards`, opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {completed && <Diamond className="w-3.5 h-3.5 text-gold" />}
                <p className="font-body font-medium text-sm">{c.name}</p>
              </div>
              <span className="text-xs font-body text-muted-foreground">{validated}/5</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full gradient-gold transition-all duration-500"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground font-body">
              <span>{total} indicação(ões) total</span>
              {completed && <span className="text-gold-dark font-medium">✨ Completo!</span>}
            </div>
          </div>
        );
      })}
    </>
  );
}
