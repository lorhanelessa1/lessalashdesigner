import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAdminPin } from "@/lib/store";

interface AdminHeaderProps {
  view: string;
  onSettingsClick: () => void;
}

export function AdminHeader({ view, onSettingsClick }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="px-6 pt-6 pb-4 flex items-center justify-between">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">Painel</p>
        <h2 className="font-display text-xl text-foreground">Administradora</h2>
        <p className="text-[9px] tracking-[0.15em] text-gold font-body mt-0.5">Lessa Lash Designer</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSettingsClick}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
            view === "settings" ? "bg-gold/20 text-gold" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => { clearAdminPin(); localStorage.removeItem("lash_admin"); navigate("/"); }}
          className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
