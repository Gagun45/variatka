"use client";

import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";
import Profile from "./_components/profile/Profile";
import { LogIn } from "lucide-react";

export default function ProfilePage() {
  const { status, session } = useAuth();
  if (status === "loading") return <Loader />;

  if (!session) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="space-y-2 text-center">
          <h1>Profile</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to view and update your account details.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button className="w-fit" onClick={() => signIn("google")}>
            <LogIn />
            Sign in with Google
          </Button>
        </div>
      </main>
    );
  }

  const { user } = session;

  return (
    <main>
      <div className="space-y-1">
        <h1>Your profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information and checkout contact defaults.
        </p>
      </div>
      <Profile user={user} />
    </main>
  );
}
