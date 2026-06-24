"use client";

import { useAuthStore } from "@/zustand/auth.store";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Profile from "./_components/profile/Profile";
import { buttonVariants } from "@/components/ui/button";

export default function ProfilePage() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hydrated) return null;

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Profile</h1>
        <div className="flex flex-col items-center gap-4">
          <p>You need to log in</p>
          <LoginLink className={buttonVariants({ className: "w-fit" })}>
            Login
          </LoginLink>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Your Profile</h1>
      <Profile />
    </main>
  );
}
