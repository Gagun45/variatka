export const parseUrlParam = <T extends string>(
  paramValue: string | null,
  allowedValues: readonly T[] | T[],
  defaultValue: T,
): T => {
  if (!paramValue) return defaultValue;

  // We use a type cast here so TypeScript accepts the runtime validation
  return allowedValues.includes(paramValue as T)
    ? (paramValue as T)
    : defaultValue;
};
