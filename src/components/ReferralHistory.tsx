import { Check, Clock } from "lucide-react";
import type { Referral } from "@/lib/store";

interface ReferralHistoryProps {
  referrals: Referral[];
}

export function ReferralHistory({ referrals }: ReferralHistoryProps) {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="font-display text-lg text-muted-foreground">Nenhuma indicação ainda</p>
        <p className="text-sm text-muted-foreground font-body">
          Comece indicando amigas e ganhe benefícios exclusivos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {referrals.map((ref, i) => (
        <div
          key={ref.id}
          className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm transition-shadow duration-200 hover:shadow-md"
          style={{ animation: `float-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms forwards`, opacity: 0 }}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              ref.validated ? "gradient-gold" : "bg-muted"
            }`}
          >
            {ref.validated ? (
              <Check className="w-4 h-4 text-primary-foreground" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-medium text-sm truncate">{ref.friendName}</p>
            <p className="text-xs text-muted-foreground font-body">{ref.friendPhone}</p>
          </div>
          <span
            className={`text-[10px] tracking-wider uppercase font-body font-medium px-2.5 py-1 rounded-full ${
              ref.validated
                ? "bg-gold-light/20 text-gold-dark"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {ref.validated ? "Validada" : "Pendente"}
          </span>
        </div>
      ))}
    </div>
  );
}
