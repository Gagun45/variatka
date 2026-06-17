import { ReactNode } from "react";

import { ThemeProvider } from "./ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
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
  );
};

export default Providers;
