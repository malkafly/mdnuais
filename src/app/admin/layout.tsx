import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <AdminSidebar />
      <main className="lg:pl-sidebar">
        <div className="pt-16 px-4 pb-6 lg:pt-8 lg:px-8 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
