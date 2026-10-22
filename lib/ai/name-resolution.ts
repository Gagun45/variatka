const normalize = (name: string) => name.trim().toLocaleLowerCase("uk");

// Literal title matching only: no guessed spellings or semantic substitutions.
export function matchNames<T extends { title: string }>(name: string, records: T[]): T[] {
  const literal = records.filter((record) => record.title === name);
  if (literal.length) return literal;
  const key = normalize(name);
  const exact = records.filter((record) => normalize(record.title) === key);
  return exact.length ? exact : records.filter((record) => normalize(record.title).includes(key));
}

export function candidateNames(records: { title: string }[], limit = 5) {
  return records.slice(0, limit).map((record) => `«${record.title}»`).join(", ") + (records.length > limit ? " (є й інші)" : "");
}
