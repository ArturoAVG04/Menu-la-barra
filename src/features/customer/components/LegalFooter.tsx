import Link from "next/link";

/** Enlaces legales al final del menú. */
export function LegalFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-2 pt-4 text-center text-sm text-muted">
      <Link href="/privacidad" className="inline-flex min-h-11 items-center px-2 underline underline-offset-2">
        Aviso de privacidad
      </Link>
      <span aria-hidden="true"> · </span>
      <Link href="/terminos" className="inline-flex min-h-11 items-center px-2 underline underline-offset-2">
        Términos
      </Link>
    </footer>
  );
}
