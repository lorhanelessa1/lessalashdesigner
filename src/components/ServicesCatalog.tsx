import { FileText, ExternalLink } from "lucide-react";
import { getSettings } from "@/lib/store";

export function ServicesCatalog() {
  const settings = getSettings();
  const hasCatalog = !!settings.catalogPdfUrl;

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h3 className="font-display text-xl text-foreground">Nossos Serviços</h3>
        <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
          Conheça nossos procedimentos premium e escolha o ideal para você
        </p>
      </div>

      {hasCatalog ? (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm glow-gold">
            <div className="w-14 h-14 mx-auto rounded-xl gradient-rose-gold flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="font-display text-lg text-foreground mb-1">Catálogo de Serviços</p>
            <p className="text-xs text-muted-foreground font-body mb-4">
              Toque para visualizar nosso catálogo completo
            </p>
            <a
              href={settings.catalogPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Catálogo
            </a>
          </div>
        </div>
      ) : (
        <div className="py-12 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-xl bg-muted/50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-display text-lg text-muted-foreground">Em breve</p>
          <p className="text-xs text-muted-foreground font-body">
            O catálogo de serviços será disponibilizado em breve
          </p>
        </div>
      )}
    </div>
  );
}
