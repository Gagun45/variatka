import { ReactNode } from "react";

import { ThemeProvider } from "./ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <TooltipProvider>
      <AuthProvider>
        <QueryProvider>
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
        </QueryProvider>
      </AuthProvider>
    </TooltipProvider>
  );
};

export default Providers;
