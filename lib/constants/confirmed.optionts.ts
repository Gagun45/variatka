import { IOption } from "../types";

export type IConfirmedType = "all" | "confirmed" | "not-confirmed";

export const CONFIRMED_OPTIONS: IOption<IConfirmedType>[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "not-confirmed", label: "Not confirmed" },
];
