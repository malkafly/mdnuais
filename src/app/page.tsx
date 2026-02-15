import { redirect } from "next/navigation";
import { getSidebar } from "@/lib/config";
import { getFirstDocSlug } from "@/lib/navigation";

export default async function Home() {
  const sidebar = await getSidebar();
  const firstSlug = getFirstDocSlug(sidebar.items);

  if (firstSlug) {
    redirect(`/docs/${firstSlug}`);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">mdnuais</h1>
        <p className="text-[var(--color-content-muted)]">
          Nenhum documento encontrado. Acesse o painel admin para criar documentos.
        </p>
      </div>
    </div>
  );
}
