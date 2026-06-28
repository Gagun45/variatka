import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";
import { IOption } from "../types";

export interface IOptionListType {
  label: string;
  icon?: LucideIcon | IconType;
  iconClassName?: string;
  className?: string;
}

export interface IFilterConfig<T extends string> {
  label: string;
  options: IOption<T>[];
}
