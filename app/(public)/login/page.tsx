"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  return (
    <main>
      <h1>Sign In</h1>
      <div className="flex justify-center">
        <Button onClick={() => signIn("google")}>Continue with Google</Button>
      </div>
    </main>
  );
};

export default LoginPage;
