import type { PendingWrite } from "@/zod/ai-resolution.schema";
import { pendingWriteSchema } from "@/zod/ai-resolution.schema";
import type { InventoryMutationIntent } from "@/zod/ai-mutation.schema";
import type { WriteRevision } from "@/zod/ai-task.schema";
import type { compositionChangeSchema } from "@/zod/ai-recipe.schema";
import type z from "zod";
import { AppError } from "../error";
import { literalNames } from "./name-resolution";

type Change = WriteRevision["changes"][number]["change"];
type RecipeIntent = Extract<InventoryMutationIntent, { kind: "createRecipe" | "updateRecipe" }>;
type Composition = z.infer<typeof compositionChangeSchema>;
const values = (patch: object) => Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== null));
const compositionKey = (index: number, kind: RecipeIntent["kind"], action: string, slot: number) => kind === "createRecipe" ? `${index}:ingredient:${slot}` : action === "add" ? `${index}:ingredient:change:${slot}` : `${index}:composition:${slot}`;

function reviseComposition(intent: RecipeIntent, edit: Composition, index: number, pending: PendingWrite): RecipeIntent {
  const previous: Composition = intent.kind === "createRecipe"
    ? { mode: "replace", items: intent.ingredients.map((item) => ({ ...item, action: "add" })) }
    : intent.composition ?? { mode: "patch", items: [] };
  const original = previous.items.map((item, slot) => ({ ...item, slot }));
  let entries = original.map((item) => ({ ...item, oldSlot: item.slot as number | null }));
  let nextSlot = original.length;
  const matches = (title: string) => {
    const aliases = entries.flatMap((item) => {
      const oldSlot = item.oldSlot;
      const decision = oldSlot === null ? null : pending.decisions.find((decision) => decision.key === compositionKey(index, intent.kind, previous.items[oldSlot].action, oldSlot));
      return [{ title: item.title, slot: item.slot }, ...(decision && "selection" in decision ? [{ title: decision.title, slot: item.slot }] : [])];
    });
    const slots = new Set(literalNames(title, aliases).map((item) => item.slot));
    if (slots.size > 1) throw new AppError(`Уточніть інгредієнт «${title}» у пропозиції: ${entries.map((item) => item.title).join(", ")}.`);
    return slots.size ? entries.findIndex((item) => slots.has(item.slot)) : -1;
  };
  if (edit.mode === "replace") {
    if (edit.items.some((item) => item.action !== "add" || !item.amount)) throw new AppError("Для заміни складу вкажіть повний список інгредієнтів із кількостями.");
    const replacements = edit.items.map((item, slot) => {
      const match = matches(item.title);
      return { ...item, slot, oldSlot: match >= 0 ? entries[match].oldSlot : null };
    });
    entries = replacements;
  } else {
    for (const item of edit.items) {
      const match = matches(item.title);
      const current = entries[match];
      if (match < 0) {
        if (previous.mode === "replace" && item.action !== "add") throw new AppError(`У пропозиції немає інгредієнта «${item.title}». Вкажіть наявну назву або явно додайте інгредієнт.`);
        entries.push({ ...item, slot: nextSlot++, oldSlot: null });
      } else if (item.action === "remove" && current.action === "add") {
        entries.splice(match, 1);
      } else {
        if (item.action === "add") throw new AppError(`«${current.title}» уже є в пропозиції. Вкажіть нову кількість.`);
        entries[match] = { ...current, action: current.action === "add" && item.action === "setAmount" ? "add" : item.action, amount: item.amount, category: item.category ?? current.category };
      }
    }
  }
  const mode = edit.mode === "replace" ? "replace" : previous.mode;
  if (entries.some((item) => item.action !== "remove" && !item.amount)) throw new AppError("Вкажіть кількість для кожного інгредієнта, наприклад 5 г.");
  const retained = pending.decisions.filter((decision) => !/^\d+:(?:ingredient:|composition:)/.test(decision.key) || !decision.key.startsWith(`${index}:`));
  for (const [slot, item] of entries.entries()) {
    if (item.oldSlot === null) continue;
    const decision = pending.decisions.find((decision) => decision.key === compositionKey(index, intent.kind, previous.items[item.oldSlot!].action, item.oldSlot!));
    if (decision) retained.push({ ...decision, key: compositionKey(index, intent.kind, item.action, slot) });
  }
  pending.decisions = retained;
  const items = entries.map(({ action, title, amount, category }) => ({ action, title, amount, category }));
  return intent.kind === "createRecipe"
    ? { ...intent, ingredients: items.map(({ title, amount, category }) => ({ title, amount: amount!, category })) }
    : { ...intent, composition: { mode, items } };
}

function reviseOperation(intent: InventoryMutationIntent, change: Change, index: number, pending: PendingWrite): InventoryMutationIntent {
  if (change.kind === "target") {
    if (!("targetName" in intent)) throw new AppError("Для перейменування нового запису змініть назву пропозиції.");
    pending.decisions = pending.decisions.filter((decision) => !decision.key.startsWith(`${index}:`));
    return { ...intent, targetName: change.targetName };
  }
  if (change.kind === "ingredient" && (intent.kind === "createIngredient" || intent.kind === "updateIngredient")) {
    if (intent.kind === "updateIngredient") return { ...intent, patch: { ...intent.patch, ...values(change.patch) } };
    const data = { ...intent.data, ...values(change.patch) };
    if (data.title !== intent.data.title) pending.decisions = pending.decisions.filter((decision) => decision.key !== `${index}:createIngredient`);
    return { ...intent, data };
  }
  if (change.kind === "stuff" && (intent.kind === "createStuff" || intent.kind === "updateStuff")) {
    const { stock, ...patch } = change.patch;
    if (intent.kind === "createStuff") return { ...intent, data: { ...intent.data, ...values(patch), inStock: stock ? (stock.mode === "adjust" ? intent.data.inStock + stock.value : stock.value) : intent.data.inStock } };
    let revisedStock = intent.patch.stock;
    if (stock) {
      const mode = stock.mode ?? revisedStock?.mode;
      if (!mode) throw new AppError("Залишок встановити чи змінити на цю кількість? Наприклад: «встанови 7» або «додай 7».");
      const value = stock.mode === null && mode === "adjust" && revisedStock && revisedStock.value < 0 && stock.value > 0 ? -stock.value : stock.value;
      revisedStock = { mode, value };
    }
    return { ...intent, patch: { ...intent.patch, ...values(patch), stock: revisedStock } };
  }
  if (change.kind === "recipe" && (intent.kind === "createRecipe" || intent.kind === "updateRecipe")) {
    const revised = intent.kind === "createRecipe" ? { ...intent, data: { ...intent.data, ...values(change.patch) } } : { ...intent, patch: { ...intent.patch, ...values(change.patch) } };
    return change.composition ? reviseComposition(revised, change.composition, index, pending) : revised;
  }
  throw new AppError("Тип зміни не відповідає операції. Уточніть запис і поле; видалення не можна змінити непомітно на іншу дію.");
}

function preserveCreationDependencies(original: PendingWrite, pending: PendingWrite) {
  const before = original.command;
  const after = pending.command;
  if (before.kind !== "batch" || before.intent.kind !== "list" || after.kind !== "batch" || after.intent.kind !== "list") return;
  const renames = new Map<string, string>();
  for (const [index, old] of before.intent.operations.entries()) {
    const revised = after.intent.operations[index];
    if (old.kind === "createIngredient" && revised.kind === "createIngredient" && old.data.title !== revised.data.title) renames.set(old.data.title.toLocaleLowerCase("uk"), revised.data.title);
  }
  if (!renames.size) return;
  for (const [old, title] of renames) if (old !== title.toLocaleLowerCase("uk") && renames.has(title.toLocaleLowerCase("uk"))) throw new AppError("Для обміну назвами інгредієнтів вкажіть новий повний склад рецептів окремим запитом.");
  for (const [index, operation] of after.intent.operations.entries()) {
    if (operation.kind !== "createRecipe" && operation.kind !== "updateRecipe") continue;
    const items = operation.kind === "createRecipe" ? operation.ingredients : operation.composition?.items ?? [];
    for (const [slot, item] of items.entries()) {
      // Only additions can refer to an ingredient being created in this batch.
      if ("action" in item && item.action !== "add") continue;
      const title = renames.get(item.title.toLocaleLowerCase("uk"));
      if (!title) continue;
      item.title = title;
      const key = compositionKey(index, operation.kind, "add", slot);
      pending.decisions = pending.decisions.filter((decision) => decision.key !== key);
    }
  }
}

// Pure transformation of a validated task. Only changed values are merged; IDs,
// other operations and unedited fields never come from regenerated model output.
export function revisePendingWrite(original: PendingWrite, revision: WriteRevision): PendingWrite {
  const pending = structuredClone(original);
  const seen = new Set<string>();
  for (const { operationIndex: index, change } of revision.changes) {
    const key = `${index}:${change.kind}`;
    if (seen.has(key)) throw new AppError("Повторні зміни одного поля/операції. Об’єднайте уточнення.");
    seen.add(key);
    const command = pending.command;
    if (command.kind === "mutation") {
      if (index !== 0) throw new AppError("У пропозиції лише одна операція.");
      command.intent = reviseOperation(command.intent, change, index, pending);
    } else if (command.intent.kind === "list") {
      const intent = command.intent.operations[index];
      if (!intent) throw new AppError("Такої операції немає в пропозиції.");
      command.intent.operations[index] = reviseOperation(intent, change, index, pending);
    } else {
      if (index !== 0 || change.kind === "target" || (change.kind === "recipe" && change.composition)) throw new AppError("Для зміни переліку записів чи складу вкажіть новий повний запит.");
      const filter = command.intent.change;
      const intent: InventoryMutationIntent = filter.kind === "updateIngredients" ? { kind: "updateIngredient", targetName: null, patch: filter.patch }
        : filter.kind === "updateStuff" ? { kind: "updateStuff", targetName: null, patch: filter.patch }
        : filter.kind === "updateRecipes" ? { kind: "updateRecipe", targetName: null, patch: filter.patch, composition: null }
        : { kind: "deleteStuff", targetName: null };
      const revised = reviseOperation(intent, change, index, pending);
      if (filter.kind === "updateIngredients" && revised.kind === "updateIngredient") filter.patch = revised.patch;
      else if (filter.kind === "updateStuff" && revised.kind === "updateStuff") filter.patch = revised.patch;
      else if (filter.kind === "updateRecipes" && revised.kind === "updateRecipe") filter.patch = revised.patch;
      else throw new AppError("Цю пакетну дію не можна змінити таким уточненням.");
    }
  }
  preserveCreationDependencies(original, pending);
  return pendingWriteSchema.parse(pending);
}
