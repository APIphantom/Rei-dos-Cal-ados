"use client";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfileRoleBadge } from "@/components/profile/profile-role-badge";

type Props = {
  displayName: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function ProfileHeader({ displayName, email, role }: Props) {
  return (
    <div className="border-b border-white/10 px-6 pb-8 pt-8 sm:px-10">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex flex-col items-center sm:items-start sm:pt-1">
          <ProfileAvatar name={displayName} />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{displayName}</h1>
            <ProfileRoleBadge role={role} />
          </div>
          <p className="mt-2 truncate text-sm text-muted-foreground/90">{email}</p>
        </div>
      </div>
    </div>
  );
}
