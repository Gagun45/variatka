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
  if (status === "loading")
    return (
      <div role="status" aria-label="Завантаження профілю">
        <Loader />
      </div>
    );

  if (!session) {
    return (
      <StateScreen
        title="Потрібно увійти"
        description="Увійдіть, щоб переглядати та оновлювати дані облікового запису."
        icon={<LogIn />}
        action={
          <Button onClick={() => signIn("google")}>Увійти через Google</Button>
        }
      />
    );
  }

  const { user } = session;

  return (
    <main>
      <div className="space-y-1">
        <h1>Ваш профіль</h1>
        <p className="text-sm text-muted-foreground">
          Керуйте даними облікового запису та контактами для замовлень.
        </p>
      </div>
      <Profile user={user} />
    </main>
  );
}
