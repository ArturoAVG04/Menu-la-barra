import Link from "next/link";

/** Enlaces legales al final del menú. */
export function LegalFooter() {
  return (
    <footer className="pt-4 text-center text-xs text-muted">
      <Link href="/privacidad" className="underline-offset-2 hover:underline">
        Aviso de privacidad
      </Link>
      <span aria-hidden="true"> · </span>
      <Link href="/terminos" className="underline-offset-2 hover:underline">
        Términos
      </Link>
    </footer>
  );
}
