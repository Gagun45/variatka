/* eslint-disable @typescript-eslint/no-require-imports */
// Built-in Node test runner + the existing TypeScript compiler; no test packages.
const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const originalLoad = Module._load;
const originalFetch = global.fetch;
const originalKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_MODEL;
let state;

function project(record, select) {
  if (!record || !select) return record;
  return Object.fromEntries(Object.entries(select).map(([key, config]) => {
    const value = record[key];
    return [key, config === true ? value : Array.isArray(value) ? value.map((item) => project(item, config.select)) : project(value, config.select)];
  }));
}

function matches(record, where) {
  if (!record) return false;
  if (where.id !== undefined && record.id !== where.id) return false;
  if (where.updatedAt !== undefined && record.updatedAt.getTime() !== where.updatedAt.getTime()) return false;
  if (where.recipeIngredients?.none && record._count.recipeIngredients > 0) return false;
  return true;
}

function dbError(code) { return Object.assign(new Error(code), { code }); }

function canWrite() {
  assert.equal(state.allowWrites, true, "Search/proposals must never write");
  if (state.writeError) throw dbError(state.writeError);
}

const prisma = Object.fromEntries(["ingredient", "recipe", "stuff"].map((entity) => [entity, {
  findMany: async (args) => {
    state.reads.push({ entity, args });
    let rows = state.rows[entity];
    if (args.where.id?.in) rows = rows.filter((record) => args.where.id.in.includes(record.id));
    if (args.where.title?.contains) {
      const query = args.where.title.contains.replace(/\\([%_\\])/g, "$1").toLowerCase();
      rows = rows.filter((record) => record.title.toLowerCase().includes(query));
    }
    if (args.where.title?.equals) rows = rows.filter((record) => record.title.toLowerCase() === args.where.title.equals.toLowerCase());
    const skip = args.skip ?? 0;
    return rows.slice(skip, args.take === undefined ? undefined : skip + args.take).map((record) => project(record, args.select));
  },
  findUnique: async (args) => {
    state.reads.push({ entity, args });
    if (state.readError) throw state.readError;
    const record = state.records[entity];
    return matches(record, args.where) ? project(record, args.select) : null;
  },
  create: async (args) => {
    canWrite();
    const record = { id: 100, updatedAt: new Date(), ...args.data };
    state.records[entity] = record;
    state.writes.push({ entity, method: "create", args });
    return record;
  },
  update: async (args) => {
    canWrite();
    const record = state.records[entity];
    if (!matches(record, args.where)) throw dbError("P2025");
    state.writes.push({ entity, method: "update", args });
    state.records[entity] = { ...record, ...args.data };
    return state.records[entity];
  },
  delete: async (args) => {
    canWrite();
    const record = state.records[entity];
    if (!matches(record, args.where)) throw dbError("P2025");
    state.writes.push({ entity, method: "delete", args });
    state.records[entity] = null;
    return project(record, args.select);
  },
}]));

prisma.recipeIngredient = { findMany: async (args) => {
  state.reads.push({ entity: "recipeIngredient", args });
  return state.references.filter((item) => args.where.ingredientId.in.includes(item.ingredientId));
} };

prisma.$transaction = async (callback) => {
  const records = structuredClone(state.records);
  const writes = [...state.writes];
  try { return await callback(prisma); }
  catch (error) { state.records = records; state.writes = writes; throw error; }
};

Module._load = function (id, parent, main) {
  if (id === "../prisma") return { prisma };
  if (id === "../r2/storage.helper") return { storageHelper: { delete: async (key) => {
    state.storageDeletes.push(key);
    if (state.storageError) throw new Error("Mock R2 error");
  } } };
  if (id === "./user.actions") return { requireAdmin: async () => {
    state.authChecks++;
    if (!state.admin) throw new Error("Forbidden");
  } };
  if (id === "next/navigation") return { unstable_rethrow() {} };
  if (id.startsWith("@/")) id = path.join(root, id.slice(2));
  return originalLoad.call(this, id, parent, main);
};
require.extensions[".ts"] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);

const schemas = require("../zod/ai-search.schema.ts");
const { ingredientWhere, recipeWhere, stuffWhere } = require("../lib/ai/inventory-search.ts");
const actions = require("../lib/actions/ai.actions.ts");
const ingredientActions = require("../lib/actions/ingredient.actions.ts");
const stuffActions = require("../lib/actions/stuff.actions.ts");

const ingredient = schemas.inventorySearchSchema.parse({ entity: "ingredient", text: null, category: null, isInStock: null, isSaved: null });
const recipe = schemas.inventorySearchSchema.parse({ entity: "recipe", text: null, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] });
const stuff = schemas.inventorySearchSchema.parse({ entity: "stuff", text: null, category: null, isInStock: null, stockMin: null, stockMax: null });
const plan = (search) => ({ command: { kind: "search", search }, assumptions: [], message: "Пошук" });
const request = (extra = {}) => ({ prompt: "Покажи спеції", selected: null, previousSearch: null, clarification: null, ...extra });
const row = (id) => ({ id, title: `Запис ${id}`, category: "SPICES", isInStock: true, inStock: 3, spicy: 1, isHidden: false, isConfirmed: true });

beforeEach(() => {
  state = { admin: true, authChecks: 0, apiCalls: [], reads: [], writes: [], storageDeletes: [], references: [], allowWrites: false, rows: { ingredient: [], recipe: [], stuff: [] }, records: { ingredient: null, recipe: null, stuff: null }, plan: plan(ingredient) };
  process.env.OPENAI_API_KEY = "mock-key";
  process.env.OPENAI_MODEL = "gpt-6-luna";
  global.fetch = async (_url, options) => {
    state.apiCalls.push(JSON.parse(options.body));
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(state.plan) }] }] });
  };
});

after(() => {
  Module._load = originalLoad;
  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = originalModel;
});

test("search schemas reject invented fields, invalid entity categories, IDs and pages", () => {
  for (const value of [{ ...ingredient, sql: "DROP TABLE" }, { ...stuff, category: "SPICES" }, { ...recipe, spicyMax: 5 }, { ...stuff, stockMin: -1 }]) {
    assert.equal(schemas.inventorySearchSchema.safeParse(value).success, false);
  }
  for (const id of [0, -1, 1.5, "1", Number.MAX_SAFE_INTEGER]) assert.equal(schemas.recordSelectionSchema.safeParse({ entity: "recipe", id }).success, false);
  assert.equal(schemas.searchPageSchema.safeParse(-1).success, false);
  assert.equal(schemas.assistantRequestSchema.safeParse(request({ prompt: " " })).success, false);
});

test("ingredient search preserves false flags and escapes literal LIKE characters", () => {
  assert.deepEqual(ingredientWhere({ ...ingredient, text: "50%_\\", category: "SPICES", isInStock: false, isSaved: false }), {
    OR: [{ title: { contains: "50\\%\\_\\\\", mode: "insensitive" } }, { description: { contains: "50\\%\\_\\\\", mode: "insensitive" } }],
    category: "SPICES", isInStock: false, isSaved: false,
  });
});

test("recipe search requires every included ingredient and excludes every excluded ingredient", () => {
  const where = recipeWhere({ ...recipe, category: "SAUCES", isHidden: true, isConfirmed: false, includeIngredients: ["часник", "сіль"], excludeIngredients: ["цукор"] });
  assert.equal(where.category, "SAUCES");
  assert.equal(where.isHidden, true);
  assert.equal(where.isConfirmed, false);
  assert.deepEqual(where.AND, [
    { ingredients: { some: { ingredient: { title: { contains: "часник", mode: "insensitive" } } } } },
    { ingredients: { some: { ingredient: { title: { contains: "сіль", mode: "insensitive" } } } } },
    { ingredients: { none: { ingredient: { title: { contains: "цукор", mode: "insensitive" } } } } },
  ]);
});

test("ready-to-cook excludes empty compositions and differs from finished-product availability", () => {
  const ready = recipeWhere({ ...recipe, readyToCook: true, isInStock: false, spicyMin: 0, spicyMax: 2 });
  assert.deepEqual(ready.spicy, { gte: 0, lte: 2 });
  assert.deepEqual(ready.AND, [
    { variants: { none: { inStock: { gt: 0 } } } },
    { ingredients: { some: {} } },
    { ingredients: { none: { ingredient: { isInStock: false } } } },
  ]);
  const notReady = recipeWhere({ ...recipe, readyToCook: false });
  assert.equal(notReady.AND[0].OR.length, 2);
});

test("stuff uses inclusive stock ranges without dropping zero", () => {
  assert.deepEqual(stuffWhere({ ...stuff, stockMin: 0, stockMax: 9, isInStock: false }).AND, [
    { inStock: 0 }, { inStock: { gte: 0 } }, { inStock: { lte: 9 } },
  ]);
});

test("search pages are bounded, deterministic, and can load more without an AI call", async () => {
  state.rows.ingredient = Array.from({ length: 42 }, (_, index) => row(index + 1));
  const first = await actions.searchInventoryRecords(ingredient);
  assert.equal(first.ok, true);
  assert.equal(first.data.items.length, 20);
  assert.equal(first.data.hasMore, true);
  const second = await actions.searchInventoryRecords(ingredient, 1);
  assert.equal(second.data.items[0].id, 21);
  assert.deepEqual(state.reads[1].args.orderBy, [{ title: "asc" }, { id: "asc" }]);
  assert.equal(state.reads[1].args.take, 21);
  assert.equal(state.apiCalls.length, 0);
});

test("cross-entity search returns each type, including identical IDs, and caps each group", async () => {
  state.rows.ingredient = Array.from({ length: 21 }, (_, index) => row(index + 1));
  state.rows.recipe = [row(1)];
  state.rows.stuff = [{ ...row(1), category: "JARS" }];
  const result = await actions.searchInventoryRecords({ entity: "all", text: "Запис" });
  assert.equal(result.ok, true);
  assert.equal(result.data.items.length, 22);
  assert.equal(result.data.hasMore, true);
  assert.deepEqual(result.data.items.filter((item) => item.id === 1).map((item) => item.entity), ["ingredient", "recipe", "stuff"]);
});

test("AI search runs validated database reads and carries prior filters for refinements", async () => {
  state.plan = plan({ ...ingredient, isInStock: true });
  state.rows.ingredient = [row(7)];
  const result = await actions.askInventoryAssistant(request({ prompt: "А лише наявні", previousSearch: ingredient }));
  assert.equal(result.ok, true);
  assert.equal(result.data.operation, "search");
  assert.equal(result.data.results.items[0].id, 7);
  assert.equal(state.reads[0].args.where.isInStock, true);
  assert.deepEqual(JSON.parse(state.apiCalls[0].input).previousSearch, ingredient);
  assert.equal(state.apiCalls[0].store, false);
  assert.deepEqual(state.apiCalls[0].reasoning, { effort: "none" });
});

test("selection and follow-up read current recipe composition; only identity is sent to AI", async () => {
  state.records.recipe = { ...row(5), description: "PRIVATE DESCRIPTION", notes: "PRIVATE NOTES", series: "DEFAULT", isSaved: false, confirmationNotes: null,
    ingredients: [{ amount: "20 г", ingredient: { id: 3, title: "Часник", isInStock: false } }], variants: [{ label: "250 мл", inStock: 4 }] };
  const selection = { entity: "recipe", id: 5 };
  const selected = await actions.getInventoryRecord(selection);
  assert.equal(selected.ok, true);
  assert.equal(selected.data.ingredients[0].amount, "20 г");
  assert.equal(state.apiCalls.length, 0);
  state.records.recipe.ingredients[0].amount = "30 г";
  state.plan = { ...plan(null), command: { kind: "viewSelected" } };
  const reply = await actions.askInventoryAssistant(request({ prompt: "Покажи її склад", selected: selection }));
  assert.equal(reply.data.record.ingredients[0].amount, "30 г");
  assert.deepEqual(JSON.parse(state.apiCalls[0].input).selected, { ...selection, title: "Запис 5" });
  assert.equal(state.apiCalls[0].input.includes("PRIVATE"), false);
});

test("ingredient and stuff details come from database records, without the AI", async () => {
  state.records.ingredient = { ...row(2), description: "Опис", isSaved: true, _count: { recipeIngredients: 3 } };
  state.records.stuff = { ...row(3), category: "JARS", description: "Скляні", inStock: 8 };
  assert.equal((await actions.getInventoryRecord({ entity: "ingredient", id: 2 })).data.fields.find((field) => field.label === "Використовується в рецептах").value, "3");
  assert.equal((await actions.getInventoryRecord({ entity: "stuff", id: 3 })).data.fields.find((field) => field.label === "Залишок").value, "8");
  assert.equal(state.apiCalls.length, 0);
});

test("non-admin callers cannot trigger any provider or database reads", async (t) => {
  t.mock.method(console, "error", () => {});
  state.admin = false;
  for (const result of [await actions.askInventoryAssistant(request()), await actions.searchInventoryRecords(ingredient), await actions.getInventoryRecord({ entity: "recipe", id: 1 }), await actions.confirmInventoryMutation({ kind: "createStuff", after: { title: "Стрічка", description: "", category: "DECOR", inStock: 0 } })]) assert.equal(result.ok, false);
  assert.equal(state.authChecks, 4);
  assert.equal(state.reads.length, 0);
  assert.equal(state.apiCalls.length, 0);
});

test("invalid ranges, missing selection and deleted records fail without fabricating results", async (t) => {
  t.mock.method(console, "error", () => {});
  assert.equal((await actions.searchInventoryRecords({ ...stuff, stockMin: 10, stockMax: 2 })).ok, false);
  assert.equal((await actions.searchInventoryRecords({ ...recipe, spicyMin: 4, spicyMax: 1 })).ok, false);
  assert.equal(state.reads.length, 0);
  state.plan = { ...plan(null), command: { kind: "viewSelected" } };
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  const apiCount = state.apiCalls.length;
  const missing = await actions.askInventoryAssistant(request({ selected: { entity: "recipe", id: 999 } }));
  assert.equal(missing.data.operation, "requestBlocked");
  assert.equal(missing.data.code, "NOT_FOUND");
  assert.equal(state.apiCalls.length, apiCount + 1);
});

test("unsupported and contradictory model plans cannot cause a search or mutation", async (t) => {
  t.mock.method(console, "error", () => {});
  state.plan = { ...plan(null), command: { kind: "unsupported" }, message: "Зміна поки не підтримується." };
  const reply = await actions.askInventoryAssistant(request({ prompt: "Видали всі рецепти" }));
  assert.equal(reply.data.operation, "unsupported");
  state.plan = { ...plan(null), command: { kind: "viewSelected", search: ingredient } };
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  state.plan = { ...plan(null), command: { kind: "deleteRecipe" } };
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  assert.equal(state.reads.length, 0);
});

test("ingredient creation uses the common preview and confirmation pipeline", async () => {
  const data = { title: "Куркума", description: "", category: "SPICES", isInStock: false, isSaved: false };
  state.plan = mutationPlan({ kind: "createIngredient", data });
  const reply = await actions.askInventoryAssistant(request({ prompt: "Додай інгредієнт куркума" }));
  assert.equal(reply.ok, true);
  assert.equal(reply.data.operation, "mutation");
  assert.equal(reply.data.preview.kind, "createIngredient");
  assert.deepEqual(reply.data.preview.after, data);
  assert.equal(state.writes.length, 0);
  state.allowWrites = true;
  const saved = await actions.confirmInventoryMutation(reply.data.preview);
  assert.equal(saved.ok, true);
  assert.equal(saved.data.operation, "created");
  assert.equal(saved.data.entity, "ingredient");
  assert.equal(state.records.ingredient.title, data.title);
  assert.equal(state.apiCalls.length, 1);
});

test("strict model JSON Schema has required fields and uses supported anyOf branches", async () => {
  await actions.askInventoryAssistant(request());
  const format = state.apiCalls[0].text.format;
  assert.equal(format.strict, true);
  const inspect = (schema) => {
    if (!schema || typeof schema !== "object") return;
    if (schema.type === "object") {
      assert.equal(schema.additionalProperties, false);
      assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort());
    }
    assert.equal("oneOf" in schema, false);
    assert.equal("default" in schema, false);
    for (const value of Object.values(schema)) {
      if (Array.isArray(value)) value.forEach(inspect); else inspect(value);
    }
  };
  inspect(format.schema);
});

test("refusals, incomplete and malformed provider responses return errors without reads", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const body of [
    { status: "incomplete", output: [] },
    { status: "completed", output: [{ type: "message", content: [{ type: "refusal" }] }] },
    { status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "not-json" }] }] },
  ]) {
    global.fetch = async () => Response.json(body);
    assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  }
  assert.equal(state.reads.length, 0);
});

const ingredientRecord = (overrides = {}) => ({ id: 1, title: "Куркума", description: null, category: "SPICES", isInStock: true, isSaved: true, updatedAt: new Date("2026-10-22T10:00:00.000Z"), imageKey: null, _count: { recipeIngredients: 0 }, ...overrides });
const stuffRecord = (overrides = {}) => ({ id: 2, title: "Слоїчки 250 мл", description: "Скляні", category: "JARS", inStock: 10, updatedAt: new Date("2026-10-22T10:00:00.000Z"), ...overrides });
const ingredientPatch = (values = {}) => ({ title: null, description: null, category: null, isInStock: null, isSaved: null, ...values });
const stuffPatch = (values = {}) => ({ title: null, description: null, category: null, stock: null, ...values });
function mutationPlan(mutation) { return { ...plan(null), command: { kind: "mutation", intent: mutation } }; }
async function previewMutation(intent, entity = "ingredient") {
  return actions.previewInventoryMutation(intent, { entity, id: entity === "ingredient" ? 1 : 2 });
}

test("ingredient patch preserves unspecified fields and null descriptions; confirmation writes once", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.ingredient = ingredientRecord();
  const intent = { kind: "updateIngredient", targetName: null, patch: ingredientPatch({ isInStock: false }) };
  const result = await previewMutation(intent);
  assert.equal(result.ok, true);
  assert.equal(state.writes.length, 0);
  assert.deepEqual(result.data.after, { title: "Куркума", description: null, category: "SPICES", isInStock: false, isSaved: true });
  state.allowWrites = true;
  assert.equal((await actions.confirmInventoryMutation(result.data)).ok, true);
  assert.equal(state.records.ingredient.isInStock, false);
  assert.equal(state.records.ingredient.isSaved, true);
  assert.equal((await actions.confirmInventoryMutation(result.data)).ok, false);
  assert.equal(state.writes.length, 1);
  assert.equal(state.apiCalls.length, 0);
});

test("ingredient rename, category, description clearing and saved status can be combined", async () => {
  state.records.ingredient = ingredientRecord({ description: "Старий опис" });
  const result = await previewMutation({ kind: "updateIngredient", targetName: null, patch: ingredientPatch({ title: "  Куркума мелена  ", description: "", category: "OTHER", isSaved: false }) });
  assert.equal(result.ok, true);
  assert.equal(result.data.after.title, "Куркума мелена");
  assert.equal(result.data.after.description, "");
  assert.equal(result.data.after.isSaved, false);
  assert.equal(result.data.after.isInStock, true);
  assert.equal(result.data.after.category, "OTHER");
});

test("unrelated updates preserve existing title whitespace rather than silently renaming", async () => {
  state.records.stuff = stuffRecord({ title: "  Слоїчки 250 мл  " });
  const preview = await previewMutation({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "set", value: 12 } }) }, "stuff");
  assert.equal(preview.data.after.title, "  Слоїчки 250 мл  ");
  state.allowWrites = true;
  assert.equal((await actions.confirmInventoryMutation(preview.data)).ok, true);
  assert.equal(state.records.stuff.title, "  Слоїчки 250 мл  ");
});

test("stuff stock previews compute signed adjustments and exact totals on the server", async () => {
  state.records.stuff = stuffRecord();
  for (const [mode, value, expected] of [["adjust", 5, 15], ["adjust", -3, 7], ["set", 30, 30], ["set", 0, 0]]) {
    const result = await previewMutation({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode, value } }) }, "stuff");
    assert.equal(result.ok, true);
    assert.equal(result.data.after.inStock, expected);
    assert.equal(result.data.after.description, "Скляні");
    assert.equal(state.writes.length, 0);
  }
});

test("stock underflow, overflow, fractions and no-op patches cannot produce writes", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.stuff = stuffRecord();
  for (const stock of [{ mode: "adjust", value: -11 }, { mode: "adjust", value: 2147483647 }, { mode: "set", value: -1 }, { mode: "set", value: 1.5 }, { mode: "adjust", value: 0 }]) {
    assert.equal((await previewMutation({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock }) }, "stuff")).ok, false);
  }
  state.records.ingredient = ingredientRecord();
  assert.equal((await previewMutation({ kind: "updateIngredient", targetName: null, patch: ingredientPatch() })).ok, false);
  assert.equal(state.writes.length, 0);
});

test("stale stock previews cannot overwrite intervening stock updates", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.stuff = stuffRecord();
  const preview = await previewMutation({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) }, "stuff");
  state.records.stuff.inStock = 20;
  state.records.stuff.updatedAt = new Date("2026-10-22T10:01:00.000Z");
  state.allowWrites = true;
  const result = await actions.confirmInventoryMutation(preview.data);
  assert.equal(result.ok, false);
  assert.match(result.message, /змінився/);
  assert.equal(state.records.stuff.inStock, 20);
  assert.equal(state.writes.length, 0);
});

test("named mutations resolve a unique exact title rather than an unrelated selection", async () => {
  state.rows.stuff = [stuffRecord()];
  state.records.stuff = stuffRecord();
  state.records.ingredient = ingredientRecord();
  state.plan = mutationPlan({ kind: "updateStuff", targetName: "слоїчки 250 мл", patch: stuffPatch({ stock: { mode: "set", value: 30 } }) });
  const reply = await actions.askInventoryAssistant(request({ selected: { entity: "ingredient", id: 1 } }));
  assert.equal(reply.ok, true);
  assert.equal(reply.data.operation, "mutation");
  assert.equal(reply.data.preview.target.id, 2);
  assert.equal(reply.data.preview.after.inStock, 30);
  assert.equal(state.writes.length, 0);
});

test("ambiguous names return candidates; choosing one prepares a preview without writing", async () => {
  state.rows.stuff = [stuffRecord(), stuffRecord({ id: 3, title: "Слоїчки 500 мл" })];
  const intent = { kind: "deleteStuff", targetName: "Слоїчки" };
  state.plan = mutationPlan(intent);
  const reply = await actions.askInventoryAssistant(request());
  assert.equal(reply.ok, true);
  assert.equal(reply.data.operation, "chooseRecord");
  assert.equal(reply.data.question.candidates.length, 2);
  state.records.stuff = stuffRecord();
  const resumed = await actions.resumeInventoryWrite({ pending: reply.data.pending, choice: { key: reply.data.question.key, selection: { entity: "stuff", id: 2 } }, page: null });
  const preview = resumed.ok ? { ok: true, data: resumed.data.preview } : resumed;
  assert.equal(preview.ok, true);
  assert.equal(preview.data.kind, "deleteStuff");
  assert.equal(preview.data.target.title, "Слоїчки 250 мл");
  assert.equal(state.writes.length, 0);
});

test("missing/mismatched selections and missing targets cannot prepare updates", async (t) => {
  t.mock.method(console, "error", () => {});
  const intent = { kind: "updateStuff", targetName: null, patch: stuffPatch({ title: "Нова назва" }) };
  assert.equal((await actions.previewInventoryMutation(intent, { entity: "ingredient", id: 1 })).ok, false);
  assert.equal((await actions.previewInventoryMutation(intent, { entity: "recipe", id: 1 })).ok, false);
  state.plan = mutationPlan(intent);
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  state.plan = mutationPlan({ ...intent, targetName: "Невідоме" });
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  assert.equal(state.writes.length, 0);
});

test("stuff creation remains a draft until confirmed and duplicate titles return a clear error", async (t) => {
  t.mock.method(console, "error", () => {});
  state.plan = mutationPlan({ kind: "createStuff", data: { title: "Стрічка", description: "", category: "DECOR", inStock: 0 } });
  const reply = await actions.askInventoryAssistant(request());
  assert.equal(reply.ok, true);
  assert.equal(reply.data.preview.kind, "createStuff");
  assert.equal(state.writes.length, 0);
  state.allowWrites = true;
  const saved = await actions.confirmInventoryMutation(reply.data.preview);
  assert.equal(saved.ok, true);
  assert.equal(saved.data.operation, "created");
  assert.equal(state.records.stuff.inStock, 0);
  state.writeError = "P2002";
  const duplicate = await actions.confirmInventoryMutation(reply.data.preview);
  assert.equal(duplicate.ok, false);
  assert.match(duplicate.message, /назвою вже існує/);
});

test("used ingredients cannot be deleted, including if attached after the preview", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.ingredient = ingredientRecord({ _count: { recipeIngredients: 1 }, imageKey: "ingredient-image" });
  const reference = { ingredientId: 1, recipeId: 7, recipe: { title: "Соус" } };
  state.references = [reference];
  const intent = { kind: "deleteIngredient", targetName: null };
  assert.equal((await previewMutation(intent)).ok, false);
  state.records.ingredient._count.recipeIngredients = 0;
  state.references = [];
  const preview = await previewMutation(intent);
  state.records.ingredient._count.recipeIngredients = 1;
  state.references = [reference];
  state.allowWrites = true;
  assert.equal((await actions.confirmInventoryMutation(preview.data)).ok, false);
  assert.equal(state.writes.length, 0);
  assert.equal(state.storageDeletes.length, 0);
});

test("stale deletes never remove images; confirmed deletes clean up only after deleting the row", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.ingredient = ingredientRecord({ imageKey: "ingredient-image" });
  const preview = await previewMutation({ kind: "deleteIngredient", targetName: null });
  state.records.ingredient.updatedAt = new Date("2026-10-22T10:01:00.000Z");
  state.allowWrites = true;
  assert.equal((await actions.confirmInventoryMutation(preview.data)).ok, false);
  assert.equal(state.storageDeletes.length, 0);
  const fresh = await previewMutation({ kind: "deleteIngredient", targetName: null });
  state.storageError = true;
  const deleted = await actions.confirmInventoryMutation(fresh.data);
  assert.equal(deleted.ok, true);
  assert.equal(deleted.data.operation, "deleted");
  assert.equal(state.records.ingredient, null);
  assert.deepEqual(state.storageDeletes, ["ingredient-image"]);
  assert.deepEqual(state.writes[0].args.where.recipeIngredients, { none: {} });
  assert.equal((await actions.confirmInventoryMutation(fresh.data)).ok, false);
  assert.equal(state.storageDeletes.length, 1);
});

test("stuff delete requires confirmation and an unchanged version", async () => {
  state.records.stuff = stuffRecord();
  const preview = await previewMutation({ kind: "deleteStuff", targetName: null }, "stuff");
  assert.equal(state.records.stuff.inStock, 10);
  state.allowWrites = true;
  assert.equal((await actions.confirmInventoryMutation(preview.data)).ok, true);
  assert.equal(state.records.stuff, null);
});

test("mutation actions require admin before reads or writes, even with a valid preview", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.stuff = stuffRecord();
  const intent = { kind: "deleteStuff", targetName: null };
  const preview = await previewMutation(intent, "stuff");
  state.admin = false;
  state.reads = [];
  assert.equal((await actions.previewInventoryMutation(intent, { entity: "stuff", id: 2 })).ok, false);
  assert.equal((await actions.confirmInventoryMutation(preview.data)).ok, false);
  assert.equal((await ingredientActions.createIngredient({ title: "Сіль", description: "", category: "SPICES", isInStock: true })).ok, false);
  assert.equal((await stuffActions.createStuff({ title: "Стрічка", category: "DECOR", inStock: 1 })).ok, false);
  assert.equal(state.reads.length, 0);
  assert.equal(state.writes.length, 0);
});

test("tampered previews reject extra fields, fractional stock and invalid categories", async (t) => {
  t.mock.method(console, "error", () => {});
  const data = { title: "Матеріал", description: "", category: "JARS", inStock: 1 };
  for (const after of [{ ...data, id: 999 }, { ...data, inStock: 1.5 }, { ...data, category: "SPICES" }, { ...data, title: " " }]) {
    assert.equal((await actions.confirmInventoryMutation({ kind: "createStuff", after })).ok, false);
  }
  assert.equal(state.writes.length, 0);
});

test("manual CRUD shares validation, preserves saved state, and accepts optional stuff descriptions", async (t) => {
  t.mock.method(console, "error", () => {});
  state.allowWrites = true;
  const invalidStuff = await stuffActions.createStuff({ title: "Слоїчки", category: "JARS", inStock: 1.5 });
  assert.equal(invalidStuff.ok, false);
  const created = await stuffActions.createStuff({ title: "  Стрічка  ", category: "DECOR", inStock: 3 });
  assert.equal(created.ok, true);
  assert.equal(created.data.title, "Стрічка");
  assert.equal(created.data.description, null);
  state.records.ingredient = ingredientRecord();
  const edit = await ingredientActions.editIngredient(1, { title: "Куркума", description: "Опис", category: "SPICES", isInStock: false });
  assert.equal(edit.ok, true);
  assert.equal(state.records.ingredient.isSaved, true);
  assert.equal("isSaved" in state.writes.at(-1).args.data, false);
});

function clarificationPlan(question, continuesPrevious = false) {
  return { command: { kind: "clarify", continuesPrevious }, assumptions: [], message: question };
}

test("a short stock answer resumes the original request and still requires confirmation", async () => {
  state.records.stuff = stuffRecord();
  const selected = { entity: "stuff", id: 2 };
  state.plan = clarificationPlan("Який точний залишок встановити?");
  const first = await actions.askInventoryAssistant(request({ prompt: "Встанови інший залишок обраного матеріалу", selected, previousSearch: stuff }));
  assert.equal(first.ok, true);
  assert.equal(first.data.operation, "clarify");
  assert.equal(first.data.clarification.originalPrompt, "Встанови інший залишок обраного матеріалу");
  assert.deepEqual(first.data.clarification.turns, []);
  assert.deepEqual(first.data.clarification.selected, selected);
  state.plan = mutationPlan({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "set", value: 30 } }) });
  const answer = await actions.askInventoryAssistant(request({ prompt: "30", selected, previousSearch: stuff, clarification: first.data.clarification }));
  assert.equal(answer.ok, true);
  assert.equal(answer.data.operation, "mutation");
  assert.equal(answer.data.preview.before.inStock, 10);
  assert.equal(answer.data.preview.after.inStock, 30);
  const sent = JSON.parse(state.apiCalls[1].input);
  assert.equal(sent.prompt, "30");
  assert.equal(sent.clarification.originalPrompt, first.data.clarification.originalPrompt);
  assert.equal(sent.clarification.question, "Який точний залишок встановити?");
  assert.equal(state.writes.length, 0);
  assert.equal("clarification" in answer.data, false);
});

test("multiple clarification turns preserve earlier questions and answers without inventing a summary", async () => {
  state.plan = clarificationPlan("Яку назву інгредієнта вказати?");
  const first = await actions.askInventoryAssistant(request({ prompt: "Створи інгредієнт, але спочатку уточни назву та категорію" }));
  state.plan = clarificationPlan("Яку категорію обрати?", true);
  const second = await actions.askInventoryAssistant(request({ prompt: "Куркума", clarification: first.data.clarification }));
  assert.equal(second.ok, true);
  assert.equal(second.data.clarification.originalPrompt, first.data.clarification.originalPrompt);
  assert.deepEqual(second.data.clarification.turns, [{ question: "Яку назву інгредієнта вказати?", answer: "Куркума" }]);
  state.plan = mutationPlan({ kind: "createIngredient", data: { title: "Куркума", description: "", category: "SPICES", isInStock: false, isSaved: false } });
  const third = await actions.askInventoryAssistant(request({ prompt: "Спеції", clarification: second.data.clarification }));
  assert.equal(third.data.preview.after.title, "Куркума");
  const context = JSON.parse(state.apiCalls[2].input).clarification;
  assert.equal(context.turns[0].answer, "Куркума");
  assert.equal(context.question, "Яку категорію обрати?");
  assert.equal(state.writes.length, 0);
});

test("an independent clarification replaces the previous pending request", async () => {
  state.plan = clarificationPlan("Скільки слоїчків?");
  const first = await actions.askInventoryAssistant(request({ prompt: "Створи новий матеріал слоїчки та уточни кількість" }));
  state.plan = clarificationPlan("Який саме інгредієнт?", false);
  const second = await actions.askInventoryAssistant(request({ prompt: "Інший запит: знайди інгредієнт", clarification: first.data.clarification }));
  assert.equal(second.data.clarification.originalPrompt, "Інший запит: знайди інгредієнт");
  assert.deepEqual(second.data.clarification.turns, []);
  assert.equal(second.data.clarification.question, "Який саме інгредієнт?");
});

test("clearing clarification removes the original request from subsequent model input", async () => {
  state.plan = clarificationPlan("Який залишок?");
  const first = await actions.askInventoryAssistant(request({ prompt: "Уточни залишок для нового матеріалу" }));
  assert.equal(first.data.operation, "clarify");
  state.plan = plan(ingredient);
  const next = await actions.askInventoryAssistant(request({ prompt: "Покажи всі інгредієнти", clarification: null }));
  assert.equal(next.data.operation, "search");
  const sent = JSON.parse(state.apiCalls[1].input);
  assert.equal(sent.clarification, null);
  assert.equal(state.apiCalls[1].input.includes("Уточни залишок"), false);
});

test("clarifications remain bound to the selected record and its previous search", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.stuff = stuffRecord();
  const selected = { entity: "stuff", id: 2 };
  state.plan = clarificationPlan("Який залишок?");
  const first = await actions.askInventoryAssistant(request({ prompt: "Встанови залишок", selected, previousSearch: stuff }));
  const calls = state.apiCalls.length;
  state.plan = mutationPlan({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "set", value: 30 } }) });
  const mismatch = await actions.askInventoryAssistant(request({ prompt: "30", selected: { entity: "stuff", id: 3 }, clarification: first.data.clarification }));
  assert.equal(mismatch.data.operation, "requestBlocked");
  assert.match(mismatch.data.message, /Вибір запису змінився/);
  assert.equal(state.apiCalls.length, calls + 1, "scope is planned before validating continuation binding");
  state.plan = clarificationPlan("Потрібна точна кількість?", true);
  const next = await actions.askInventoryAssistant(request({ prompt: "так", selected, previousSearch: ingredient, clarification: first.data.clarification }));
  assert.equal(next.ok, true);
  assert.deepEqual(JSON.parse(state.apiCalls.at(-1).input).clarification.previousSearch, stuff);
  assert.deepEqual(next.data.clarification.previousSearch, stuff);
  assert.equal(state.writes.length, 0);
});

test("oversized or exhausted clarification contexts are rejected with no database writes", async (t) => {
  t.mock.method(console, "error", () => {});
  const context = {
    originalPrompt: "Створи матеріал", question: "Який саме?", selected: null, previousSearch: null,
    turns: Array.from({ length: schemas.MAX_CLARIFICATION_TURNS }, () => ({ question: "Який саме?", answer: "Уточнення" })),
  };
  state.plan = clarificationPlan("Ще одне питання?", true);
  const exhausted = await actions.askInventoryAssistant(request({ prompt: "Уточнення", clarification: context }));
  assert.equal(exhausted.ok, false);
  assert.match(exhausted.message, /ліміт уточнень/);
  const calls = state.apiCalls.length;
  for (const invalid of [{ ...context, originalPrompt: "x".repeat(12001) }, { ...context, turns: [...context.turns, context.turns[0]] }, { ...context, question: "" }]) {
    assert.equal((await actions.askInventoryAssistant(request({ clarification: invalid }))).ok, false);
  }
  assert.equal(state.apiCalls.length, calls);
  assert.equal(state.writes.length, 0);
});

test("the model cannot continue a nonexistent clarification or mix command payloads", async (t) => {
  t.mock.method(console, "error", () => {});
  state.plan = clarificationPlan("Яка кількість?", true);
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  state.plan = { message: "Пошук", assumptions: [], command: { kind: "search", search: ingredient, intent: { kind: "deleteStuff", targetName: null } } };
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  assert.equal(state.reads.length, 0);
  assert.equal(state.writes.length, 0);
});

test("ingredient and stuff creation use the same typed command and preview actions", async () => {
  for (const [kind, entity, data] of [
    ["createIngredient", "ingredient", { title: "Куркума", description: "", category: "SPICES", isInStock: true, isSaved: true }],
    ["createStuff", "stuff", { title: "Слоїчки", description: "", category: "JARS", inStock: 30 }],
  ]) {
    const prepared = await actions.previewInventoryMutation({ kind, data }, { entity, id: 1 });
    assert.equal(prepared.ok, true);
    assert.deepEqual(prepared.data, { kind, after: data });
    state.allowWrites = true;
    const saved = await actions.confirmInventoryMutation(prepared.data);
    assert.equal(saved.ok, true);
    assert.equal(saved.data.operation, "created");
    assert.equal(saved.data.entity, entity);
  }
  assert.equal(state.records.ingredient.isSaved, true);
  assert.equal(state.apiCalls.length, 0);
});

test("planner receives Ukrainian entity vocabulary and safe interpretation examples", async () => {
  state.plan = plan(stuff);
  const result = await actions.askInventoryAssistant(request({ prompt: "Покажи всі матеріали" }));
  assert.equal(result.ok, true);
  const instructions = state.apiCalls[0].instructions;
  for (const phrase of ["матеріалів", "складників", "баночок", "Матеріали is the entire stuff ENTITY", "stockMax 9", "deleteStuff; preview required", "додай банки is ambiguous", "Preserve quoted record titles"]) assert.ok(instructions.includes(phrase), phrase);
  assert.deepEqual(result.data.results.search, stuff);
  assert.equal(state.writes.length, 0);
});

test("shared context filters preserve false, zero and Ukrainian labels", () => {
  const { searchFilters } = require("../lib/ai/search-labels.ts");
  assert.deepEqual(searchFilters({ ...stuff, category: "JARS", isInStock: false, stockMin: 0 }), ["Категорія: Слоїчки", "У наявності: Ні", "Залишок від: 0"]);
  assert.deepEqual(searchFilters({ ...recipe, series: "DEFAULT", includeIngredients: ["часник", "сіль"] }), ["Серія: Стандарт", "Містить усі: часник, сіль"]);
  assert.deepEqual(searchFilters(ingredient), []);
});

test("batch summary includes only changed fields and preserves false/zero values", () => {
  const { previewSummary, snapshotRows } = require("../lib/ai/preview-summary.ts");
  const before = { title: "Банка", description: "Скло", category: "JARS", inStock: 5 };
  const preview = { kind: "updateStuff", target: { id: 1, title: "Банка", updatedAt: new Date().toISOString() }, before, after: { ...before, inStock: 0 } };
  assert.deepEqual(previewSummary(preview), { title: "Банка", rows: [{ label: "Залишок", before: "5", after: "0" }] });
  assert.equal(snapshotRows(preview.after).length, 4);
  assert.equal(snapshotRows({ title: "Сіль", description: "", category: "OTHER", isSaved: false, isInStock: false }).find((row) => row.label === "У наявності").after, "Ні");
});

test("recipe batch summary shows composition additions, removals and amount changes without unchanged ingredients", () => {
  const { previewSummary, snapshotRows } = require("../lib/ai/preview-summary.ts");
  const fields = { title: "Приправа", description: "", notes: "", confirmationNotes: null, category: "SPICES", series: "DEFAULT", spicy: 0, isHidden: true, isSaved: false, isConfirmed: false };
  const entry = (id, title, amount) => ({ id, title, amount, category: "SPICES", updatedAt: id === null ? null : "2026-01-01T00:00:00.000Z" });
  const before = { fields, ingredients: [entry(1, "Сіль", "10 г"), entry(2, "Часник", "2 г"), entry(3, "Перець", "1 г")] };
  const after = { fields, ingredients: [entry(1, "Сіль", "10 г"), entry(2, "Часник", "4 г"), entry(null, "Кмин", "3 г")] };
  const result = previewSummary({ kind: "updateRecipe", before, after });
  assert.deepEqual(result.rows, [
    { label: "Склад: Часник", before: "2 г", after: "4 г" },
    { label: "Склад: Перець", before: "1 г", after: null },
    { label: "Склад: Кмин (новий інгредієнт)", before: null, after: "3 г" },
  ]);
  assert.equal(snapshotRows(before).some((row) => row.label === "Склад: Сіль"), true);
  assert.equal(snapshotRows({ fields, ingredients: [] }).at(-1).after, "Інгредієнтів немає");
});

test("delete summaries retain the exact target title and full snapshot", () => {
  const { previewSummary, snapshotRows } = require("../lib/ai/preview-summary.ts");
  const before = { title: "  Сіль  ", description: "", category: "OTHER", isInStock: false, isSaved: true };
  const result = previewSummary({ kind: "deleteIngredient", before });
  assert.equal(result.title, before.title);
  assert.equal(result.rows.every((row) => row.after === null), true);
  assert.equal(snapshotRows(before).find((row) => row.label === "Збережений").after, "Так");
});


test("recipe ingredient categories can be omitted without weakening confirmed snapshots", () => {
  const { namedRecipeIngredientSchema, recipeIngredientReferenceSchema } = require("../zod/ai-recipe.schema.ts");
  assert.equal(namedRecipeIngredientSchema.safeParse({ title: "Сіль", amount: "5 г", category: null }).success, true);
  assert.equal(recipeIngredientReferenceSchema.safeParse({ title: "Сіль", amount: "5 г", category: null, id: null, updatedAt: null }).success, false);
});


test("name matching prefers exact titles, allows unique substrings and retains ambiguity", () => {
  const { matchNames } = require("../lib/ai/name-resolution.ts");
  const names = [{ title: "Часник" }, { title: "Тест часник" }, { title: "Часник сушений" }];
  assert.deepEqual(matchNames("Часник", names), [names[0]]);
  assert.deepEqual(matchNames("часник", names), [names[0]]);
  assert.deepEqual(matchNames("сушений", names), [names[2]]);
  assert.equal(matchNames("час", names).length, 3);
  assert.equal(matchNames("часнк", names).length, 3);
  assert.deepEqual(matchNames("%", names), []);
});

test("AI provider failures return structured codes without leaking provider bodies", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const [status, code] of [[429, "PROVIDER_LIMIT"], [503, "PROVIDER_UNAVAILABLE"], [401, "PROVIDER_CONFIGURATION"]]) {
    global.fetch = async () => new Response("PRIVATE PROVIDER BODY", { status });
    const reply = await actions.askInventoryAssistant(request());
    assert.equal(reply.ok, false);
    assert.equal(reply.code, code);
    assert.equal(reply.message.includes("PRIVATE"), false);
  }
  global.fetch = async () => { throw new Error("network credentials detail"); };
  const failed = await actions.askInventoryAssistant(request());
  assert.equal(failed.code, "PROVIDER_UNAVAILABLE");
  assert.equal(failed.message.includes("credentials"), false);
  assert.equal(state.writes.length, 0);
});

test("confirmation returns distinct stale, conflict and validation codes", async (t) => {
  t.mock.method(console, "error", () => {});
  state.allowWrites = true;
  state.records.stuff = stuffRecord();
  const prepared = await actions.previewInventoryMutation({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "adjust", value: 1 } }) }, { entity: "stuff", id: 2 });
  assert.equal(prepared.ok, true);
  state.writeError = "P2025";
  assert.equal((await actions.confirmInventoryMutation(prepared.data)).code, "STALE_PREVIEW");
  state.writeError = "P2002";
  assert.equal((await actions.confirmInventoryMutation(prepared.data)).code, "CONFLICT");
  assert.equal((await actions.confirmInventoryBatch({ items: [], unchanged: [] })).code, "VALIDATION_ERROR");
});

test("recovery never retries uncertain writes and separates refresh-only failures", () => {
  const { confirmationFailure, recoveryFor } = require("../lib/ai/request-state.ts");
  assert.equal(confirmationFailure(undefined), "SAVE_UNCERTAIN");
  assert.equal(confirmationFailure("INTERNAL_ERROR"), "SAVE_UNCERTAIN");
  assert.equal(confirmationFailure("STALE_PREVIEW"), "STALE_PREVIEW");
  assert.equal(recoveryFor("SAVE_UNCERTAIN").action, "inspect");
  assert.equal(recoveryFor("REFRESH_FAILED").action, "refresh");
  assert.equal(recoveryFor("STALE_PREVIEW").action, "prepare");
  assert.equal(recoveryFor("VALIDATION_ERROR").action, "edit");
  assert.equal(recoveryFor("PROVIDER_UNAVAILABLE").action, "edit");
  assert.equal(recoveryFor("UNAUTHORIZED").action, "none");
});

test("post-save recovery retries only reads and reports resolved search failures", async () => {
  const { refreshAfterSave } = require("../lib/ai/refresh-after-save.ts");
  const written = [{ entity: "stuff", id: 2, title: "Банка", operation: "updated" }];
  let reads = 0;
  let fail = true;
  const record = { entity: "stuff", id: 2, title: "Банка" };
  const results = { search: stuff, items: [], hasMore: false, page: 0 };
  const readers = {
    invalidate: async () => {},
    record: async () => { reads++; return { ok: true, data: record }; },
    search: async () => { reads++; return fail ? { ok: false, message: "offline" } : { ok: true, data: results }; },
  };
  const first = await refreshAfterSave(written, stuff, readers);
  assert.equal(first.failed, true);
  assert.deepEqual(first.selected, record);
  assert.equal(first.results, null);
  fail = false;
  const second = await refreshAfterSave(written, stuff, readers);
  assert.equal(second.failed, false);
  assert.deepEqual(second.results, results);
  assert.equal(reads, 4);
  assert.equal(state.writes.length, 0);
});

test("refresh handles thrown failures and never reloads a deleted record", async () => {
  const { refreshAfterSave } = require("../lib/ai/refresh-after-save.ts");
  let recordCalls = 0;
  const output = await refreshAfterSave([{ entity: "stuff", id: 2, title: "Банка", operation: "deleted" }], stuff, {
    invalidate: async () => { throw new Error("cache offline"); },
    record: async () => { recordCalls++; throw new Error("must not load"); },
    search: async () => { throw new Error("network offline"); },
  });
  assert.equal(recordCalls, 0);
  assert.deepEqual(output, { selected: null, results: null, failed: true });
});

test("single no-op requests succeed without a preview, write or error log", async (t) => {
  const logger = t.mock.method(console, "error", () => {});
  state.records.ingredient = ingredientRecord();
  state.plan = mutationPlan({ kind: "updateIngredient", targetName: null, patch: ingredientPatch({ isInStock: state.records.ingredient.isInStock }) });
  const response = await actions.askInventoryAssistant(request({ selected: { entity: "ingredient", id: 1 } }));
  assert.equal(response.ok, true);
  assert.equal(response.data.operation, "noChanges");
  assert.match(response.data.message, /Змін не потрібно/);
  assert.ok(response.data.message.includes(state.records.ingredient.title));
  assert.equal("preview" in response.data, false);
  assert.equal(state.writes.length, 0);
  assert.equal(logger.mock.callCount(), 0);
});

test("all-unchanged batches are neutral while mixed batches retain changed operations", async () => {
  state.records.ingredient = ingredientRecord();
  state.records.stuff = stuffRecord();
  const unchanged = { kind: "updateIngredient", targetName: null, patch: ingredientPatch({ isInStock: state.records.ingredient.isInStock }) };
  state.plan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "list", operations: [unchanged] } } };
  const context = request({ selected: { entity: "ingredient", id: 1 } });
  const all = await actions.askInventoryAssistant(context);
  assert.equal(all.ok, true);
  assert.equal(all.data.operation, "noChanges");
  state.plan.command.intent.operations.push({ kind: "updateStuff", targetName: "Слоїчки 250 мл", patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) });
  state.rows.stuff = [state.records.stuff];
  const mixed = await actions.askInventoryAssistant(context);
  assert.equal(mixed.ok, true);
  assert.equal(mixed.data.operation, "batch");
  assert.equal(mixed.data.preview.items.length, 1);
  assert.equal(mixed.data.preview.items[0].kind, "updateStuff");
  assert.equal(mixed.data.preview.unchanged.length, 1);
  assert.equal(state.writes.length, 0);
});

test("no-op target selection returns a dedicated neutral code", async (t) => {
  const logger = t.mock.method(console, "error", () => {});
  state.records.stuff = stuffRecord();
  const response = await actions.previewInventoryMutation({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "set", value: state.records.stuff.inStock } }) }, { entity: "stuff", id: 2 });
  assert.equal(response.ok, false);
  assert.equal(response.code, "NO_CHANGES");
  assert.equal(logger.mock.callCount(), 0);
  assert.equal(state.writes.length, 0);
});

test("preview presentation distinguishes one operation from real batches", () => {
  const { previewPresentation } = require("../lib/ai/preview-summary.ts");
  const one = { kind: "updateStuff" };
  assert.deepEqual(previewPresentation([one]), { heading: "Оновлення матеріалу", confirmation: "Підтвердити зміни" });
  assert.equal(previewPresentation([{ kind: "createRecipe" }]).heading, "Створення рецепта");
  assert.equal(previewPresentation([{ kind: "deleteIngredient" }]).confirmation, "Підтвердити видалення");
  assert.equal(previewPresentation([one, one]).heading, "Перегляд пакета · 2 операції");
  assert.equal(previewPresentation(Array(12).fill(one)).heading, "Перегляд пакета · 12 операцій");
});

test("single and batch previews render shared cards while creation forms remain editable", () => {
  const originalTsx = require.extensions[".tsx"];
  require.extensions[".tsx"] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, file);
  try {
    const React = require("react");
    const { renderToStaticMarkup } = require("react-dom/server");
    const View = require("../app/(admin)/admin/ai/_components/InventoryMutationView.tsx").default;
    const Batch = require("../app/(admin)/admin/ai/_components/InventoryBatchView.tsx").default;
    const before = { title: "Банка", description: "Скло", category: "JARS", inStock: 10 };
    const item = { kind: "updateStuff", target: { id: 2, title: before.title, updatedAt: "2026-01-01T00:00:00.000Z" }, before, after: { ...before, inStock: 15 } };
    const callbacks = { assumptions: [], busy: false, onConfirm() {}, onCancel() {}, onChange() {} };
    const single = renderToStaticMarkup(React.createElement(View, { ...callbacks, preview: item }));
    assert.ok(single.includes("Оновлення матеріалу"));
    assert.equal(single.includes("Перегляд пакета"), false);
    assert.ok(single.includes("Усі дані запису"));
    assert.equal(single.includes("<table"), false);
    const batch = renderToStaticMarkup(React.createElement(Batch, { ...callbacks, preview: { items: [item, { kind: "createStuff", after: { ...before, title: "Етикетка" } }], unchanged: [] } }));
    assert.ok(batch.includes("Запропоновані зміни"));
    assert.ok(batch.includes("Підтвердити всі 2"));
    const creation = renderToStaticMarkup(React.createElement(View, { ...callbacks, preview: { kind: "createStuff", after: before } }));
    assert.ok(creation.includes("<input"));
    assert.ok(creation.includes("<textarea"));
    assert.equal(creation.includes("disabled="), false);
    const defaults = renderToStaticMarkup(React.createElement(View, { ...callbacks, assumptions: ["Початковий залишок 10"], preview: { kind: "createStuff", after: before } }));
    assert.ok(defaults.includes("Початковий залишок 10"));
    assert.ok(defaults.includes('value="10"'), "actual proposed values remain visible/editable");
    assert.equal(/<details[^>]* open=""/.test(defaults), false, "explanations stay available without covering the form");
    const invalid = renderToStaticMarkup(React.createElement(View, { ...callbacks, preview: { kind: "createStuff", after: before }, status: "invalid", onPrepare() {} }));
    assert.ok(invalid.includes("<input"));
    assert.ok(invalid.includes("Перевірити пропозицію"));
    assert.equal(invalid.includes("Підтвердити створення"), false);
    assert.equal(invalid.includes("disabled="), false, "retained creation fields remain editable");
    for (const status of ["stale", "uncertain"]) {
      const retained = renderToStaticMarkup(React.createElement(View, { ...callbacks, preview: { kind: "createStuff", after: before }, status, onPrepare() {} }));
      assert.ok(retained.includes("Банка"));
      assert.equal(retained.includes("<input"), false, "expired or uncertain drafts are read-only");
      assert.equal(retained.includes("Підтвердити створення"), false);
      assert.equal(retained.includes("Ще нічого не збережено"), false);
      assert.equal(retained.includes('type="submit"'), status === "stale", "uncertain saves expose no retry control");
      assert.equal(retained.includes("Підготувати новий перегляд"), status === "stale");
    }
    const uncertainBatch = renderToStaticMarkup(React.createElement(Batch, { ...callbacks, preview: { items: [item, { kind: "createStuff", after: before }], unchanged: [] }, status: "uncertain", onPrepare() {} }));
    assert.equal(uncertainBatch.includes('type="submit"'), false);
    assert.equal(uncertainBatch.includes("Підтвердити всі"), false);
    assert.ok(uncertainBatch.includes("Прибрати пропозицію"));
    assert.ok(uncertainBatch.includes('href="/admin/ingredients"'));
    assert.ok(uncertainBatch.includes('href="/admin/recipes"'));
    assert.ok(uncertainBatch.includes('href="/admin/stuff"'));
    const deletion = renderToStaticMarkup(React.createElement(View, { ...callbacks, preview: { kind: "deleteStuff", target: item.target, before } }));
    assert.ok(deletion.includes("Підтвердити видалення"));
    assert.ok(deletion.includes("Запис буде видалено повністю"));
    const Choice = require("../app/(admin)/admin/ai/_components/RecordChoiceView.tsx").default;
    const choice = renderToStaticMarkup(React.createElement(Choice, {
      question: { key: "0:target", name: "Банка", context: "Операція 1", candidates: [{ entity: "stuff", id: 2, title: "Банка 250", summary: "Слоїчки" }], page: 0, hasMore: true },
      prompt: "Зміни банку та часник", busy: false, onChoose() {}, onPage() {}, onCancel() {},
    }));
    assert.ok(choice.includes("Обрати Банка 250"));
    assert.ok(choice.includes("Зміни банку та часник"));
    assert.ok(choice.includes("Скасувати весь запит"));
    const duplicateQuestion = { key: "0:createIngredient", name: "Куркумма", context: "Перевірка", purpose: "ingredientCreation", canCreate: true, candidates: [{ entity: "ingredient", id: 1, title: "Куркума", summary: "Спеції" }], page: 0, hasMore: false };
    const duplicateProps = { question: duplicateQuestion, prompt: "Створи Куркумма", busy: false, onChoose() {}, onCreateNew() {}, onPage() {}, onCancel() {} };
    const duplicate = renderToStaticMarkup(React.createElement(Choice, duplicateProps));
    assert.ok(duplicate.includes("Використати наявний Куркума"));
    assert.ok(duplicate.includes("Це інший інгредієнт — створити окремий"));
    const exactDuplicate = renderToStaticMarkup(React.createElement(Choice, { ...duplicateProps, question: { ...duplicateQuestion, canCreate: false } }));
    assert.equal(exactDuplicate.includes("Це інший інгредієнт — створити окремий"), false);
    assert.ok(exactDuplicate.includes("Ця назва вже зайнята"));
    assert.ok(choice.includes("Далі"));
    assert.equal(choice.includes('type="submit"'), false);
    assert.equal(choice.includes("#2"), false, "unique candidates do not expose internal IDs");
    const sameTitle = renderToStaticMarkup(React.createElement(Choice, { ...duplicateProps, question: { ...duplicateQuestion, candidates: [...duplicateQuestion.candidates, { ...duplicateQuestion.candidates[0], id: 2, title: "куркума" }] } }));
    assert.ok(sameTitle.includes("#1") && sameTitle.includes("#2"), "otherwise identical candidates remain distinguishable");
    const { InventoryRecordView } = require("../app/(admin)/admin/ai/_components/InventorySearchView.tsx");
    const selected = { entity: "recipe", id: 77, title: "Соус", summary: "Соуси", fields: [{ label: "Опис", value: "Гострий" }], ingredients: [{ id: 1, title: "Куркума", amount: "5 г", isInStock: true }] };
    const compact = renderToStaticMarkup(React.createElement(InventoryRecordView, { record: selected, busy: false, onClear() {} }));
    assert.equal(/<details[^>]* open=""/.test(compact), false);
    assert.ok(compact.includes("Куркума") && compact.includes("Гострий"), "collapsed record data remains available");
    const expanded = renderToStaticMarkup(React.createElement(InventoryRecordView, { record: selected, expanded: true, busy: false, onClear() {} }));
    assert.equal(/<details[^>]* open=""/.test(expanded), true, "explicit detail requests can expose composition immediately");
    const ErrorPanel = require("../app/(admin)/admin/ai/_components/AssistantErrorPanel.tsx").default;
    const recovery = renderToStaticMarkup(React.createElement(ErrorPanel, { error: "Запис змінився", code: "STALE_PREVIEW", busy: false, canEdit: true, showPrepare: false, onEdit() {}, onPrepare() {}, onRefresh() {} }));
    assert.ok(recovery.includes("Редагувати запит"));
    assert.equal(recovery.includes("Підготувати новий перегляд"), false, "the retained preview owns its primary recovery action");
  } finally {
    if (originalTsx) require.extensions[".tsx"] = originalTsx;
    else delete require.extensions[".tsx"];
  }
});

test("unquoted partial names in mixed batches reach server resolution without losing operations", async () => {
  state.records.stuff = stuffRecord();
  state.rows.stuff = [state.records.stuff];
  state.records.ingredient = ingredientRecord({ isInStock: true });
  state.rows.ingredient = [state.records.ingredient];
  state.plan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "list", operations: [
    { kind: "updateStuff", targetName: "Слоїчки", patch: stuffPatch({ stock: { mode: "set", value: 20 } }) },
    { kind: "updateIngredient", targetName: "Куркума", patch: ingredientPatch({ isInStock: false }) },
  ] } } };
  const result = await actions.askInventoryAssistant(request({ prompt: "Одним пакетом встанови залишок матеріалу Слоїчки на 20 і познач інгредієнт Куркума як відсутній" }));
  assert.equal(result.ok, true);
  assert.equal(result.data.operation, "batch");
  assert.equal(result.data.preview.items.length, 2);
  const instructions = state.apiCalls[0].instructions;
  assert.ok(instructions.includes("never hypothetical database ambiguity"));
  assert.ok(instructions.includes('updateStuff targetName="банка"'));
  assert.equal(instructions.includes("Every operation must include its exact target name"), false);
  assert.equal(state.writes.length, 0);
});


test("resuming ambiguity requires admin and validates the continuation before reads", async (t) => {
  t.mock.method(console, "error", () => {});
  const pending = { command: { kind: "mutation", intent: { kind: "deleteStuff", targetName: "Банка" } }, selected: null, assumptions: [], decisions: [] };
  state.admin = false;
  assert.equal((await actions.resumeInventoryWrite({ pending, choice: null, page: null })).ok, false);
  assert.equal(state.reads.length, 0);
  state.admin = true;
  for (const bad of [
    { pending, choice: { key: "0:target", selection: { entity: "stuff", id: -1 } }, page: null },
    { pending, choice: null, page: { key: "0:target", number: -1 } },
    { pending: { ...pending, unknown: true }, choice: null, page: null },
  ]) assert.equal((await actions.resumeInventoryWrite(bad)).ok, false);
  assert.equal(state.reads.length, 0);
  assert.equal(state.apiCalls.length, 0);
  assert.equal(state.writes.length, 0);
});

test("tolerant names support word order, spelling, inflection, punctuation and units without changing sizes", () => {
  const { nameMatchScore, matchNames } = require("../lib/ai/name-resolution.ts");
  for (const [query, title] of [
    ["перець чорний", "Чорний перець мелений"],
    ["куркумма", "Куркума"],
    ["часником", "Часник сушений"],
    ["слоїчки 250мл", "Слоїчки — 250 мл"],
    ["м'ята", "М’ята"],
  ]) assert.notEqual(nameMatchScore(query, title), null, `${query}: ${title}`);
  for (const [query, title] of [
    ["слоїчки 250 мл", "Слоїчки 500 мл"],
    ["250", "Слоїчки 1250 мл"],
    ["сіль", "Ваніль"],
    ["перець чорний", "Перець червоний"],
    ["сіль сіль", "Сіль"],
    ["куркума", "Часник"],
  ]) assert.equal(nameMatchScore(query, title), null, `${query}: ${title}`);
  assert.deepEqual(matchNames("Куркума", [{ title: "Куркума мелена" }, { title: "Куркума" }]), [{ title: "Куркума" }]);
});

test("reordered and typo searches return real records with deterministic ranked pagination", async () => {
  state.rows.ingredient = [
    { ...row(1), title: "Чорний перець мелений" },
    { ...row(2), title: "Червоний перець" },
    { ...row(3), title: "Куркума" },
  ];
  const reordered = await actions.searchInventoryRecords({ ...ingredient, text: "перець чорний" });
  assert.equal(reordered.ok, true);
  assert.deepEqual(reordered.data.items.map((item) => item.id), [1]);
  const typo = await actions.searchInventoryRecords({ ...ingredient, text: "куркумма" });
  assert.equal(typo.ok, true);
  assert.deepEqual(typo.data.items.map((item) => item.id), [3]);
  state.rows.ingredient = Array.from({ length: 260 }, (_, i) => ({ ...row(i + 1), title: `Куркума мелена ${String(i).padStart(3, "0")}` }));
  const first = await actions.searchInventoryRecords({ ...ingredient, text: "мелена куркума" });
  const second = await actions.searchInventoryRecords({ ...ingredient, text: "мелена куркума" }, 1);
  assert.equal(first.data.items.length, 20);
  assert.equal(first.data.hasMore, true);
  assert.equal(second.data.items.length, 20);
  assert.equal(first.data.items.some((item) => second.data.items.some((other) => item.id === other.id)), false);
  assert.equal(state.writes.length, 0);
});

test("a single approximate write match needs an explicit choice and can resume safely", async () => {
  const { WriteResolution, RecordChoiceRequired } = require("../lib/domain/ai-resolution.service.ts");
  const target = ingredientRecord({ title: "Куркума" });
  state.rows.ingredient = [target];
  state.records.ingredient = target;
  await assert.rejects(new WriteResolution({ decisions: [] }).inventory("ingredient", "куркумма", "0:target", "Запис"), (error) => {
    assert.equal(error instanceof RecordChoiceRequired, true);
    assert.deepEqual(error.question.candidates.map((item) => item.id), [target.id]);
    return true;
  });
  const choice = { key: "0:target", selection: { entity: "ingredient", id: target.id } };
  const resolution = new WriteResolution({ decisions: [] }, { choice });
  assert.equal((await resolution.inventory("ingredient", "куркумма", "0:target", "Запис")).id, target.id);
  resolution.validateChoice();
  assert.equal((await new WriteResolution({ decisions: resolution.decisions }).inventory("ingredient", "куркумма", "0:target", "Запис")).id, target.id);
  state.records.ingredient = { ...target, title: "Змінена назва" };
  await assert.rejects(new WriteResolution({ decisions: resolution.decisions }).inventory("ingredient", "куркумма", "0:target", "Запис"), /змінився/);
  assert.equal(state.writes.length, 0);
});

test("approximate recipe ingredients need selection instead of duplicate creation or automatic composition edits", async () => {
  const { WriteResolution, RecordChoiceRequired } = require("../lib/domain/ai-resolution.service.ts");
  const target = ingredientRecord({ title: "Куркума" });
  state.rows.ingredient = [target];
  const resolution = new WriteResolution({ decisions: [] });
  await assert.rejects(resolution.inventory("ingredient", "куркумма", "0:ingredient:0", "Склад", true), RecordChoiceRequired);
  const items = [{ id: target.id, title: target.title, amount: "5 г", category: "SPICES" }];
  assert.throws(() => resolution.composition("куркумма", items, "0:composition:0", "Склад"), RecordChoiceRequired);
  assert.equal(state.writes.length, 0);
});

test("explicit ingredient creation checks typo and reordered names before preview, without another model call", async () => {
  for (const [title, existingTitle] of [["Куркумма", "Куркума"], ["Перець чорний мелений", "Чорний перець мелений"]]) {
    const existing = ingredientRecord({ title: existingTitle, description: "Збережений опис", isInStock: true, isSaved: true });
    state.rows.ingredient = [existing];
    state.records.ingredient = existing;
    state.plan = mutationPlan({ kind: "createIngredient", data: { title, description: "Інший опис", category: "OTHER", isInStock: false, isSaved: false } });
    const initial = await actions.askInventoryAssistant(request({ prompt: `Створи інгредієнт ${title}` }));
    assert.equal(initial.ok, true);
    assert.equal(initial.data.operation, "chooseRecord");
    assert.equal(initial.data.question.purpose, "ingredientCreation");
    assert.equal(initial.data.question.canCreate, true);
    assert.deepEqual(initial.data.question.candidates.map((row) => row.title), [existingTitle]);
    const calls = state.apiCalls.length;
    const reused = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: existing.id } }, page: null });
    assert.equal(reused.ok, true);
    assert.equal(reused.data.operation, "viewSelected");
    assert.equal(reused.data.record.title, existingTitle);
    assert.equal(state.apiCalls.length, calls);
    assert.equal(state.records.ingredient.description, "Збережений опис");
    assert.equal(state.records.ingredient.category, "SPICES");
    assert.equal(state.records.ingredient.isInStock, true);
    assert.equal(state.writes.length, 0);
  }
});

test("creating a distinct ingredient requires an explicit choice and still waits for confirmation", async () => {
  const existing = ingredientRecord({ title: "Куркума" });
  state.rows.ingredient = [existing];
  const data = { title: "Куркумма", description: "Окремий інгредієнт", category: "SPICES", isInStock: false, isSaved: false };
  state.plan = mutationPlan({ kind: "createIngredient", data });
  const initial = await actions.askInventoryAssistant(request());
  const ready = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, createNew: true }, page: null });
  assert.equal(ready.ok, true);
  assert.equal(ready.data.operation, "mutation");
  assert.deepEqual(ready.data.preview.after, data);
  assert.equal(ready.data.preview.duplicateReview.title, data.title);
  assert.deepEqual(ready.data.preview.duplicateReview.candidates, [{ id: existing.id, title: existing.title }]);
  assert.equal(state.writes.length, 0);
  state.allowWrites = true;
  assert.equal((await actions.confirmInventoryMutation(ready.data.preview)).ok, true);
  assert.equal(state.writes.length, 1);
});

test("exact existing ingredient cannot be created again through the distinct choice", async (t) => {
  t.mock.method(console, "error", () => {});
  state.rows.ingredient = [ingredientRecord({ title: "Куркума" })];
  state.plan = mutationPlan({ kind: "createIngredient", data: { title: "Куркума", description: "", category: "SPICES", isInStock: false, isSaved: false } });
  const initial = await actions.askInventoryAssistant(request());
  assert.equal(initial.data.question.canCreate, false);
  const refused = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, createNew: true }, page: null });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, "CONFLICT");
  assert.equal(state.writes.length, 0);
});

test("duplicate checks cannot be bypassed by an edited title or an unreviewed confirmation", async (t) => {
  t.mock.method(console, "error", () => {});
  state.rows.ingredient = [ingredientRecord({ title: "Куркума" })];
  const after = { title: "Куркумма", description: "", category: "SPICES", isInStock: false, isSaved: false };
  for (const duplicateReview of [undefined, { title: "Інша назва", candidates: [{ id: 1, title: "Куркума" }] }, { title: after.title, candidates: [] }]) {
    const response = await actions.confirmInventoryMutation({ kind: "createIngredient", after, ...(duplicateReview ? { duplicateReview } : {}) });
    assert.equal(response.ok, false);
    assert.equal(response.code, "CONFLICT");
  }
  assert.equal(state.writes.length, 0);
});

test("duplicate review choices paginate beyond the first lookup page and reject stale or forged selections", async (t) => {
  t.mock.method(console, "error", () => {});
  state.rows.ingredient = Array.from({ length: 260 }, (_, index) => ingredientRecord({ id: index + 1, title: `Куркума ${String(index).padStart(3, "0")}` }));
  state.plan = mutationPlan({ kind: "createIngredient", data: { title: "Куркумма", description: "", category: "SPICES", isInStock: false, isSaved: false } });
  const initial = await actions.askInventoryAssistant(request());
  assert.equal(initial.data.question.hasMore, true);
  const next = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: null, page: { key: initial.data.question.key, number: 12 } });
  assert.equal(next.data.question.candidates.length, 20);
  assert.equal(next.data.question.hasMore, false);
  assert.equal(next.data.question.candidates.at(-1).id, 260);
  state.rows.ingredient = [];
  const stale = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: 1 } }, page: null });
  assert.equal(stale.ok, false);
  assert.equal(stale.code, "STALE_PREVIEW");
  const forged = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: "99:createIngredient", createNew: true }, page: null });
  assert.equal(forged.ok, false);
  assert.equal(forged.code, "STALE_PREVIEW");
  assert.equal(state.writes.length, 0);
});

test("a newly appeared near match requires another review instead of inheriting a prior distinct decision", async () => {
  const { WriteResolution, RecordChoiceRequired } = require("../lib/domain/ai-resolution.service.ts");
  state.rows.ingredient = [ingredientRecord({ title: "Куркума" })];
  const state1 = new WriteResolution({ decisions: [] }, { choice: { key: "0:createIngredient", createNew: true } });
  await state1.ingredientCreation("Куркумма", "0:createIngredient");
  state.rows.ingredient.push(ingredientRecord({ id: 2, title: "Куркума мелена" }));
  const state2 = new WriteResolution({ decisions: state1.decisions });
  await assert.rejects(state2.ingredientCreation("Куркумма", "0:createIngredient"), RecordChoiceRequired);
  assert.equal(state.writes.length, 0);
});

test("expanded search schemas preserve legacy inputs and reject unsupported fields and malformed dates", () => {
  const legacy = { entity: "ingredient", text: null, category: null, isInStock: null, isSaved: null };
  const parsed = schemas.inventorySearchSchema.parse(legacy);
  assert.equal(parsed.hasImage, null);
  assert.equal(parsed.createdFrom, null);
  for (const value of [
    { ...stuff, hasImage: false }, { ...ingredient, notesText: "secret" },
    { ...recipe, createdFrom: "23/10/2026" }, { ...recipe, createdFrom: "2026-02-30" },
    { ...recipe, variantStockMin: -1 }, { ...recipe, variantStockMax: 0.5 },
    { entity: "all", text: null, hasImage: false },
  ]) assert.equal(schemas.inventorySearchSchema.safeParse(value).success, false);
});

test("Kyiv calendar boundaries handle summer, winter, daylight saving and local today", () => {
  const { inventoryDayStart, inventoryToday } = require("../lib/ai/search-dates.ts");
  assert.equal(inventoryDayStart("2026-10-23").toISOString(), "2026-10-22T21:00:00.000Z");
  assert.equal(inventoryDayStart("2026-01-23").toISOString(), "2026-01-22T22:00:00.000Z");
  assert.equal((inventoryDayStart("2026-03-30") - inventoryDayStart("2026-03-29")) / 3600000, 23);
  assert.equal((inventoryDayStart("2026-10-26") - inventoryDayStart("2026-10-25")) / 3600000, 25);
  assert.equal(inventoryToday(new Date("2026-12-31T22:30:00Z")), "2027-01-01");
});

test("date and variant range errors stop before database reads", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const value of [
    { ...recipe, createdFrom: "2026-10-24", createdBefore: "2026-10-23" },
    { ...stuff, updatedFrom: "2026-10-23", updatedBefore: "2026-10-23" },
    { ...recipe, variantStockMin: 10, variantStockMax: 2 },
  ]) assert.equal((await actions.searchInventoryRecords(value)).ok, false);
  assert.equal(state.reads.length, 0);
  assert.equal(state.writes.length, 0);
});

test("new filters have Ukrainian labels that preserve false and zero", () => {
  const { searchFilters } = require("../lib/ai/search-labels.ts");
  const filters = searchFilters({ ...recipe, hasImage: false, notesText: "менше оцту", variantStockMax: 0, updatedFrom: "2026-10-23" });
  for (const expected of ["Є фото: Ні", "У нотатках: менше оцту", "Залишок варіанта до: 0", "Оновлено від (Київ): 23.10.2026"]) assert.ok(filters.includes(expected));
  assert.equal(filters.some((value) => value.includes("undefined") || value.includes("null")), false);
});

test("planner receives current Kyiv date and rules for scoped notes, images and same-variant filters", async () => {
  state.plan = plan({ ...recipe, hasImage: false, notesText: "менше оцту" });
  const reply = await actions.askInventoryAssistant(request({ prompt: "Покажи рецепти без фото, де в нотатках менше оцту" }));
  assert.equal(reply.ok, true);
  assert.equal(reply.data.results.search.hasImage, false);
  assert.equal(reply.data.results.search.notesText, "менше оцту");
  const context = JSON.parse(state.apiCalls[0].input).context;
  assert.match(context.currentDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(context.timeZone, "Europe/Kyiv");
  for (const phrase of ["notesText='менше оцту'", "hasImage=false", "THAT SAME variant", "weeks start Monday", "default UI poster"]) assert.ok(state.apiCalls[0].instructions.includes(phrase), phrase);
});


test("relative calendar ranges are computed by the server across month/year boundaries", () => {
  const { inventoryDateContext } = require("../lib/ai/search-dates.ts");
  const context = inventoryDateContext(new Date("2026-12-31T22:30:00Z"));
  assert.equal(context.currentDate, "2027-01-01");
  assert.deepEqual(context.dateRanges.today, { from: "2027-01-01", before: "2027-01-02" });
  assert.deepEqual(context.dateRanges.thisWeek, { from: "2026-12-28", before: "2027-01-04" });
  assert.deepEqual(context.dateRanges.lastMonth, { from: "2026-12-01", before: "2027-01-01" });
  assert.deepEqual(context.dateRanges.thisMonth, { from: "2027-01-01", before: "2027-02-01" });
});

const revisionPlan = (changes) => ({ message: "Уточнюю пропозицію", assumptions: [], command: { kind: "revise", revision: { changes } } });
const reviseStuff = (stock, extra = {}) => ({ operationIndex: 0, change: { kind: "stuff", patch: stuffPatch({ stock, ...extra }) } });

test("draft stock corrections preserve set/adjust and debit direction unless explicitly changed", async (t) => {
  for (const [mode, initial, stock, expected] of [
    ["adjust", 5, { mode: null, value: 7 }, 17],
    ["set", 5, { mode: null, value: 7 }, 7],
    ["adjust", -3, { mode: null, value: 5 }, 5],
    ["adjust", 5, { mode: "set", value: 7 }, 7],
    ["adjust", -3, { mode: "adjust", value: 7 }, 17],
  ]) await t.test(`${mode} ${initial} → ${JSON.stringify(stock)}`, async () => {
    state.records.stuff = stuffRecord();
    state.rows.stuff = [state.records.stuff];
    state.plan = mutationPlan({ kind: "updateStuff", targetName: "Слоїчки", patch: stuffPatch({ description: "Вже запропонований опис", stock: { mode, value: initial } }) });
    const first = await actions.askInventoryAssistant(request({ prompt: "Зміни залишок банки" }));
    assert.equal(first.ok, true);
    // A new competing substring match must not steal the already resolved ID.
    state.rows.stuff.push(stuffRecord({ id: 3, title: "Слоїчки 500 мл" }));
    state.plan = revisionPlan([reviseStuff(stock)]);
    const revised = await actions.askInventoryAssistant(request({ prompt: "Краще 7", activeWrite: { phase: "draft", pending: first.data.resolved } }));
    assert.equal(revised.ok, true);
    assert.equal(revised.data.operation, "mutation");
    assert.equal(revised.data.continuesTask, true);
    assert.equal(revised.data.preview.target.id, 2);
    assert.equal(revised.data.preview.after.inStock, expected);
    assert.equal(revised.data.preview.after.description, "Вже запропонований опис");
    assert.deepEqual(revised.data.resolved.decisions, first.data.resolved.decisions);
    assert.deepEqual(JSON.parse(state.apiCalls.at(-1).input).activeWrite.pending, first.data.resolved);
    assert.equal(state.writes.length, 0);
  });
});

test("creation revisions retain every supplied field, zero and false without applying defaults again", async () => {
  const data = { title: "Chili Mix", description: "Мій опис", category: "OTHER", isInStock: true, isSaved: false };
  const pending = { command: { kind: "mutation", intent: { kind: "createIngredient", data } }, selected: null, decisions: [], assumptions: [] };
  state.plan = revisionPlan([{ operationIndex: 0, change: { kind: "ingredient", patch: ingredientPatch({ title: "Chili Mix 2" }) } }]);
  const revised = await actions.askInventoryAssistant(request({ prompt: "Назва Chili Mix 2", activeWrite: { pending, phase: "draft" } }));
  assert.equal(revised.ok, true);
  assert.deepEqual(revised.data.preview.after, { ...data, title: "Chili Mix 2" });
  assert.deepEqual(pending.command.intent.data, data, "revision does not mutate its source");
  assert.equal(state.writes.length, 0);
});

test("mixed batch revisions preserve unrelated operations and selected IDs", async () => {
  state.records.stuff = stuffRecord();
  state.records.ingredient = ingredientRecord();
  const pending = {
    command: { kind: "batch", intent: { kind: "list", operations: [
      { kind: "updateStuff", targetName: "Слоїчки", patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) },
      { kind: "updateIngredient", targetName: "Куркума", patch: ingredientPatch({ isInStock: false }) },
    ] } }, selected: null, assumptions: [], decisions: [
      { key: "0:target", selection: { entity: "stuff", id: 2 }, title: state.records.stuff.title },
      { key: "1:target", selection: { entity: "ingredient", id: 1 }, title: state.records.ingredient.title },
    ],
  };
  state.plan = revisionPlan([reviseStuff({ mode: null, value: 7 })]);
  const revised = await actions.askInventoryAssistant(request({ prompt: "Для банки краще 7", activeWrite: { pending, phase: "draft" } }));
  assert.equal(revised.ok, true);
  assert.equal(revised.data.operation, "batch");
  assert.equal(revised.data.preview.items.find((item) => item.kind === "updateStuff").after.inStock, 17);
  assert.equal(revised.data.preview.items.find((item) => item.kind === "updateIngredient").after.isInStock, false);
  assert.deepEqual(revised.data.resolved.command.intent.operations[1], pending.command.intent.operations[1]);
  assert.equal(state.writes.length, 0);
});

test("recipe draft amount edits preserve other ingredients and remap their explicit choices after removal", () => {
  const { revisePendingWrite } = require("../lib/ai/write-revision.ts");
  const pending = {
    command: { kind: "mutation", intent: { kind: "createRecipe", data: { title: "Приправа", description: "Мій опис", notes: "Нотатки", confirmationNotes: null, category: "SPICES", series: "DEFAULT", spicy: 0, isHidden: true, isConfirmed: false, isSaved: true }, ingredients: [
      { title: "сіль", amount: "3 г", category: null }, { title: "часник", amount: "5 г", category: null }, { title: "перець", amount: "2 г", category: null },
    ] } }, selected: null, assumptions: [], decisions: [
      { key: "0:ingredient:0", selection: { entity: "ingredient", id: 1 }, title: "Сіль морська" },
      { key: "0:ingredient:1", selection: { entity: "ingredient", id: 2 }, title: "Часник сушений" },
      { key: "0:ingredient:2", selection: { entity: "ingredient", id: 3 }, title: "Перець чорний" },
    ],
  };
  const revised = revisePendingWrite(pending, { changes: [{ operationIndex: 0, change: { kind: "recipe", patch: { title: null, description: null, notes: null, confirmationNotes: null, category: null, series: null, spicy: null, isHidden: null, isConfirmed: null, isSaved: null }, composition: { mode: "patch", items: [
    { action: "remove", title: "Сіль морська", amount: null, category: null }, { action: "setAmount", title: "Часник сушений", amount: "7 г", category: null },
  ] } } }] });
  assert.deepEqual(revised.command.intent.ingredients, [{ title: "часник", amount: "7 г", category: null }, { title: "перець", amount: "2 г", category: null }]);
  assert.deepEqual(revised.command.intent.data, pending.command.intent.data);
  assert.deepEqual(revised.decisions, [
    { ...pending.decisions[1], key: "0:ingredient:0" }, { ...pending.decisions[2], key: "0:ingredient:1" },
  ]);
  assert.equal(pending.command.intent.ingredients.length, 3);
});

test("revision failures cannot confirm an invalid stock change or turn a delete into an update", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.stuff = stuffRecord();
  const pending = { command: { kind: "mutation", intent: { kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) } }, selected: { entity: "stuff", id: 2 }, decisions: [], assumptions: [] };
  state.plan = revisionPlan([reviseStuff({ mode: null, value: -20 })]);
  const invalid = await actions.askInventoryAssistant(request({ activeWrite: { phase: "draft", pending } }));
  assert.equal(invalid.data.operation, "revisionFailed");
  assert.equal(invalid.data.pending.command.intent.patch.stock.value, -20, "retry retains the corrected operation instead of restoring +5");
  const deleting = { ...pending, command: { kind: "mutation", intent: { kind: "deleteStuff", targetName: null } } };
  const mismatch = await actions.askInventoryAssistant(request({ activeWrite: { phase: "draft", pending: deleting } }));
  assert.equal(mismatch.data.operation, "revisionFailed");
  assert.equal(mismatch.data.pending.command.intent.kind, "deleteStuff");
  const absent = await actions.askInventoryAssistant(request());
  assert.equal(absent.ok, false);
  assert.equal(state.writes.length, 0);
  state.admin = false;
  const calls = state.apiCalls.length;
  assert.equal((await actions.askInventoryAssistant(request({ activeWrite: { phase: "draft", pending } }))).ok, false);
  assert.equal(state.apiCalls.length, calls);
});

test("revision clarification and button reminders retain task context without writes", async () => {
  const pending = { command: { kind: "mutation", intent: { kind: "createStuff", data: { title: "Банка", description: "Мій опис", category: "JARS", inStock: 3 } } }, selected: null, decisions: [], assumptions: [] };
  state.plan = { message: "Який опис? Наприклад: скляна банка.", assumptions: [], command: { kind: "clarifyRevision", continuesPrevious: false } };
  const question = await actions.askInventoryAssistant(request({ prompt: "Зміни опис", activeWrite: { pending, phase: "draft" } }));
  assert.equal(question.data.operation, "clarifyRevision");
  state.plan = revisionPlan([reviseStuff(null, { description: "Мій новий опис" })]);
  const answer = await actions.askInventoryAssistant(request({ prompt: "Мій новий опис", clarification: question.data.clarification, activeWrite: { pending, phase: "clarification" } }));
  assert.equal(answer.data.preview.after.inStock, 3);
  assert.equal(answer.data.preview.after.description, "Мій новий опис");
  state.plan = { message: "Оберіть запис кнопкою у списку.", assumptions: [], command: { kind: "keepTask" } };
  const reads = state.reads.length;
  const reminder = await actions.askInventoryAssistant(request({ prompt: "Банка 250 мл", activeWrite: { pending, phase: "choice" } }));
  assert.equal(reminder.data.operation, "keepTask");
  assert.equal(state.reads.length, reads);
  assert.equal(state.writes.length, 0);
});

test("selection refresh retains the explicitly selected record across batches and clears it on deletion", async () => {
  const { refreshAfterSave } = require("../lib/ai/refresh-after-save.ts");
  const selected = { entity: "recipe", id: 99 };
  const reads = [];
  const readers = { invalidate: async () => {}, record: async (target) => { reads.push(target); return { ok: true, data: target }; }, search: async () => { throw new Error("no search"); } };
  const writes = [{ entity: "stuff", id: 2, operation: "updated", title: "Банка" }, { entity: "ingredient", id: 1, operation: "created", title: "Сіль" }];
  assert.deepEqual((await refreshAfterSave(writes, null, readers, selected)).selected, selected);
  assert.deepEqual(reads, [selected]);
  const deleted = await refreshAfterSave([...writes, { ...selected, operation: "deleted", title: "Рецепт" }], null, readers, selected);
  assert.equal(deleted.selected, null);
  assert.equal(reads.length, 1);
});

test("renaming a batch ingredient creation preserves its recipe dependency instead of creating an extra ingredient", async () => {
  const data = { title: "Початкова спеція", description: "Мій опис", category: "SPICES", isInStock: true, isSaved: false };
  const fields = { title: "Нова приправа", description: "", notes: "", confirmationNotes: null, category: "SPICES", series: "DEFAULT", spicy: 0, isHidden: true, isConfirmed: false, isSaved: false };
  const pending = { command: { kind: "batch", intent: { kind: "list", operations: [
    { kind: "createIngredient", data }, { kind: "createRecipe", data: fields, ingredients: [{ title: data.title, amount: "5 г", category: null }] },
  ] } }, selected: null, assumptions: [], decisions: [] };
  state.plan = revisionPlan([{ operationIndex: 0, change: { kind: "ingredient", patch: ingredientPatch({ title: "Перейменована спеція" }) } }]);
  const revised = await actions.askInventoryAssistant(request({ prompt: "Назви новий інгредієнт Перейменована спеція", activeWrite: { pending, phase: "draft" } }));
  assert.equal(revised.ok, true);
  assert.equal(revised.data.preview.items.length, 2);
  assert.deepEqual(revised.data.preview.items[0].after, { ...data, title: "Перейменована спеція" });
  assert.equal(revised.data.preview.items[1].after.ingredients[0].title, "Перейменована спеція");
  assert.equal(revised.data.preview.items[1].after.ingredients[0].amount, "5 г");
  assert.equal(state.writes.length, 0);
});

test("renaming a target preserves its chosen ID while explicit retargeting invalidates only that operation's choices", () => {
  const { revisePendingWrite } = require("../lib/ai/write-revision.ts");
  const pending = { command: { kind: "batch", intent: { kind: "list", operations: [
    { kind: "updateStuff", targetName: "Банка", patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) },
    { kind: "updateIngredient", targetName: "Куркума", patch: ingredientPatch({ isInStock: false }) },
  ] } }, selected: null, assumptions: [], decisions: [
    { key: "0:target", selection: { entity: "stuff", id: 2 }, title: "Банка 250 мл" },
    { key: "1:target", selection: { entity: "ingredient", id: 1 }, title: "Куркума" },
  ] };
  const renamed = revisePendingWrite(pending, { changes: [reviseStuff(null, { title: "Нова назва банки" })] });
  assert.deepEqual(renamed.decisions, pending.decisions);
  assert.equal(renamed.command.intent.operations[0].targetName, "Банка");
  const retargeted = revisePendingWrite(pending, { changes: [{ operationIndex: 0, change: { kind: "target", targetName: "Кришка" } }] });
  assert.deepEqual(retargeted.decisions, [pending.decisions[1]]);
  assert.deepEqual(retargeted.command.intent.operations[0].patch, pending.command.intent.operations[0].patch);
});

test("active task validation rejects nested context, invalid phases and excessive frozen targets before planning", async (t) => {
  t.mock.method(console, "error", () => {});
  const pending = { command: { kind: "mutation", intent: { kind: "createStuff", data: { title: "Банка", description: "", category: "JARS", inStock: 0 } } }, selected: null, decisions: [], assumptions: [] };
  for (const activeWrite of [
    { pending, phase: "uncertain" },
    { pending, phase: "draft", source: request() },
    { pending: { ...pending, targets: Array.from({ length: 21 }, (_, id) => ({ entity: "stuff", id: id + 1 })) }, phase: "draft" },
  ]) assert.equal((await actions.askInventoryAssistant(request({ activeWrite }))).ok, false);
  assert.equal(state.apiCalls.length, 0);
  assert.equal(state.reads.length, 0);
});

test("missing creation fields must be explicitly completed and never use hidden base values", async () => {
  const pending = { command: { kind: "mutation", intent: { kind: "createStuff", data: { title: "Банка", description: "Поточний опис", category: "DECOR", inStock: 10 } } }, selected: null, assumptions: [], decisions: [] };
  const activeWrite = { pending, phase: "draft", incompleteFields: ["title", "stock"] };
  state.plan = revisionPlan([reviseStuff({ mode: null, value: 7 })]);
  const missingTitle = await actions.askInventoryAssistant(request({ activeWrite }));
  assert.equal(missingTitle.data.operation, "revisionFailed");
  assert.equal(missingTitle.data.revisionApplied, false);
  assert.match(missingTitle.data.message, /назву/);
  state.plan = revisionPlan([reviseStuff({ mode: "adjust", value: 7 }, { title: "Нова банка" })]);
  assert.equal((await actions.askInventoryAssistant(request({ activeWrite }))).data.revisionApplied, false);
  state.plan = revisionPlan([reviseStuff({ mode: null, value: 7 }, { title: "Нова банка" })]);
  const completed = await actions.askInventoryAssistant(request({ activeWrite }));
  assert.deepEqual(completed.data.preview.after, { ...pending.command.intent.data, title: "Нова банка", inStock: 7 });
  state.plan = plan(stuff);
  assert.equal((await actions.askInventoryAssistant(request({ activeWrite, prompt: "Інший запит: покажи всі матеріали" }))).data.operation, "search");
  assert.equal(state.writes.length, 0);
});

test("expired selections of every entity permit independent searches and creations with structured notices", async (t) => {
  for (const entity of ["ingredient", "stuff", "recipe"]) await t.test(entity, async () => {
    const selected = { entity, id: 999 };
    state.plan = { ...plan(stuff), clarificationMode: "independent" };
    const found = await actions.askInventoryAssistant(request({ selected }));
    assert.equal(found.ok, true);
    assert.equal(found.data.operation, "search");
    assert.deepEqual(found.data.selectionExpired.selection, selected);
    const input = JSON.parse(state.apiCalls.at(-1).input);
    assert.equal(input.selected, null);
    assert.deepEqual(input.unavailableSelection, selected);
    state.plan = mutationPlan({ kind: "createStuff", data: { title: "Нова банка", description: "", category: "JARS", inStock: 0 } });
    const created = await actions.askInventoryAssistant(request({ selected }));
    assert.equal(created.data.operation, "mutation");
    assert.equal(created.data.resolved.selected, null);
    assert.deepEqual(created.data.selectionExpired.selection, selected);
    assert.equal(state.writes.length, 0);
  });
});

test("explicit named targets work with expired UI selection while unnamed writes and details stay blocked", async () => {
  const selected = { entity: "ingredient", id: 999 };
  state.records.stuff = stuffRecord();
  state.rows.stuff = [state.records.stuff];
  state.plan = mutationPlan({ kind: "updateStuff", targetName: "Слоїчки", patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) });
  const named = await actions.askInventoryAssistant(request({ selected }));
  assert.equal(named.data.preview.target.id, 2);
  assert.equal(named.data.preview.after.inStock, 15);
  for (const command of [
    { kind: "viewSelected" },
    { kind: "mutation", intent: { kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "set", value: 30 } }) } },
    { kind: "mutation", intent: { kind: "deleteIngredient", targetName: null } },
  ]) {
    state.plan = { message: "Перегляд", assumptions: [], command };
    const blocked = await actions.askInventoryAssistant(request({ selected }));
    assert.equal(blocked.data.operation, "requestBlocked");
    assert.deepEqual(blocked.data.selectionExpired.selection, selected);
    assert.equal("preview" in blocked.data, false);
  }
  assert.equal(state.writes.length, 0);
});

test("expired clarification binding survives automatic clearing and cannot migrate to another selection", async () => {
  const selected = { entity: "stuff", id: 999 };
  const clarification = { originalPrompt: "Встанови залишок обраного матеріалу", question: "Який залишок?", turns: [], selected, previousSearch: stuff };
  state.plan = clarificationPlan("Вкажіть назву або оберіть запис", true);
  const question = await actions.askInventoryAssistant(request({ prompt: "30", clarification }));
  assert.equal(question.data.operation, "clarify");
  assert.deepEqual(question.data.clarification.selected, selected, "expiry must not rebind the clarification to null");
  assert.deepEqual(question.data.clarification.previousSearch, stuff);
  assert.deepEqual(JSON.parse(state.apiCalls.at(-1).input).clarificationSelectionUnavailable, selected);
  state.plan = mutationPlan({ kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "set", value: 30 } }) });
  const dependent = await actions.askInventoryAssistant(request({ prompt: "30", clarification }));
  assert.equal(dependent.data.operation, "requestBlocked");
  state.records.stuff = stuffRecord();
  const rebound = await actions.askInventoryAssistant(request({ prompt: "30", selected: { entity: "stuff", id: 2 }, clarification }));
  assert.equal(rebound.data.operation, "requestBlocked");
  assert.match(rebound.data.message, /Вибір запису змінився/);
  assert.equal(state.writes.length, 0);
});

test("independent plans leave obsolete clarification without inheriting its target or filters", async () => {
  const clarification = { originalPrompt: "Встанови залишок обраного матеріалу", question: "Який залишок?", turns: [], selected: { entity: "stuff", id: 999 }, previousSearch: stuff };
  state.plan = { ...plan(ingredient), clarificationMode: "independent" };
  const independent = await actions.askInventoryAssistant(request({ prompt: "Інший запит: покажи всі інгредієнти", clarification, previousSearch: ingredient }));
  assert.equal(independent.data.operation, "search");
  assert.deepEqual(independent.data.results.search, ingredient);
  assert.equal("clarification" in independent.data, false);
  const sent = JSON.parse(state.apiCalls.at(-1).input);
  assert.deepEqual(sent.previousSearch, ingredient);
  assert.deepEqual(sent.clarification.previousSearch, stuff);
  state.plan = { ...clarificationPlan("Яку назву нової банки вказати?"), clarificationMode: "independent" };
  const newQuestion = await actions.askInventoryAssistant(request({ prompt: "Інший запит: створи нову банку", clarification }));
  assert.equal(newQuestion.data.clarification.selected, null);
  assert.equal(newQuestion.data.clarification.previousSearch, null);
  assert.equal(newQuestion.data.clarification.originalPrompt, "Інший запит: створи нову банку");
  assert.equal(state.writes.length, 0);
});

test("UI selection expiry does not change a different active task's resolved identity or fields", async () => {
  state.records.stuff = stuffRecord();
  state.rows.stuff = [state.records.stuff];
  state.plan = mutationPlan({ kind: "updateStuff", targetName: "Слоїчки", patch: stuffPatch({ description: "Мій опис", stock: { mode: "adjust", value: -3 } }) });
  const first = await actions.askInventoryAssistant(request());
  const pending = first.data.resolved;
  state.plan = revisionPlan([reviseStuff({ mode: null, value: 5 })]);
  const revised = await actions.askInventoryAssistant(request({ selected: { entity: "recipe", id: 999 }, activeWrite: { pending, phase: "draft" } }));
  assert.equal(revised.data.operation, "mutation");
  assert.equal(revised.data.preview.target.id, 2);
  assert.equal(revised.data.preview.after.inStock, 5);
  assert.equal(revised.data.preview.after.description, "Мій опис");
  assert.deepEqual(revised.data.resolved.decisions, pending.decisions);
  assert.deepEqual(revised.data.selectionExpired.selection, { entity: "recipe", id: 999 });
  state.records.stuff = null;
  const missingTarget = await actions.askInventoryAssistant(request({ activeWrite: { pending, phase: "draft" } }));
  assert.equal(missingTarget.data.operation, "revisionFailed");
  assert.equal(missingTarget.data.code, "STALE_PREVIEW");
  assert.deepEqual(missingTarget.data.pending.decisions, pending.decisions);
  assert.equal(state.writes.length, 0);
});

test("record absence is distinct from read failures and authorization still precedes lookup", async (t) => {
  t.mock.method(console, "error", () => {});
  const selected = { entity: "stuff", id: 999 };
  assert.equal((await actions.getInventoryRecord(selected)).code, "NOT_FOUND");
  state.readError = new Error("database unavailable");
  const failed = await actions.askInventoryAssistant(request({ selected }));
  assert.equal(failed.ok, false);
  assert.equal(failed.code, "INTERNAL_ERROR");
  assert.equal("selectionExpired" in failed, false);
  assert.equal(state.apiCalls.length, 0);
  state.readError = null;
  state.admin = false;
  state.reads = [];
  assert.equal((await actions.askInventoryAssistant(request({ selected }))).ok, false);
  assert.equal(state.reads.length, 0);
  assert.equal(state.apiCalls.length, 0);
  assert.equal(state.writes.length, 0);
});

test("provider failures after verified expiry retain their code alongside the selection notice", async () => {
  global.fetch = async () => { throw new Error("provider unavailable"); };
  const selected = { entity: "recipe", id: 999 };
  const failed = await actions.askInventoryAssistant(request({ selected }));
  assert.equal(failed.data.operation, "requestBlocked");
  assert.equal(failed.data.code, "PROVIDER_UNAVAILABLE");
  assert.deepEqual(failed.data.selectionExpired.selection, selected);
  assert.equal(state.writes.length, 0);
});

test("single and one-item batch deletion return the same recoverable blocker without a preview or writes", async () => {
  state.records.ingredient = ingredientRecord();
  state.rows.ingredient = [state.records.ingredient];
  state.references = [{ ingredientId: 1, recipeId: 10, recipe: { title: "Соус з куркумою" } }];
  const intent = { kind: "deleteIngredient", targetName: "Куркума" };
  const messages = [];
  for (const command of [{ kind: "mutation", intent }, { kind: "batch", intent: { kind: "list", operations: [intent] } }]) {
    state.plan = { message: "Перегляд", assumptions: [], command };
    const reply = await actions.askInventoryAssistant(request());
    assert.equal(reply.ok, true);
    assert.equal(reply.data.operation, "writeBlocked");
    assert.equal(reply.data.code, "CONFLICT");
    assert.equal("preview" in reply.data, false);
    assert.deepEqual(reply.data.pending.command, command);
    assert.deepEqual(reply.data.pending.decisions[0].selection, { entity: "ingredient", id: 1 });
    assert.match(reply.data.message, /Соус з куркумою/);
    messages.push(reply.data.message);
  }
  assert.equal(messages[0], messages[1]);
  assert.equal(state.writes.length, 0);
});

test("blocker messages retain actual counts with bounded examples", async () => {
  state.records.ingredient = ingredientRecord();
  state.references = Array.from({ length: 5 }, (_, index) => ({ ingredientId: 1, recipeId: index + 10, recipe: { title: `Залежний рецепт ${index}` } }));
  state.plan = mutationPlan({ kind: "deleteIngredient", targetName: null });
  const reply = await actions.askInventoryAssistant(request({ selected: { entity: "ingredient", id: 1 } }));
  assert.equal(reply.data.operation, "writeBlocked");
  assert.match(reply.data.message, /рецептах \(5\)/);
  assert.match(reply.data.message, /Залежний рецепт 0/);
  assert.match(reply.data.message, /ще 2/);
  assert.equal(reply.data.message.includes("Залежний рецепт 4"), false);
  assert.equal(state.writes.length, 0);
});

test("failed dependency reads are errors rather than permission to prepare a deletion", async (t) => {
  t.mock.method(console, "error", () => {});
  state.records.ingredient = ingredientRecord();
  t.mock.method(prisma.recipeIngredient, "findMany", async () => { throw new Error("database read failed"); });
  state.plan = mutationPlan({ kind: "deleteIngredient", targetName: null });
  const reply = await actions.askInventoryAssistant(request({ selected: { entity: "ingredient", id: 1 } }));
  assert.equal(reply.ok, false);
  assert.equal(reply.code, "INTERNAL_ERROR");
  assert.equal(state.writes.length, 0);
});
