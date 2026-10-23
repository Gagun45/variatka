import type { PendingWrite, ResumeWrite } from "@/zod/ai-resolution.schema";
import type { RecordSelection } from "@/zod/ai-search.schema";
import type { InventoryResult } from "../ai/inventory.types";
import { inventoryCategoryLabels } from "../ai/inventory-labels";
import { candidateNames, matchNames, literalNames } from "../ai/name-resolution";
import { AppError } from "../error";
import { prisma } from "../prisma";

const PAGE_SIZE = 20;
export type RecordChoice = {
  key: string; name: string; context: string;
  candidates: InventoryResult[]; page: number; hasMore: boolean;
};
export class RecordChoiceRequired extends AppError {
  constructor(public readonly question: RecordChoice) {
    super(`Назва «${question.name}» неоднозначна. Варіанти: ${candidateNames(question.candidates)}.`);
  }
}
const select = { id: true, title: true, category: true, updatedAt: true } as const;
type Entity = RecordSelection["entity"];
type RecordData = { id: number; title: string; category: keyof typeof inventoryCategoryLabels; updatedAt: Date };

async function records(entity: Entity, name: string, mode: "exact" | "partial", page = 0) {
  const title = mode === "exact" ? { equals: name, mode: "insensitive" as const } : { contains: name.replace(/[\\%_]/g, "\\$&"), mode: "insensitive" as const };
  const args = { where: { title }, select, orderBy: [{ title: "asc" as const }, { id: "asc" as const }], skip: page * PAGE_SIZE, take: PAGE_SIZE + 1 };
  return entity === "ingredient" ? prisma.ingredient.findMany(args) : entity === "stuff" ? prisma.stuff.findMany(args) : prisma.recipe.findMany(args);
}
async function tolerantRecords(entity: Entity, name: string) {
  const rows: RecordData[] = [];
  for (let page = 0; ; page++) {
    const args = { where: {}, select, orderBy: [{ title: "asc" as const }, { id: "asc" as const }], skip: page * 250, take: 250 };
    const chunk = entity === "ingredient" ? await prisma.ingredient.findMany(args) : entity === "stuff" ? await prisma.stuff.findMany(args) : await prisma.recipe.findMany(args);
    rows.push(...chunk);
    if (chunk.length < 250) break;
  }
  return matchNames(name, rows);
}

async function record(entity: Entity, id: number) {
  const args = { where: { id }, select };
  return entity === "ingredient" ? prisma.ingredient.findUnique(args) : entity === "stuff" ? prisma.stuff.findUnique(args) : prisma.recipe.findUnique(args);
}

// Request-local state, sent back only while a user is resolving names. No writes or AI calls.
export class WriteResolution {
  readonly decisions: PendingWrite["decisions"];
  private consumedChoice = false;
  constructor(pending: Pick<PendingWrite, "decisions">, private readonly input?: Pick<ResumeWrite, "choice" | "page">) {
    this.decisions = [...pending.decisions];
    if (new Set(this.decisions.map((item) => item.key)).size !== this.decisions.length) throw new AppError("Повторні рішення у запиті. Підготуйте новий запит.");
  }
  private chosen(key: string, entity: Entity) {
    const saved = this.decisions.find((item) => item.key === key);
    const clicked = this.input?.choice?.key === key ? this.input.choice : null;
    if (clicked) this.consumedChoice = true;
    const selection = clicked?.selection ?? saved?.selection;
    if (selection && selection.entity !== entity) throw new AppError("Тип обраного запису не відповідає операції.");
    return { saved, selection };
  }
  private remember(key: string, entity: Entity, row: { id: number; title: string }) {
    const decision = { key, selection: { entity, id: row.id }, title: row.title };
    const index = this.decisions.findIndex((item) => item.key === key);
    if (index < 0) this.decisions.push(decision);
    else this.decisions[index] = decision;
    if (this.decisions.length > 1020) throw new AppError("Забагато виборів у запиті.");
  }
  private question(key: string, name: string, context: string, entity: Entity, rows: { id: number; title: string; category?: keyof typeof inventoryCategoryLabels; amount?: string }[], page: number) {
    throw new RecordChoiceRequired({ key, name, context, page, hasMore: rows.length > PAGE_SIZE, candidates: rows.slice(0, PAGE_SIZE).map((row) => ({ entity, id: row.id, title: row.title, summary: [row.category ? inventoryCategoryLabels[row.category] : "", row.amount ?? ""].filter(Boolean).join(" · ") })) });
  }
  async inventory(entity: Entity, name: string, key: string, context: string, allowMissing = false): Promise<RecordData | null> {
    const { saved, selection } = this.chosen(key, entity);
    if (saved && selection) {
      const current = await record(entity, selection.id);
      if (!current || current.title !== saved.title || !matchNames(name, [current]).length) throw new AppError(`Обраний запис «${saved.title}» змінився або видалений. Підготуйте новий запит.`, "STALE_PREVIEW");
      return current;
    }
    const exact = await records(entity, name, "exact");
    // Literal spelling wins over case-only legacy alternatives.
    const literal = exact.find((item) => item.title === name);
    const mode = exact.length ? "exact" : "partial";
    const partial = exact.length ? [] : await records(entity, name, "partial");
    const approximate = !exact.length && !partial.length;
    const first = literal ? [literal] : exact.length ? exact : partial.length ? partial : await tolerantRecords(entity, name);
    if (selection) {
      const current = await record(entity, selection.id);
      const matches = current && (literal ? current.id === literal.id : mode === "exact" ? current.title.toLocaleLowerCase("uk") === name.toLocaleLowerCase("uk") : approximate ? first.some((row) => row.id === current.id) : current.title.toLocaleLowerCase("uk").includes(name.toLocaleLowerCase("uk")));
      if (!matches || !current) throw new AppError("Обраний запис більше не відповідає запиту. Оновіть варіанти або змініть запит.", "STALE_PREVIEW");
      this.remember(key, entity, current);
      return current;
    }
    if (first.length === 1 && !approximate) { this.remember(key, entity, first[0]); return first[0]; }
    if (!first.length) {
      if (allowMissing) return null;
      throw new AppError(`Запис «${name}» не знайдено. Уточніть назву.`, "NOT_FOUND");
    }
    const page = this.input?.page?.key === key ? this.input.page.number : 0;
    const rows = approximate ? first.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE + 1) : page === 0 ? first : await records(entity, name, mode, page);
    this.question(key, name, context, entity, rows, page);
    return null;
  }
  composition<T extends { id: number | null; title: string; amount: string; category: keyof typeof inventoryCategoryLabels }>(name: string, items: T[], key: string, context: string): T {
    const { saved, selection } = this.chosen(key, "ingredient");
    const candidates = matchNames(name, items);
    if (selection) {
      const chosen = (saved ? items : candidates).find((item) => item.id === selection.id);
      if (!chosen || (saved && (chosen.title !== saved.title || !matchNames(name, [chosen]).length))) throw new AppError("Обраний інгредієнт більше не відповідає складу рецепта.", "STALE_PREVIEW");
      this.remember(key, "ingredient", { ...chosen, id: selection.id });
      return chosen;
    }
    if (candidates.length === 1 && literalNames(name, items).length > 0 && candidates[0].id !== null) {
      this.remember(key, "ingredient", { ...candidates[0], id: candidates[0].id });
      return candidates[0];
    }
    if (!candidates.length) throw new AppError(`Інгредієнт «${name}» не знайдено в складі. Доступні: ${candidateNames(items) || "склад порожній"}.`, "NOT_FOUND");
    const page = this.input?.page?.key === key ? this.input.page.number : 0;
    this.question(key, name, context, "ingredient", candidates.filter((item): item is T & { id: number } => item.id !== null).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE + 1), page);
    throw new AppError("Оберіть інгредієнт.");
  }
  validateChoice() {
    if (this.input?.choice && !this.consumedChoice) throw new AppError("Вибір більше не відповідає поточному запиту. Оновіть варіанти.", "STALE_PREVIEW");
  }
}

export type OperationResolution = { state: WriteResolution; index: number };
