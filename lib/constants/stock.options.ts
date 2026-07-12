import { CheckCircle2, Layers, XCircle } from "lucide-react";
import { IOption } from "../types";

export type IStockType = "all" | "in" | "out";

export const STOCK_OPTIONS: IOption<IStockType>[] = [
  {
    value: "all",
    label: "Усі",
    icon: Layers,
  },
  {
    value: "in",
    label: "У наявності",
    icon: CheckCircle2,
    iconClassName: "text-green-500",
  },
  {
    value: "out",
    label: "Немає в наявності",
    icon: XCircle,
    iconClassName: "text-red-500",
  },
];

export const STOCK_OPTIONS_VALUES = STOCK_OPTIONS.map((o) => o.value);
