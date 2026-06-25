"use client";

import { useAuthStore } from "@/zustand/auth.store";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Profile from "./_components/profile/Profile";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Loader from "@/components/loader/Loader";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <Loader />;

  if (!session) {
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

  const { user } = session;

  return (
    <main>
      <h1>Your Profile</h1>
      <Profile user={user} />
    </main>
  );
}
