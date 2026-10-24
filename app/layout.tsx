import { getDataSession } from "@/lib/data/server";
import QueryPrefetcher from "@/components/QueryPrefetcher";
import AppLoadingScreen from "@/components/loader/AppLoadingScreen";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import Header from "../components/header/Header";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import Providers from "../providers/Providers";
import { ThemeProvider } from "../providers/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-app-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nomly",
    template: "%s | Nomly",
  },
  description: "Nomly is a personal recipe and ingredient manager.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

// Keep session resolution and collection hydration below the loading boundary.
async function Application({ children }: { children: React.ReactNode }) {
  const session = await getDataSession();

  return (
    <Providers session={session}>
      <QueryPrefetcher session={session}>
        <AppSidebar />
        <div className="flex flex-col min-h-screen w-full">
          <Header />
          {children}
        </div>
      </QueryPrefetcher>
    </Providers>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<AppLoadingScreen />}>
            <Application>{children}</Application>
          </Suspense>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
