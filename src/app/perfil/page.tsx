import { redirect } from "next/navigation";
import { Section } from "@/components/ui/section";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { getSessionWithProfile } from "@/lib/auth/server";

export default async function ProfilePage() {
  const { user, profile } = await getSessionWithProfile();
  if (!user) redirect("/login");

  const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || user.email || "Cliente";
  const email = user.email ?? "";
  const role = profile?.role ?? "USER";

  return (
    <Section containerClassName="max-w-4xl">
      <ProfileExperience displayName={displayName} email={email} role={role} />
    </Section>
  );
}
