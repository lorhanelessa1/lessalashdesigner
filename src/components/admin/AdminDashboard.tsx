import { Users, Check, UserPlus, Phone, FileText, BarChart3 } from "lucide-react";
import type { Client } from "@/lib/store";

interface AdminDashboardProps {
  clients: Client[];
  onNavigate: (view: string) => void;
}

export function AdminDashboard({ clients, onNavigate }: AdminDashboardProps) {
  const totalReferrals = clients.reduce((sum, c) => sum + c.referrals.length, 0);
  const validatedReferrals = clients.reduce((sum, c) => sum + c.referrals.filter(r => r.validated).length, 0);
  const pendingReferrals = totalReferrals - validatedReferrals;

  const menuItems = [
    { key: "pending", label: "Validar Indicações", desc: `${pendingReferrals} pendente(s)`, icon: Check, color: "text-amber-500" },
    { key: "clients", label: "Gerenciar Clientes", desc: `${clients.length} cliente(s)`, icon: Users, color: "text-gold" },
    { key: "addClient", label: "Adicionar Cliente", desc: "Cadastrar nova cliente", icon: UserPlus, color: "text-emerald-500" },
    { key: "progress", label: "Controlar Progresso", desc: "Visão geral das indicações", icon: BarChart3, color: "text-blue-400" },
    { key: "settings", label: "Configurações", desc: "WhatsApp e Catálogo PDF", icon: Phone, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Clientes", value: clients.length },
          { label: "Indicações", value: totalReferrals },
          { label: "Validadas", value: validatedReferrals },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-card border border-border/50 text-center"
            style={{ animation: `float-up 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms forwards`, opacity: 0 }}
          >
            <p className="font-display text-lg text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-body tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="w-full text-left p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center gap-3"
            style={{ animation: `float-up 0.5s cubic-bezier(0.16,1,0.3,1) ${(i + 3) * 60}ms forwards`, opacity: 0 }}
          >
            <div className={`w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
