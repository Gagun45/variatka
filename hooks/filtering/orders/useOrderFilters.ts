"use client";

import {
  IOrderStatusFilter,
  ORDER_STATUS_FILTER_VALUES,
} from "@/lib/enumslist/order.constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { parseUrlParam } from "../url.helper";

export const useOrderFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = useMemo<IOrderStatusFilter>(
    () =>
      parseUrlParam(
        searchParams.get("status"),
        ORDER_STATUS_FILTER_VALUES,
        "all",
      ),
    [searchParams],
  );

  const setStatus = useCallback(
    (value: IOrderStatusFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") params.delete("status");
      else params.set("status", value);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return { status, setStatus };
};
