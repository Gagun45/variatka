import { CheckCircle2, Layers, XCircle } from "lucide-react";
import { IOption } from "../types";

export type IStockType = "all" | "in" | "out";

export const STOCK_OPTIONS: IOption<IStockType>[] = [
  {
    value: "all",
    label: "All",
    icon: Layers,
  },
  {
    value: "in",
    label: "In stock",
    icon: CheckCircle2,
    iconClassName: "text-green-500",
  },
  {
    value: "out",
    label: "Out of stock",
    icon: XCircle,
    iconClassName: "text-red-500",
  },
];
