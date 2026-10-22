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
    if (args.where.title?.equals) rows = rows.filter((record) => record.title.toLowerCase() === args.where.title.equals.toLowerCase());
    const skip = args.skip ?? 0;
    return rows.slice(skip, skip + args.take).map((record) => project(record, args.select));
  },
  findUnique: async (args) => {
    state.reads.push({ entity, args });
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

const ingredient = { entity: "ingredient", text: null, category: null, isInStock: null, isSaved: null };
const recipe = { entity: "recipe", text: null, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] };
const stuff = { entity: "stuff", text: null, category: null, isInStock: null, stockMin: null, stockMax: null };
const plan = (search) => ({ command: { kind: "search", search }, assumptions: [], message: "Пошук" });
const request = (extra = {}) => ({ prompt: "Покажи спеції", selected: null, previousSearch: null, clarification: null, ...extra });
const row = (id) => ({ id, title: `Запис ${id}`, category: "SPICES", isInStock: true, inStock: 3, spicy: 1, isHidden: false, isConfirmed: true });

beforeEach(() => {
  state = { admin: true, authChecks: 0, apiCalls: [], reads: [], writes: [], storageDeletes: [], allowWrites: false, rows: { ingredient: [], recipe: [], stuff: [] }, records: { ingredient: null, recipe: null, stuff: null }, plan: plan(ingredient) };
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
  assert.equal((await actions.askInventoryAssistant(request({ selected: { entity: "recipe", id: 999 } }))).ok, false);
  assert.equal(state.apiCalls.length, apiCount);
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
  assert.equal(reply.data.operation, "chooseMutationTarget");
  assert.equal(reply.data.results.items.length, 2);
  state.records.stuff = stuffRecord();
  const preview = await actions.previewInventoryMutation(reply.data.intent, { entity: "stuff", id: 2 });
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
  const intent = { kind: "deleteIngredient", targetName: null };
  assert.equal((await previewMutation(intent)).ok, false);
  state.records.ingredient._count.recipeIngredients = 0;
  const preview = await previewMutation(intent);
  state.records.ingredient._count.recipeIngredients = 1;
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
  const mismatch = await actions.askInventoryAssistant(request({ prompt: "30", selected: { entity: "stuff", id: 3 }, clarification: first.data.clarification }));
  assert.equal(mismatch.ok, false);
  assert.equal(state.apiCalls.length, calls);
  state.plan = clarificationPlan("Потрібна точна кількість?", true);
  const next = await actions.askInventoryAssistant(request({ prompt: "так", selected, previousSearch: ingredient, clarification: first.data.clarification }));
  assert.equal(next.ok, true);
  assert.deepEqual(JSON.parse(state.apiCalls.at(-1).input).previousSearch, stuff);
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
  assert.deepEqual(matchNames("часнк", names), []);
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
    assert.ok(batch.includes("Перегляд пакета · 2 операції"));
    assert.ok(batch.includes("Підтвердити всі 2"));
    const creation = renderToStaticMarkup(React.createElement(View, { ...callbacks, preview: { kind: "createStuff", after: before } }));
    assert.ok(creation.includes("<input"));
    assert.ok(creation.includes("<textarea"));
    assert.equal(creation.includes("disabled="), false);
    const deletion = renderToStaticMarkup(React.createElement(View, { ...callbacks, preview: { kind: "deleteStuff", target: item.target, before } }));
    assert.ok(deletion.includes("Підтвердити видалення"));
    assert.ok(deletion.includes("Запис буде видалено повністю"));
  } finally {
    if (originalTsx) require.extensions[".tsx"] = originalTsx;
    else delete require.extensions[".tsx"];
  }
});
