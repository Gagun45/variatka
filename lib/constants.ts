// frontend/constants.ts

// 1. Create a browser-safe pseudo-enum
export const RECIPE_SERIES = {
  DEFAULT: "DEFAULT",
  NOMLYGOLD: "NOMLYGOLD",
} as const;

// 2. Derive the type from the object
export type IRecipeSeries = (typeof RECIPE_SERIES)[keyof typeof RECIPE_SERIES];

// 3. Map your labels safely
export const RECIPE_SERIES_LABELS: Record<IRecipeSeries, string> = {
  [RECIPE_SERIES.DEFAULT]: "Standard",
  [RECIPE_SERIES.NOMLYGOLD]: "Nomly Gold Premium",
};
