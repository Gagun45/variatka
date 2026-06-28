import { CheckCircle2, Circle } from "lucide-react";
import { GiConfirmed } from "react-icons/gi";
import { IOption } from "../types";

export type IConfirmedType = "all" | "confirmed" | "not-confirmed";

export const CONFIRMED_OPTIONS: IOption<IConfirmedType>[] = [
  {
    value: "all",
    label: "All",
    icon: GiConfirmed,
  },
  {
    value: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    iconClassName: "text-green-500",
  },
  {
    value: "not-confirmed",
    label: "Not confirmed",
    icon: Circle,
    iconClassName: "text-red-500",
  },
];
