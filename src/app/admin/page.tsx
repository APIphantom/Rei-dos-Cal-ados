import { createClient } from "@/lib/supabase/server";
import { getSessionWithProfile } from "@/lib/auth/server";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const { user, profile } = await getSessionWithProfile();
  const supabase = await createClient();
  const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });

  const displayName = profile?.full_name?.trim() || user?.email || "Admin";

  return (
    <AdminDashboardClient
      displayName={displayName}
      email={user?.email ?? null}
      productCount={productCount ?? 0}
    />
  );
}
