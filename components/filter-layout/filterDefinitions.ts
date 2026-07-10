import type { IActiveBadge } from "./ActiveFilterBadges";
import type { IOption } from "@/lib/types";

export interface FilterDefinition {
  id: string;
  value: string;
  defaultValue: string;
  options: readonly IOption<string>[];
  reset: () => void;
  labelPrefix?: string;
}

export function createActiveFilterBadges(
  definitions: readonly FilterDefinition[],
): IActiveBadge[] {
  return definitions.flatMap((definition) => {
    if (definition.value === definition.defaultValue) return [];

    const option = definition.options.find(
      ({ value }) => value === definition.value,
    );

    if (!option) return [];

    return [
      {
        id: definition.id,
        label: definition.labelPrefix
          ? `${definition.labelPrefix}: ${option.label}`
          : option.label,
        icon: option.icon,
        iconClassName: option.iconClassName,
        onClear: definition.reset,
      },
    ];
  });
}

export function resetFilterDefinitions(
  definitions: readonly FilterDefinition[],
) {
  definitions.forEach(({ reset }) => reset());
}
