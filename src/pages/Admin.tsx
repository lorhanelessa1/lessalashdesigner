import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, validateReferral, deleteClient, getSettings, type Client } from "@/lib/store";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPendingValidations } from "@/components/admin/AdminPendingValidations";
import { AdminClientList } from "@/components/admin/AdminClientList";
import { AdminClientDetail } from "@/components/admin/AdminClientDetail";
import { AdminAddClient } from "@/components/admin/AdminAddClient";
import { AdminAddReferral } from "@/components/admin/AdminAddReferral";
import { AdminProgress } from "@/components/admin/AdminProgress";
import { AdminSettings } from "@/components/admin/AdminSettings";

type View = "dashboard" | "pending" | "clients" | "detail" | "addClient" | "addReferral" | "progress" | "settings";

export default function Admin() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [selected, setSelected] = useState<Client | null>(null);

  const refresh = async () => {
    const c = await getClients();
    setClients(c);
    return c;
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("lash_admin");
    if (!isAdmin) { navigate("/"); return; }
    refresh();
  }, [navigate]);

  const handleValidate = async (clientId: string, referralId: string) => {
    const settings = await getSettings();
    await validateReferral(clientId, referralId, settings.adminPin);
    const updated = await refresh();
    if (selected) setSelected(updated.find(c => c.id === selected.id) || null);
  };

  const handleDelete = async (clientId: string) => {
    if (confirm("Deseja realmente excluir esta cliente?")) {
      await deleteClient(clientId);
      await refresh();
      setSelected(null);
      setView("clients");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader view={view} onSettingsClick={() => setView(view === "settings" ? "dashboard" : "settings")} />

      <main className="flex-1 px-6 pb-8 space-y-4">
        {view === "dashboard" && (
          <AdminDashboard clients={clients} onNavigate={(v) => setView(v as View)} />
        )}

        {view === "pending" && (
          <AdminPendingValidations
            clients={clients}
            onValidate={handleValidate}
            onBack={() => setView("dashboard")}
          />
        )}

        {view === "clients" && (
          <AdminClientList
            clients={clients}
            onSelect={(c) => { setSelected(c); setView("detail"); }}
            onBack={() => setView("dashboard")}
          />
        )}

        {view === "detail" && selected && (
          <AdminClientDetail
            client={selected}
            onValidate={(refId) => handleValidate(selected.id, refId)}
            onDelete={handleDelete}
            onAddReferral={() => setView("addReferral")}
            onBack={() => setView("clients")}
          />
        )}

        {view === "addClient" && (
          <AdminAddClient
            onBack={() => setView("dashboard")}
            onClientAdded={refresh}
          />
        )}

        {view === "addReferral" && selected && (
          <AdminAddReferral
            client={selected}
            onBack={() => setView("detail")}
            onAdded={async () => {
              const updated = await refresh();
              setSelected(updated.find(c => c.id === selected.id) || null);
            }}
          />
        )}

        {view === "progress" && (
          <AdminProgress clients={clients} onBack={() => setView("dashboard")} />
        )}

        {view === "settings" && (
          <AdminSettings onBack={() => setView("dashboard")} />
        )}
      </main>

      <footer className="py-4 text-center">
        <p className="text-[9px] tracking-[0.15em] text-gold/50 font-body">Criado por Lessa Lash Designer</p>
      </footer>
    </div>
  );
}
