/* eslint-disable @typescript-eslint/no-require-imports */
// Real Prisma queries against a disposable in-memory PostgreSQL build. No .env/database URL is loaded.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { PGlite } = require("@electric-sql/pglite");
const { Pool } = require("pg");
const { EventEmitter } = require("node:events");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const root = path.resolve(__dirname, "..");
const ingredientData = (title, extra = {}) => ({ title, description: "", category: "SPICES", isInStock: false, isSaved: false, ...extra });
const stuffData = (title, extra = {}) => ({ title, description: "", category: "JARS", inStock: 10, ...extra });
const recipeData = (title, extra = {}) => ({ title, description: "", notes: "", confirmationNotes: null, category: "SAUCES", series: "DEFAULT", spicy: 0, isHidden: true, isConfirmed: false, isSaved: false, ...extra });
const ingredientPatch = (extra = {}) => ({ title: null, description: null, category: null, isInStock: null, isSaved: null, ...extra });
const recipePatch = (extra = {}) => ({ title: null, description: null, notes: null, confirmationNotes: null, category: null, series: null, spicy: null, isHidden: null, isConfirmed: null, isSaved: null, ...extra });
const stuffPatch = (extra = {}) => ({ title: null, description: null, category: null, stock: null, ...extra });
const named = (title, amount = "10 г") => ({ title, amount, category: "SPICES" });
const recipeIntent = (title, names = [], extra = {}) => ({ kind: "createRecipe", data: recipeData(title, extra), ingredients: names.map((name) => named(name)) });

// pg's public pool interface, backed by real embedded PostgreSQL SQL execution.
// No connection string, socket or query/constraint emulation is used.
class EmbeddedPool extends Pool {
  constructor(db, oids) { super({ max: 1 }); this.db = db; this.oids = oids; this.tail = Promise.resolve(); }
  async reserve() {
    const previous = this.tail;
    let release;
    this.tail = new Promise((resolve) => { release = resolve; });
    await previous;
    return release;
  }
  async perform(config, args) {
    const sql = typeof config === "string" ? config : config.text;
    const parsers = config.types ? Object.fromEntries(this.oids.map((oid) => [oid, config.types.getTypeParser(oid, "text")])) : undefined;
    const result = await this.db.query(sql, args ?? config.values ?? [], { rowMode: config.rowMode ?? "object", parsers });
    return { rows: result.rows, fields: result.fields, rowCount: result.affectedRows ?? result.rows.length };
  }
  async query(config, args) { const release = await this.reserve(); try { return await this.perform(config, args); } finally { release(); } }
  async connect() {
    const release = await this.reserve();
    const connection = new EventEmitter();
    connection.query = (config, args) => this.perform(config, args);
    connection.release = release;
    return connection;
  }
  async end() { await this.tail; }
}

test("recipe and batch integration", { timeout: 120000 }, async (t) => {
  const db = await PGlite.create();
  let client;
  const originalLoad = Module._load;
  const originalTs = require.extensions[".ts"];
  const originalFetch = global.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  const cleaned = [];
  let admin = true;
  let modelPlan;
  let apiCalls = 0;
  try {
    const migrations = path.join(root, "prisma/migrations");
    for (const migration of fs.readdirSync(migrations).sort()) {
      const sql = path.join(migrations, migration, "migration.sql");
      if (fs.existsSync(sql)) await db.exec(fs.readFileSync(sql, "utf8"));
    }
    const oids = (await db.query("SELECT oid FROM pg_type")).rows.map((row) => row.oid);
    client = new PrismaClient({ adapter: new PrismaPg(new EmbeddedPool(db, oids), { disposeExternalPool: true }) });
    Module._load = function (id, parent, main) {
      if (id.startsWith("@/")) id = path.join(root, id.slice(2));
      if (id === "../prisma" || id === path.join(root, "lib/prisma")) return { prisma: client };
      if (id === "../r2/storage.helper") return { storageHelper: { delete: async (key) => cleaned.push(key) } };
      if (id === "./user.actions") return { requireAdmin: async () => { if (!admin) throw new Error("Forbidden"); } };
      if (id === "next/navigation") return { unstable_rethrow() {} };
      return originalLoad.call(this, id, parent, main);
    };
    require.extensions[".ts"] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
    global.fetch = async () => {
      apiCalls++;
      return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(modelPlan) }] }] });
    };
    process.env.OPENAI_API_KEY = "mock-only";
    const actions = require("../lib/actions/ai.actions.ts");
    const recipeActions = require("../lib/actions/recipe.actions.ts");
    const { prepareInventoryMutation } = require("../lib/domain/ai-mutations.service.ts");
    const { prepareInventoryBatch, completeBatchPreview, applyInventoryBatch } = require("../lib/domain/ai-batch.service.ts");

    await t.test("recipe creates and its missing ingredients are one reviewed atomic batch", async () => {
      const intent = recipeIntent("Test sauce", ["Test salt", "Test pepper"]);
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent } };
      const reply = await actions.askInventoryAssistant({ prompt: "Створи рецепт", selected: null, previousSearch: null, clarification: null });
      assert.equal(reply.ok, true);
      assert.equal(reply.data.operation, "batch");
      assert.equal(reply.data.preview.items.length, 3);
      assert.equal(await client.recipe.count(), 0);
      assert.equal(await client.ingredient.count(), 0);
      const saved = await actions.confirmInventoryBatch(reply.data.preview);
      assert.equal(saved.ok, true);
      assert.equal(saved.data.results.length, 3);
      const recipe = await client.recipe.findUnique({ where: { title: "Test sauce" }, include: { ingredients: true } });
      assert.equal(recipe.ingredients.length, 2);
      assert.equal(recipe.isHidden, true);
      assert.equal(recipe.isConfirmed, false);
      assert.equal(await client.ingredient.count(), 2);
      assert.equal(apiCalls, 1);
    });

    await t.test("composition patch changes one amount while preserving other fields and ingredients", async () => {
      const recipe = await client.recipe.findUnique({ where: { title: "Test sauce" } });
      const prepared = await prepareInventoryMutation({ kind: "updateRecipe", targetName: null, patch: recipePatch({ notes: "Keep this note" }), composition: { mode: "patch", items: [{ action: "setAmount", title: "Test salt", amount: "20 г", category: "SPICES" }] } }, { entity: "recipe", id: recipe.id });
      assert.equal(prepared.kind, "ready");
      assert.equal(prepared.preview.after.ingredients.length, 2);
      await applyInventoryBatch(completeBatchPreview([prepared.preview]));
      const after = await client.recipe.findUnique({ where: { id: recipe.id }, include: { ingredients: { include: { ingredient: true } } } });
      assert.equal(after.notes, "Keep this note");
      assert.equal(after.ingredients.find((item) => item.ingredient.title === "Test salt").amount, "20 г");
      assert.equal(after.ingredients.find((item) => item.ingredient.title === "Test pepper").amount, "10 г");
      assert.ok(after.updatedAt > recipe.updatedAt);
    });

    await t.test("manual composition changes advance the parent version and reject stale AI previews", async () => {
      const recipe = await client.recipe.findUnique({ where: { title: "Test sauce" }, include: { ingredients: true } });
      const pending = await prepareInventoryMutation({ kind: "updateRecipe", targetName: null, patch: recipePatch({ description: "Stale overwrite" }), composition: null }, { entity: "recipe", id: recipe.id });
      const manual = await recipeActions.updateRecipeIngredients(recipe.id, recipe.ingredients.map((item) => ({ ingredientId: item.ingredientId, amount: "33 г" })));
      assert.equal(manual.ok, true);
      const changed = await client.recipe.findUnique({ where: { id: recipe.id } });
      assert.ok(changed.updatedAt > recipe.updatedAt);
      await assert.rejects(applyInventoryBatch(completeBatchPreview([pending.preview])), /змінився/);
      assert.equal(changed.description, "");
      assert.equal(await client.recipeIngredient.count({ where: { recipeId: recipe.id, amount: "33 г" } }), 2);
    });

    await t.test("duplicates roll back earlier creates across different entities", async () => {
      await client.stuff.create({ data: stuffData("Existing jar") });
      const preview = await prepareInventoryBatch({ kind: "list", operations: [{ kind: "createIngredient", data: ingredientData("Must roll back") }, { kind: "createStuff", data: stuffData("Existing jar") }] }, null);
      await assert.rejects(applyInventoryBatch(preview), /назвою вже існує/);
      assert.equal(await client.ingredient.count({ where: { title: "Must roll back" } }), 0);
    });

    await t.test("a stale operation rolls back the whole mixed batch", async () => {
      const jar = await client.stuff.findUnique({ where: { title: "Existing jar" } });
      const preview = await prepareInventoryBatch({ kind: "list", operations: [{ kind: "createIngredient", data: ingredientData("Also roll back") }, { kind: "updateStuff", targetName: jar.title, patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) }] }, null);
      await client.stuff.update({ where: { id: jar.id }, data: { inStock: 50, updatedAt: new Date(jar.updatedAt.getTime() + 1000) } });
      await assert.rejects(applyInventoryBatch(preview), /змінився/);
      assert.equal(await client.ingredient.count({ where: { title: "Also roll back" } }), 0);
      assert.equal((await client.stuff.findUnique({ where: { id: jar.id } })).inStock, 50);
    });

    await t.test("filter batches freeze targets and report records already at the requested value", async () => {
      await client.ingredient.createMany({ data: [ingredientData("Filter one", { category: "OTHER", isInStock: true }), ingredientData("Filter two", { category: "OTHER", isInStock: false })] });
      const preview = await prepareInventoryBatch({ kind: "filter", search: { entity: "ingredient", text: "Filter", category: "OTHER", isInStock: null, isSaved: null }, change: { kind: "updateIngredients", patch: ingredientPatch({ isInStock: false }) } }, null);
      assert.equal(preview.items.length, 1);
      assert.equal(preview.unchanged.length, 1);
      await client.ingredient.create({ data: ingredientData("Filter later", { category: "OTHER", isInStock: true }) });
      await applyInventoryBatch(preview);
      assert.equal((await client.ingredient.findUnique({ where: { title: "Filter one" } })).isInStock, false);
      assert.equal((await client.ingredient.findUnique({ where: { title: "Filter later" } })).isInStock, true);
    });

    await t.test("filter batches never silently truncate over 20 matches", async () => {
      await client.stuff.createMany({ data: Array.from({ length: 21 }, (_, i) => stuffData(`Limit jar ${i}`)) });
      await assert.rejects(prepareInventoryBatch({ kind: "filter", search: { entity: "stuff", text: "Limit jar", category: null, isInStock: null, stockMin: null, stockMax: null }, change: { kind: "deleteStuff" } }, null), /більше 20/);
      assert.equal(await client.stuff.count({ where: { title: { startsWith: "Limit jar" } } }), 21);
    });

    await t.test("missing ingredients are deduplicated across recipes and count toward the limit", async () => {
      const preview = await prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Shared sauce A", ["Shared spice"]), recipeIntent("Shared sauce B", ["Shared spice"])] }, null);
      assert.equal(preview.items.length, 3);
      await applyInventoryBatch(preview);
      assert.equal(await client.ingredient.count({ where: { title: "Shared spice" } }), 1);
      await assert.rejects(prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Too big", Array.from({ length: 20 }, (_, i) => `Missing spice ${i}`))] }, null), /перевищує 20/);
      assert.equal(await client.recipe.count({ where: { title: "Too big" } }), 0);
    });

    await t.test("deleting a recipe then its ingredient is atomic without bypassing references", async () => {
      const preview = await prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Disposable sauce", ["Disposable spice"])] }, null);
      await applyInventoryBatch(preview);
      await assert.rejects(prepareInventoryMutation({ kind: "deleteIngredient", targetName: "Disposable spice" }, null), /використовується/);
      const deletion = await prepareInventoryBatch({ kind: "list", operations: [{ kind: "deleteIngredient", targetName: "Disposable spice" }, { kind: "deleteRecipe", targetName: "Disposable sauce" }] }, null);
      assert.equal(deletion.items[0].kind, "deleteRecipe");
      await applyInventoryBatch(deletion);
      assert.equal(await client.recipe.count({ where: { title: "Disposable sauce" } }), 0);
      assert.equal(await client.ingredient.count({ where: { title: "Disposable spice" } }), 0);
    });

    await t.test("a late protected delete rolls back earlier deletions and keeps their image files", async () => {
      await client.ingredient.create({ data: ingredientData("Free image spice", { imageKey: "free-image.webp" }) });
      const preview = await prepareInventoryBatch({ kind: "list", operations: [{ kind: "deleteIngredient", targetName: "Free image spice" }, { kind: "deleteIngredient", targetName: "Test salt" }] }, null);
      const previousCleanups = cleaned.length;
      await assert.rejects(applyInventoryBatch(preview), /використовується/);
      assert.equal(await client.ingredient.count({ where: { title: "Free image spice" } }), 1);
      assert.equal(cleaned.length, previousCleanups);
    });

    await t.test("recipe order restrictions are rechecked at confirmation and roll back the batch", async () => {
      const prepared = await prepareInventoryMutation(recipeIntent("Ordered sauce"), null);
      const created = await applyInventoryBatch(completeBatchPreview([prepared.preview]));
      const id = created.results[0].id;
      const deletion = await prepareInventoryMutation({ kind: "deleteRecipe", targetName: "Ordered sauce" }, null);
      const user = await client.user.create({ data: { email: "test@example.invalid", name: "Test" } });
      const variant = await client.recipeVariant.create({ data: { recipeId: id, label: "250 мл" } });
      await client.order.create({ data: { userId: user.id, customerName: "Test", customerEmail: user.email, items: { create: { recipeId: id, variantId: variant.id, recipeTitle: "Ordered sauce", variantLabel: "250 мл", amount: 1 } } } });
      const preview = completeBatchPreview([{ kind: "createStuff", after: stuffData("Do not create") }, deletion.preview]);
      await assert.rejects(applyInventoryBatch(preview), /замовленнях/);
      assert.equal(await client.stuff.count({ where: { title: "Do not create" } }), 0);
      assert.equal(await client.recipe.count({ where: { id } }), 1);
    });

    await t.test("ingredient relationship filters execute correctly against the real database", async () => {
      const { searchInventory } = require("../lib/domain/ai-inventory.service.ts");
      const filters = { entity: "recipe", text: null, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: ["Test salt"], excludeIngredients: ["Shared spice"] };
      const results = await searchInventory(filters);
      assert.deepEqual(results.items.map((item) => item.title), ["Test sauce"]);
    });

    await t.test("duplicate targets and fractional spiciness are rejected", async (subtest) => {
      subtest.mock.method(console, "error", () => {});
      await assert.rejects(prepareInventoryBatch({ kind: "list", operations: [{ kind: "updateStuff", targetName: "Existing jar", patch: stuffPatch({ stock: { mode: "set", value: 20 } }) }, { kind: "deleteStuff", targetName: "Existing jar" }] }, null), /повторні/);
      const reply = await recipeActions.createRecipe({ ...recipeData("Invalid spicy", { spicy: 1.5 }), items: [] });
      assert.equal(reply.ok, false);
      assert.equal(await client.recipe.count({ where: { title: "Invalid spicy" } }), 0);
    });

    await t.test("composition replacement can clear all ingredients without resetting recipe fields", async () => {
      const recipe = await client.recipe.findUnique({ where: { title: "Shared sauce A" } });
      const prepared = await prepareInventoryMutation({ kind: "updateRecipe", targetName: null, patch: recipePatch(), composition: { mode: "replace", items: [] } }, { entity: "recipe", id: recipe.id });
      await applyInventoryBatch(completeBatchPreview([prepared.preview]));
      assert.equal(await client.recipeIngredient.count({ where: { recipeId: recipe.id } }), 0);
      assert.equal((await client.recipe.findUnique({ where: { id: recipe.id } })).isHidden, recipe.isHidden);
    });

    await t.test("an unrelated recipe edit preserves existing title whitespace", async () => {
      const recipe = await client.recipe.create({ data: recipeData("  Legacy recipe  ") });
      const prepared = await prepareInventoryMutation({ kind: "updateRecipe", targetName: null, patch: recipePatch({ notes: "New note" }), composition: null }, { entity: "recipe", id: recipe.id });
      assert.equal(prepared.preview.after.fields.title, "  Legacy recipe  ");
      await applyInventoryBatch(completeBatchPreview([prepared.preview]));
      assert.equal((await client.recipe.findUnique({ where: { id: recipe.id } })).title, "  Legacy recipe  ");
    });

    await t.test("cached resolution preserves exact case-sensitive ingredient identities", async () => {
      const upper = await client.ingredient.create({ data: ingredientData("Case spice") });
      const lower = await client.ingredient.create({ data: ingredientData("case spice") });
      const preview = await prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Case recipe A", ["Case spice"]), recipeIntent("Case recipe B", ["case spice"])] }, null);
      const recipes = preview.items.filter((item) => item.kind === "createRecipe");
      assert.equal(recipes[0].after.ingredients[0].id, upper.id);
      assert.equal(recipes[1].after.ingredients[0].id, lower.id);
    });

    await t.test("recipe ingredient lookup ignores category and accepts an unspecified category", async () => {
      const existing = await client.ingredient.create({ data: ingredientData("Lookup salt", { category: "OTHER" }) });
      const intent = recipeIntent("Lookup recipe");
      intent.ingredients = [{ title: "Lookup salt", amount: "5 г", category: null }];
      const prepared = await prepareInventoryMutation(intent, null);
      assert.equal(prepared.preview.after.ingredients[0].id, existing.id);
      assert.equal(prepared.preview.after.ingredients[0].category, "OTHER");
      intent.ingredients[0].category = "SPICES";
      const differentCategory = await prepareInventoryMutation(intent, null);
      assert.equal(differentCategory.preview.after.ingredients[0].id, existing.id);
      assert.equal(differentCategory.preview.after.ingredients[0].category, "OTHER");
      intent.ingredients = [{ title: "Brand new uncategorized", amount: "1 г", category: null }];
      const missing = await prepareInventoryBatch({ kind: "list", operations: [intent] }, null);
      assert.equal(missing.items[0].kind, "createIngredient");
      assert.equal(missing.items[0].after.category, "OTHER");
    });

    await t.test("similar ingredient names block recipe creation and list alternatives across categories", async () => {
      await client.ingredient.create({ data: ingredientData("Lookup paprika sweet", { category: "SPICES" }) });
      await client.ingredient.create({ data: ingredientData("Lookup paprika smoked", { category: "OTHER" }) });
      const intent = recipeIntent("Ambiguous lookup recipe");
      intent.ingredients = [{ title: "Lookup paprika", amount: "2 г", category: null }];
      await assert.rejects(prepareInventoryBatch({ kind: "list", operations: [intent] }, null), (error) => {
        assert.match(error.message, /Lookup paprika sweet/);
        assert.match(error.message, /Lookup paprika smoked/);
        return true;
      });
      assert.equal(await client.recipe.count({ where: { title: intent.data.title } }), 0);
      assert.equal(await client.ingredient.count({ where: { title: "Lookup paprika" } }), 0);
    });

    await t.test("mixed batches resolve partial record and composition names and preserve other amounts", async () => {
      const garlic = await client.ingredient.create({ data: ingredientData("Тест часник", { isInStock: true }) });
      const salt = await client.ingredient.create({ data: ingredientData("Тест сіль") });
      const jar = await client.stuff.create({ data: stuffData("Тест банка", { inStock: 10 }) });
      const draft = await prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Тест приправа", ["Тест часник", "Тест сіль"])] }, null);
      await applyInventoryBatch(draft);
      const preview = await prepareInventoryBatch({ kind: "list", operations: [
        { kind: "updateIngredient", targetName: "часник", patch: ingredientPatch({ isInStock: false }) },
        { kind: "updateStuff", targetName: "банка", patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) },
        { kind: "updateRecipe", targetName: "приправа", patch: recipePatch({ description: "Приправа для овочів" }), composition: { mode: "patch", items: [{ action: "setAmount", title: "часник", amount: "8 г", category: null }] } },
      ] }, null);
      assert.equal(preview.items.length, 3);
      const recipePreview = preview.items.find((item) => item.kind === "updateRecipe");
      assert.equal(recipePreview.after.ingredients.find((item) => item.id === garlic.id).title, "Тест часник");
      await applyInventoryBatch(preview);
      assert.equal((await client.ingredient.findUnique({ where: { id: garlic.id } })).isInStock, false);
      assert.equal((await client.stuff.findUnique({ where: { id: jar.id } })).inStock, 15);
      const recipe = await client.recipe.findUnique({ where: { title: "Тест приправа" }, include: { ingredients: true } });
      assert.equal(recipe.ingredients.find((item) => item.ingredientId === garlic.id).amount, "8 г");
      assert.equal(recipe.ingredients.find((item) => item.ingredientId === salt.id).amount, "10 г");
      const removal = await prepareInventoryMutation({ kind: "updateRecipe", targetName: recipe.title, patch: recipePatch(), composition: { mode: "patch", items: [{ action: "remove", title: "часник", amount: null, category: null }] } }, null);
      assert.deepEqual(removal.preview.after.ingredients.map((item) => item.id), [salt.id]);
    });

    await t.test("ambiguous composition and duplicate aliases cannot partially change a batch", async () => {
      const draft = await prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Two garlic recipe", ["Garlic fresh", "Garlic dried"])] }, null);
      await applyInventoryBatch(draft);
      const update = (items) => ({ kind: "updateRecipe", targetName: "Two garlic recipe", patch: recipePatch(), composition: { mode: "patch", items } });
      const change = (title) => ({ action: "setAmount", title, amount: "8 г", category: null });
      await assert.rejects(prepareInventoryBatch({ kind: "list", operations: [update([change("Garlic")])] }, null), /Garlic fresh.*Garlic dried|Garlic dried.*Garlic fresh/);
      await assert.rejects(prepareInventoryMutation(update([change("fresh"), change("Garlic fresh")]), null), /Повторна зміна/);
      await assert.rejects(prepareInventoryMutation(update([change("Missing herb")]), null), /Доступні:.*Garlic/);
      const saved = await client.recipe.findUnique({ where: { title: "Two garlic recipe" }, include: { ingredients: true } });
      assert.equal(saved.ingredients.every((item) => item.amount === "10 г"), true);
      const reuse = await prepareInventoryMutation(recipeIntent("Reuse partial ingredient", ["fresh"]), null);
      assert.equal(reuse.preview.after.ingredients[0].title, "Garlic fresh");
      assert.notEqual(reuse.preview.after.ingredients[0].id, null);
    });

    await t.test("unchanged recipe requests are successful checks and preserve the database version", async () => {
      const recipe = await client.recipe.findUnique({ where: { title: "Test sauce" } });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "updateRecipe", targetName: recipe.title, patch: recipePatch({ notes: recipe.notes }), composition: null } } };
      const reply = await actions.askInventoryAssistant({ prompt: "Залиш нотатки без змін", selected: null, previousSearch: null, clarification: null });
      assert.equal(reply.ok, true);
      assert.equal(reply.data.operation, "noChanges");
      assert.ok(reply.data.message.includes(recipe.title));
      const after = await client.recipe.findUnique({ where: { id: recipe.id } });
      assert.equal(after.updatedAt.toISOString(), recipe.updatedAt.toISOString());
    });

    await t.test("unauthorized batch confirmation performs no writes", async (subtest) => {
      subtest.mock.method(console, "error", () => {});
      admin = false;
      const reply = await actions.confirmInventoryBatch({ items: [{ kind: "createStuff", after: stuffData("Forbidden jar") }], unchanged: [] });
      assert.equal(reply.ok, false);
      assert.equal(await client.stuff.count({ where: { title: "Forbidden jar" } }), 0);
    });
  } finally {
    Module._load = originalLoad;
    if (originalTs) require.extensions[".ts"] = originalTs; else delete require.extensions[".ts"];
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
    if (client) await client.$disconnect();
    await db.close();
  }
});
