import { Sparkles, Crown } from "lucide-react";

export function RewardCelebration({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/60 backdrop-blur-sm">
      <div
        className="relative mx-4 max-w-sm w-full rounded-3xl bg-card p-8 text-center space-y-6 shadow-2xl"
        style={{ animation: "celebrate 0.8s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >
        {/* Sparkle decorations */}
        {[...Array(6)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute w-4 h-4 text-gold-light animate-sparkle"
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 250}ms`,
            }}
          />
        ))}

        <div className="w-20 h-20 mx-auto rounded-full gradient-gold flex items-center justify-center shadow-[0_0_32px_hsla(38,45%,55%,0.5)]">
          <Crown className="w-9 h-9 text-primary-foreground" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl text-foreground">Parabéns!</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Você completou todas as 5 indicações e desbloqueou seu procedimento gratuito! 🎉
          </p>
        </div>

        <div className="p-4 rounded-xl bg-rose-soft border border-gold-light/30">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-dark font-body font-medium">
            Sua recompensa
          </p>
          <p className="font-display text-lg text-foreground mt-1">
            Procedimento Premium Gratuito
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
        >
          Maravilha!
        </button>
      </div>
    </div>
  );
}
