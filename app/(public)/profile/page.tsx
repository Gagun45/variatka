"use client";

import { useAuthStore } from "@/zustand/auth.store";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Profile from "./_components/profile/Profile";

export default function ProfilePage() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hydrated) return null;

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Profile</h1>
        <p>You need to log in</p>
        <LoginLink>Login</LoginLink>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Profile</h1>
      <Profile />
    </div>
  );
}
