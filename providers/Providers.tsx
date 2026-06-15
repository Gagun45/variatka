import { ReactNode } from "react";

import { ThemeProvider } from "./ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
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
  );
};

export default Providers;
