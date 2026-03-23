import { Diamond, ChevronRight, Users } from "lucide-react";
import type { Client } from "@/lib/store";

interface Props {
  clients: Client[];
  onSelect: (client: Client) => void;
  onBack: () => void;
}

export function AdminClientList({ clients, onSelect, onBack }: Props) {
  return (
    <>
      <button onClick={onBack} className="text-xs text-gold font-body font-medium mb-2 active:scale-95 transition-transform">← Voltar</button>
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-gold" />
        <h3 className="font-display text-lg text-foreground">Clientes</h3>
        <span className="ml-auto text-xs text-muted-foreground font-body">{clients.length}</span>
      </div>
      {clients.length === 0 && <p className="text-center text-sm text-muted-foreground font-body py-12">Nenhuma cliente cadastrada ainda.</p>}
      {clients.map((c, i) => {
        const validated = c.referrals.filter(r => r.validated).length;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="w-full text-left p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center gap-3"
            style={{ animation: `float-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms forwards`, opacity: 0 }}
          >
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shrink-0">
              <Diamond className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground font-body">{validated}/5 validadas</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        );
      })}
    </>
  );
}
