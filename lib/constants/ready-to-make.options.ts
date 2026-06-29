import { IOption } from "../types";

export type IReadyToMakeType = "all" | "ready" | "missing";

import { CheckCircle2, XCircle, List } from "lucide-react";

export const READY_TO_MAKE_OPTIONS: IOption<IReadyToMakeType>[] = [
  {
    value: "all",
    label: "All",
    icon: List,
  },
  {
    value: "ready",
    label: "Ready to cook",
    icon: CheckCircle2,
    iconClassName: "text-green-500",
  },
  {
    value: "missing",
    label: "Missing ingredients",
    icon: XCircle,
    iconClassName: "text-orange-500",
  },
];

export const READY_TO_MAKE_OPTIONS_VALUES = READY_TO_MAKE_OPTIONS.map(
  (o) => o.value,
);
