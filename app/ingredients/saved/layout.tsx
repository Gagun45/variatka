import ProtectedLayout from "@/components/protected-layout/ProtectedLayout";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
