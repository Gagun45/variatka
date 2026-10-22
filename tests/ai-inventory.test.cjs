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

const prisma = Object.fromEntries(["ingredient", "recipe", "stuff"].map((entity) => [entity, {
  findMany: async (args) => {
    state.reads.push({ entity, args });
    return state.rows[entity].slice(args.skip, args.skip + args.take);
  },
  findUnique: async (args) => {
    state.reads.push({ entity, args });
    return state.records[entity];
  },
  create: async () => { throw new Error("Search must never write"); },
  update: async () => { throw new Error("Search must never write"); },
  delete: async () => { throw new Error("Search must never write"); },
}]));

Module._load = function (id, parent, main) {
  if (id === "../prisma") return { prisma };
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
const { generateIngredientDraft } = require("../lib/ai/ingredient-draft.ts");

const ingredient = { entity: "ingredient", text: null, category: null, isInStock: null, isSaved: null };
const recipe = { entity: "recipe", text: null, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] };
const stuff = { entity: "stuff", text: null, category: null, isInStock: null, stockMin: null, stockMax: null };
const plan = (search) => ({ operation: "search", search, ingredient: null, assumptions: [], message: "Пошук" });
const request = (extra = {}) => ({ prompt: "Покажи спеції", selected: null, previousSearch: null, ...extra });
const row = (id) => ({ id, title: `Запис ${id}`, category: "SPICES", isInStock: true, inStock: 3, spicy: 1, isHidden: false, isConfirmed: true });

beforeEach(() => {
  state = { admin: true, authChecks: 0, apiCalls: [], reads: [], rows: { ingredient: [], recipe: [], stuff: [] }, records: { ingredient: null, recipe: null, stuff: null }, plan: plan(ingredient) };
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
  state.plan = { ...plan(null), operation: "viewSelected" };
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
  for (const result of [await actions.askInventoryAssistant(request()), await actions.searchInventoryRecords(ingredient), await actions.getInventoryRecord({ entity: "recipe", id: 1 }), await actions.proposeIngredient("Додай сіль")]) assert.equal(result.ok, false);
  assert.equal(state.authChecks, 4);
  assert.equal(state.reads.length, 0);
  assert.equal(state.apiCalls.length, 0);
});

test("invalid ranges, missing selection and deleted records fail without fabricating results", async (t) => {
  t.mock.method(console, "error", () => {});
  assert.equal((await actions.searchInventoryRecords({ ...stuff, stockMin: 10, stockMax: 2 })).ok, false);
  assert.equal((await actions.searchInventoryRecords({ ...recipe, spicyMin: 4, spicyMax: 1 })).ok, false);
  assert.equal(state.reads.length, 0);
  state.plan = { ...plan(null), operation: "viewSelected" };
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  const apiCount = state.apiCalls.length;
  assert.equal((await actions.askInventoryAssistant(request({ selected: { entity: "recipe", id: 999 } }))).ok, false);
  assert.equal(state.apiCalls.length, apiCount);
});

test("unsupported and contradictory model plans cannot cause a search or mutation", async (t) => {
  t.mock.method(console, "error", () => {});
  state.plan = { ...plan(null), operation: "unsupported", message: "Зміна поки не підтримується." };
  const reply = await actions.askInventoryAssistant(request({ prompt: "Видали всі рецепти" }));
  assert.equal(reply.data.operation, "unsupported");
  state.plan = { ...plan(ingredient), operation: "viewSelected" };
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  state.plan = { ...plan(null), operation: "deleteRecipe" };
  assert.equal((await actions.askInventoryAssistant(request())).ok, false);
  assert.equal(state.reads.length, 0);
});

test("ingredient creation preview still works through both new and existing entry points", async () => {
  const draft = { title: "Куркума", description: "", category: "SPICES", isInStock: false };
  state.plan = { ...plan(null), operation: "createIngredient", ingredient: draft, assumptions: ["Наявність не вказана"] };
  const reply = await actions.askInventoryAssistant(request({ prompt: "Додай інгредієнт куркума" }));
  assert.deepEqual(reply.data.draft.ingredient, draft);
  state.plan = { operation: state.plan.operation, ingredient: draft, assumptions: state.plan.assumptions, message: state.plan.message };
  assert.deepEqual((await generateIngredientDraft("Додай куркуму")).ingredient, draft);
  assert.equal(state.reads.length, 0);
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
