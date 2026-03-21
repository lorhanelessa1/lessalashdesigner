import { MessageCircle } from "lucide-react";
import type { Client } from "@/lib/store";
import { getSettings } from "@/lib/store";

interface WhatsAppShareProps {
  client: Client;
}

export function WhatsAppShare({ client }: WhatsAppShareProps) {
  const settings = getSettings();
  const whatsappNumber = settings.whatsappNumber.replace(/\D/g, "");

  const message = encodeURIComponent(
    `Oi, amiga! 💕 Preciso te indicar uma lash designer incrível! Atendimento impecável e resultados perfeitos ✨ Fala com ela aqui: https://wa.me/${whatsappNumber}\n\nMeu código VIP: ${client.referralCode}`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h3 className="font-display text-xl text-foreground">Indique uma Amiga</h3>
        <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
          Compartilhe pelo WhatsApp e ganhe benefícios quando sua amiga agendar
        </p>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-body font-medium text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, hsl(142 70% 40%), hsl(142 70% 35%))",
          color: "white",
        }}
      >
        <MessageCircle className="w-5 h-5" />
        Convidar pelo WhatsApp
      </a>

      <div className="pt-4 border-t border-border/50">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2">
          Seu código exclusivo
        </p>
        <div className="inline-block px-5 py-2.5 rounded-lg bg-muted/50 border border-gold-light/30">
          <span className="font-display text-lg tracking-widest text-gold-dark">
            {client.referralCode}
          </span>
        </div>
      </div>
    </div>
  );
}
