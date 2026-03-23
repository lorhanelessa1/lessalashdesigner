import { Check, UserPlus, Trash2 } from "lucide-react";
import type { Client } from "@/lib/store";

interface Props {
  client: Client;
  onValidate: (referralId: string) => void;
  onDelete: (clientId: string) => void;
  onAddReferral: () => void;
  onBack: () => void;
}

export function AdminClientDetail({ client, onValidate, onDelete, onAddReferral, onBack }: Props) {
  return (
    <>
      <button onClick={onBack} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
      <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg">{client.name}</h3>
            <p className="text-xs text-muted-foreground font-body">{client.phone}</p>
            {client.email && <p className="text-xs text-muted-foreground font-body">{client.email}</p>}
            <p className="text-xs text-muted-foreground font-body">Código: {client.referralCode}</p>
          </div>
          <button
            onClick={() => onDelete(client.id)}
            className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="font-body font-medium text-sm">Indicações ({client.referrals.filter(r => r.validated).length}/5 validadas)</h4>
        {client.referrals.length < 5 && (
          <button onClick={onAddReferral} className="flex items-center gap-1.5 text-xs font-body font-medium text-gold active:scale-95 transition-transform">
            <UserPlus className="w-3.5 h-3.5" />Adicionar
          </button>
        )}
      </div>

      {client.referrals.length === 0 && <p className="text-xs text-muted-foreground font-body text-center py-6">Nenhuma indicação registrada.</p>}

      {client.referrals.map((ref) => (
        <div key={ref.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-medium truncate">{ref.friendName}</p>
            <p className="text-xs text-muted-foreground font-body">{ref.friendPhone}</p>
          </div>
          {ref.validated ? (
            <span className="text-[10px] tracking-wider uppercase font-body font-medium px-2.5 py-1 rounded-full bg-gold-light/20 text-gold-dark">Validada</span>
          ) : (
            <button
              onClick={() => onValidate(ref.id)}
              className="flex items-center gap-1 text-xs font-body font-medium px-3 py-1.5 rounded-full gradient-gold text-primary-foreground active:scale-95 transition-transform shadow-sm"
            >
              <Check className="w-3 h-3" />Validar
            </button>
          )}
        </div>
      ))}
    </>
  );
}
