export type IStockType = "all" | "in" | "out";

export type IStockOption<T extends string> = {
  value: T;
  label: string;
};

export const STOCK_OPTIONS: IStockOption<IStockType>[] = [
  { value: "all", label: "All" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Out of stock" },
];
