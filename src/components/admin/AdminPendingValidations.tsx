import { Check } from "lucide-react";
import type { Client } from "@/lib/store";

interface Props {
  clients: Client[];
  onValidate: (clientId: string, referralId: string) => void;
  onBack: () => void;
}

export function AdminPendingValidations({ clients, onValidate, onBack }: Props) {
  const pendingClients = clients
    .map(c => ({
      ...c,
      pendingReferrals: c.referrals.filter(r => !r.validated),
    }))
    .filter(c => c.pendingReferrals.length > 0);

  return (
    <>
      <button onClick={onBack} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
      <h3 className="font-display text-lg flex items-center gap-2">
        <Check className="w-4 h-4 text-amber-500" />Validar Indicações
      </h3>

      {pendingClients.length === 0 && (
        <p className="text-center text-sm text-muted-foreground font-body py-12">Nenhuma indicação pendente.</p>
      )}

      {pendingClients.map((client) => (
        <div key={client.id} className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-3">
          <p className="font-body font-medium text-sm">{client.name}</p>
          {client.pendingReferrals.map((ref) => (
            <div key={ref.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium truncate">{ref.friendName}</p>
                <p className="text-xs text-muted-foreground font-body">{ref.friendPhone}</p>
              </div>
              <button
                onClick={() => onValidate(client.id, ref.id)}
                className="flex items-center gap-1 text-xs font-body font-medium px-3 py-1.5 rounded-full gradient-gold text-primary-foreground active:scale-95 transition-transform shadow-sm"
              >
                <Check className="w-3 h-3" />Validar
              </button>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
