import AuthenticatedLayout from "@/components/auth-layout/AuthenticatedLayout";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
