import { IOption } from "../types";

export type IStockType = "all" | "in" | "out";

export const STOCK_OPTIONS: IOption<IStockType>[] = [
  { value: "all", label: "All" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Out of stock" },
];
