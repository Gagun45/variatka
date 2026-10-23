import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { availableCollections, collectionLoaders } from "@/lib/data/server";
import { collectionKeys } from "@/lib/data/collections";

export default async function QueryPrefetcher({ session, children }: {
  session: Session | null;
  children: ReactNode;
}) {
  const queryClient = new QueryClient();
  const loaders = collectionLoaders(session);
  // Start every permitted read together. Failed reads retain the existing client
  // error/retry UI rather than taking down the entire application shell.
  await Promise.allSettled(availableCollections(session).map((collection) =>
    queryClient.fetchQuery({
      queryKey: collectionKeys[collection],
      queryFn: async () => loaders[collection](),
    }),
  ));
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
