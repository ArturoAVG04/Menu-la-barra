import type { PublicMenuSection } from "@/lib/server/publicMenu";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

/** Presentación y menú en HTML del servidor (lo que lee Google). Visible, al final de la página. */
export function MenuIntro({ sections }: { sections: PublicMenuSection[] }) {
  return (
    <section className="mt-6 rounded-shell border border-line bg-panel p-5 text-text md:p-6" aria-labelledby="la-barra-titulo">
      <h1 id="la-barra-titulo" className="text-xl font-semibold md:text-2xl">
        La Barra: hamburguesas, alitas y snacks en Guanajuato
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Hamburguesas, alitas, boneless, papas y snacks en Guanajuato capital. Estamos en la Universidad entre semana
        y en la combi de La Presa los fines de semana. Pide por WhatsApp o desde este menú.
      </p>
      <p className="mt-2 text-sm text-muted">Lunes a viernes 3:00 a 9:00 pm · sábado 1:00 a 9:00 pm · domingo 1:00 a 7:00 pm.</p>

      {sections.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-base font-semibold">{section.name}</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {section.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 border-b border-line/60 pb-1">
                    <span>{item.name}</span>
                    <span className="shrink-0 text-muted">{money.format(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
