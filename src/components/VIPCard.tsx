import { Diamond } from "lucide-react";
import type { Client } from "@/lib/store";
import { getValidatedCount } from "@/lib/store";

interface VIPCardProps {
  client: Client;
}

export function VIPCard({ client }: VIPCardProps) {
  const validated = getValidatedCount(client);
  const total = 5;
  const progress = (validated / total) * 100;

  return (
    <div className="relative rounded-2xl overflow-hidden gradient-gold p-[1px]">
      <div className="rounded-2xl bg-card p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">
            Cartão VIP
          </p>
          <h3 className="font-display text-xl text-gold-dark">{client.name}</h3>
          <p className="text-xs text-muted-foreground font-body">
            Código: {client.referralCode}
          </p>
        </div>

        {/* Jewel markers */}
        <div className="flex justify-center items-center gap-4">
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < validated;
            return (
              <div
                key={i}
                className="relative flex items-center justify-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    filled
                      ? "gradient-gold shadow-[0_0_16px_hsla(38,45%,55%,0.4)]"
                      : "border-2 border-dashed border-gold-light/40 bg-muted/30"
                  }`}
                  style={filled ? { animation: "jewel-fill 0.5s cubic-bezier(0.16,1,0.3,1) forwards" } : {}}
                >
                  <Diamond
                    className={`w-4 h-4 transition-colors duration-300 ${
                      filled ? "text-primary-foreground" : "text-gold-light/40"
                    }`}
                  />
                </div>
                {filled && (
                  <div
                    className="absolute w-2 h-2 rounded-full bg-gold-light animate-sparkle"
                    style={{
                      top: -2,
                      right: -2,
                      animationDelay: `${i * 200}ms`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-body">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-gold-dark font-medium">{validated}/{total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-gold transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, animation: "progress-fill 1s ease-out" }}
            />
          </div>
        </div>

        {/* Status */}
        <p className="text-center text-xs font-body text-muted-foreground">
          {validated >= total
            ? "🎉 Parabéns! Você desbloqueou sua recompensa!"
            : `Faltam ${total - validated} indicações para sua recompensa`}
        </p>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer pointer-events-none rounded-2xl" />
    </div>
  );
}
