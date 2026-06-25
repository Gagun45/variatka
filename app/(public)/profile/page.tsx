"use client";

import Loader from "@/components/loader/Loader";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Profile from "./_components/profile/Profile";

export default function ProfilePage() {
  const { status, session } = useAuth();
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
