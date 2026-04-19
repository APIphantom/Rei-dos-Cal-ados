"use client";

import { BrandLogo } from "@/components/profile/brand-logo";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileActions } from "@/components/profile/profile-actions";

export type ProfileExperienceProps = {
  displayName: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function ProfileExperience({ displayName, email, role }: ProfileExperienceProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex justify-center sm:mb-10">
        <BrandLogo className="opacity-90 hover:opacity-100" />
      </div>

      <ProfileCard>
        <ProfileHeader displayName={displayName} email={email} role={role} />
        <ProfileInfo displayName={displayName} email={email} role={role} />
        <ProfileActions isAdmin={role === "ADMIN"} />
      </ProfileCard>
    </div>
  );
}
