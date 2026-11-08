import { Instagram } from "lucide-react";

import { WhatsAppLogo } from "@/features/customer/components/WhatsAppLogo";

type SocialLinksProps = { whatsappHref: string | null; instagramHref: string | null };

/** Botones de WhatsApp e Instagram (redondos en móvil, con texto en escritorio). */
export function SocialLinks({ whatsappHref, instagramHref }: SocialLinksProps) {
  return (
    <div className="flex gap-2.5">
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#25D366]/30 bg-[#25D366] text-white shadow-glow md:hidden"
          aria-label="Enviar mensaje por WhatsApp"
        >
          <WhatsAppLogo className="h-7 w-7" />
        </a>
      )}

      {instagramHref && (
        <a
          href={instagramHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-pink-500/30 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-glow md:hidden"
          aria-label="Seguir en Instagram"
        >
          <Instagram size={28} />
        </a>
      )}

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="hidden min-h-[56px] items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-glow md:inline-flex"
        >
          <WhatsAppLogo className="h-5 w-5" />
          WhatsApp
        </a>
      )}

      {instagramHref && (
        <a
          href={instagramHref}
          target="_blank"
          rel="noreferrer"
          className="hidden min-h-[56px] items-center justify-center gap-2 rounded-full border border-pink-500/30 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-6 py-3 text-sm font-semibold text-white shadow-glow md:inline-flex"
        >
          <Instagram size={18} />
          Instagram
        </a>
      )}
    </div>
  );
}
