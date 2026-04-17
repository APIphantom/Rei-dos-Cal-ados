import "server-only";

import { redirect } from "next/navigation";
import { getSessionWithProfile } from "@/lib/auth/server";

/** Usado no layout /admin: exige login + role ADMIN. */
export async function requireAdmin() {
  const { user, profile } = await getSessionWithProfile();
  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (profile?.role !== "ADMIN") {
    redirect("/?admin=forbidden");
  }
  return { user, profile };
}
