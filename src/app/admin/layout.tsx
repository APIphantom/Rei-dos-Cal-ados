import { AdminBottomNav, AdminMobileHeader, AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[#1f1f1f] bg-[#0a0a0a] md:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <AdminSidebar />
          </div>
        </aside>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminMobileHeader />
          <main className="flex-1 px-3 py-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-4 md:px-8 md:py-10 md:pb-10">
            {children}
          </main>
          <AdminBottomNav />
        </div>
      </div>
    </div>
  );
}
