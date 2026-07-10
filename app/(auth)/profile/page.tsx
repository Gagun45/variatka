"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
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
      <StateScreen
        title="Sign in required"
        description="Sign in to view and update your account details."
        icon={<LogIn />}
        action={
          <Button onClick={() => signIn("google")}>Sign in with Google</Button>
        }
      />
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
