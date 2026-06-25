import { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./AuthProvider";
import QueryProvider from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <QueryProvider>
        <TooltipProvider>
          <SidebarProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </SidebarProvider>
        </TooltipProvider>
      </QueryProvider>
    </AuthProvider>
  );
};

export default Providers;
