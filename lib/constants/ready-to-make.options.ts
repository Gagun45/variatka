import { IOption } from "../types";

export type IReadyToMakeType = "all" | "ready" | "missing";

export const READY_TO_MAKE_OPTIONS: IOption<IReadyToMakeType>[] = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready to cook" },
  { value: "missing", label: "Missing ingredients" },
];
