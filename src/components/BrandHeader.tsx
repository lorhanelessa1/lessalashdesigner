import logo from "@/assets/logo.png";

interface BrandHeaderProps {
  size?: "sm" | "lg";
}

export function BrandHeader({ size = "lg" }: BrandHeaderProps) {
  const isLg = size === "lg";

  return (
    <div className="text-center space-y-3">
      <img
        src={logo}
        alt="Lessa Lash Designer"
        className={`mx-auto object-contain ${isLg ? "w-40 h-40" : "w-12 h-12"}`}
      />

      {isLg && (
        <div>
          <h1 className="font-display text-3xl text-foreground leading-tight">Programa VIP</h1>
        </div>
      )}
    </div>
  );
}
