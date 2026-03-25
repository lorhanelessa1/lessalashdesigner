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
        className={`mx-auto object-contain ${isLg ? "w-32 h-32" : "w-14 h-14"}`}
      />

      {isLg && (
        <div>
          <h1 className="font-display text-3xl text-foreground leading-tight">Programa VIP</h1>
        </div>
      )}
    </div>
  );
}
