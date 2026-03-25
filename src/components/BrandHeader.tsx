import { Diamond } from "lucide-react";

interface BrandHeaderProps {
  size?: "sm" | "lg";
}

export function BrandHeader({ size = "lg" }: BrandHeaderProps) {
  const isLg = size === "lg";

  return (
    <div className="text-center space-y-3">
      <div
        className={`mx-auto rounded-2xl gradient-gold flex items-center justify-center shadow-lg glow-gold ${
          isLg ? "w-16 h-16" : "w-10 h-10"
        }`}
      >
        <Diamond className={isLg ? "w-7 h-7 text-primary-foreground" : "w-4 h-4 text-primary-foreground"} />
      </div>

      {isLg && (
        <div>
          <h1 className="font-display text-3xl text-foreground leading-tight">Programa VIP</h1>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mt-1">
            Lessa Lash Designer
          </p>
        </div>
      )}
    </div>
  );
}
