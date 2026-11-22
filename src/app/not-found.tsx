import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4 text-center text-text">
      <div>
        <h1 className="text-3xl font-bold">Página no encontrada</h1>
        <p className="mt-2 text-sm text-muted">Esta página no existe o ya cambió de lugar.</p>
        <Link href="/" className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-brand px-6 text-sm font-semibold text-surface">
          Ir al menú
        </Link>
      </div>
    </main>
  );
}
