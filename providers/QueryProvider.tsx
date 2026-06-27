"use client";

import { ReactNode, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 2, // 2 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: {
        getItem: (key) => {
          // Safe localStorage access
          if (typeof window === "undefined") return null;
          return window.localStorage.getItem(key);
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return;
          window.localStorage.setItem(key, value);
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return;
          window.localStorage.removeItem(key);
        },
      },
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Optional: hydrate only on initial load
        hydrateOptions: {
          // You can customize dehydration/hydration behavior here if needed
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
