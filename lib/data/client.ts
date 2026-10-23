import type { Collection, Collections } from "./collections";

export async function readCollection<K extends Collection>(
  collection: K,
): Promise<Collections[K]> {
  const response = await fetch(`/api/data?collection=${collection}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Could not load data");
  }
  // Preserve Prisma Date values so GET results match server hydration and mutations.
  // Order presenters intentionally expose createdAt as an ISO string.
  const hasPrismaDates = collection !== "myOrders" && collection !== "allOrders";
  return JSON.parse(await response.text(), (key, value) =>
    hasPrismaDates &&
    (key === "createdAt" || key === "updatedAt") &&
    typeof value === "string"
      ? new Date(value)
      : value,
  );
}
