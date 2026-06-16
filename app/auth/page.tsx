// app/login/page.tsx
"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/actions/auth.actions";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const onSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const { message, success } = await login(password);

      if (success) {
        router.push(frontendUrls.ingredients.index);
        return;
      }

      setPassword("");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="w-full max-w-md mx-auto space-y-8">
        <h1 className="text-center py-8">PROTECTED CONTENT</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <fieldset className="space-y-4" disabled={isLoading}>
            <Input
              value={password}
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-600">{error}</p>}
            <LoadingButton
              className="w-full"
              isPending={isLoading}
              type="submit"
            >
              Login
            </LoadingButton>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
