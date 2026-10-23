// Lookup normalization never changes stored titles. Keep letters and numbers: sizes
// and preparation words must still participate in matching.
export const normalizeName = (name: string) => name.normalize("NFKC").toLocaleLowerCase("uk")
  .replace(/[’'`ʼ]/g, "").replace(/(\d)\s*(?=\p{L})/gu, "$1 ")
  .replace(/[^\p{L}\p{N}%_\\]+/gu, " ").trim().replace(/\s+/g, " ");

function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]));
    previous = current;
  }
  return previous[b.length];
}

function tokenMatches(query: string, word: string): boolean {
  if (query === word) return true;
  // Numbers and short words are exact; never approximate capacities or units.
  if (/\d/u.test(query) || /\d/u.test(word) || query.length < 4 || word.length < 4) return false;
  if (word.startsWith(query)) return true;
  // Conservative Ukrainian inflection fallback, not synonym substitution.
  const stem = (value: string) => value.replace(/(?:ами|ями|ові|еві|ого|ому|ою|ею|ом|ем|ах|ях|ів|ий|ій|а|я|у|ю|и|і|е|ь)$/u, "");
  const root = stem(query);
  if (root.length >= 4 && root === stem(word)) return true;
  const allowance = Math.min(query.length, word.length) >= 8 ? 2 : 1;
  return Math.abs(query.length - word.length) <= allowance && distance(query, word) <= allowance;
}

// Lower scores are stronger. Null means every significant query token could not
// be accounted for. Tokens consume separate words ("перець перець" isn't one).
export function nameMatchScore(query: string, title: string): number | null {
  if (title === query) return 0;
  const q = normalizeName(query), value = normalizeName(title);
  if (!q || !value) return null;
  if (q === value) return 1;
  const queries = q.split(" "), words = value.split(" ");
  if (value.includes(q) && !/\d/u.test(q)) return 2;
  if (queries.length > 20 || words.length > 100) return null;
  // Bipartite matching avoids exponential backtracking for repeated words.
  const owners = new Map<number, number>();
  function assign(index: number, visited: Set<number>): boolean {
    for (let i = 0; i < words.length; i++) {
      if (visited.has(i) || !tokenMatches(queries[index], words[i])) continue;
      visited.add(i);
      const owner = owners.get(i);
      if (owner === undefined || assign(owner, visited)) { owners.set(i, index); return true; }
    }
    return false;
  }
  if (!queries.every((_, index) => assign(index, new Set()))) return null;
  return queries.every((word) => words.includes(word)) ? 3 : 4;
}

export function literalNames<T extends { title: string }>(name: string, records: T[]): T[] {
  const literal = records.filter((record) => record.title === name);
  if (literal.length) return literal;
  const key = name.trim().toLocaleLowerCase("uk");
  const exact = records.filter((record) => record.title.trim().toLocaleLowerCase("uk") === key);
  return exact.length ? exact : records.filter((record) => record.title.toLocaleLowerCase("uk").includes(key));
}

export function matchNames<T extends { title: string }>(name: string, records: T[]): T[] {
  const literal = literalNames(name, records);
  if (literal.length) return literal;
  return records.map((record) => ({ record, score: nameMatchScore(name, record.title) }))
    .filter((item): item is { record: T; score: number } => item.score !== null)
    .sort((a, b) => a.score - b.score || a.record.title.localeCompare(b.record.title, "uk"))
    .map(({ record }) => record);
}

export function candidateNames(records: { title: string }[], limit = 5) {
  return records.slice(0, limit).map((record) => `«${record.title}»`).join(", ") + (records.length > limit ? " (є й інші)" : "");
}
