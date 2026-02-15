import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--color-content-muted)] mb-4">404</h1>
        <p className="text-lg text-[var(--color-content-muted)] mb-6">
          Documento não encontrado
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
