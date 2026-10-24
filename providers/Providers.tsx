import type { Session } from "next-auth";
import { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./AuthProvider";
import QueryProvider from "./QueryProvider";

const Providers = ({ children, session }: {
  children: ReactNode;
  session: Session | null;
}) => {
  return (
    <AuthProvider session={session}>
      <QueryProvider>
        <TooltipProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </TooltipProvider>
      </QueryProvider>
    </AuthProvider>
  );
};

export default Providers;
