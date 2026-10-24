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
      const later = await client.ingredient.create({ data: ingredientData("Late referenced spice") });
      const preview = await prepareInventoryBatch({ kind: "list", operations: [{ kind: "deleteIngredient", targetName: "Free image spice" }, { kind: "deleteIngredient", targetName: later.title }] }, null);
      await client.recipe.create({ data: { ...recipeData("Late referencing recipe"), ingredients: { create: { ingredientId: later.id, amount: "1 г" } } } });
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

    await t.test("multiple batch choices preserve every operation and resume without another model call", async () => {
      const jarA = await client.stuff.create({ data: stuffData("Choice jar 250", { inStock: 10 }) });
      const jarB = await client.stuff.create({ data: stuffData("Choice jar 500", { inStock: 20 }) });
      const garlicA = await client.ingredient.create({ data: ingredientData("Choice garlic fresh", { isInStock: true }) });
      const garlicB = await client.ingredient.create({ data: ingredientData("Choice garlic dried", { isInStock: true }) });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "list", operations: [
        { kind: "updateStuff", targetName: "Choice jar", patch: stuffPatch({ stock: { mode: "adjust", value: 5 } }) },
        { kind: "updateIngredient", targetName: "Choice garlic", patch: ingredientPatch({ isInStock: false }) },
        { kind: "createStuff", data: stuffData("Choice new decor", { category: "DECOR", inStock: 7 }) },
      ] } } };
      const initial = await actions.askInventoryAssistant({ prompt: "Зміни банки й часник та створи декор", selected: null, previousSearch: null, clarification: null });
      assert.equal(initial.ok, true);
      assert.equal(initial.data.operation, "chooseRecord");
      const providerCalls = apiCalls;
      assert.equal(initial.data.question.candidates.length, 2);
      assert.equal(await client.stuff.count({ where: { title: "Choice new decor" } }), 0);
      const first = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "stuff", id: jarB.id } }, page: null });
      assert.equal(first.ok, true);
      assert.equal(first.data.operation, "chooseRecord");
      assert.equal(first.data.question.name, "Choice garlic");
      await client.stuff.create({ data: stuffData("Choice jar later", { inStock: 99 }) });
      assert.equal((await client.stuff.findUnique({ where: { id: jarB.id } })).inStock, 20);
      const final = await actions.resumeInventoryWrite({ pending: first.data.pending, choice: { key: first.data.question.key, selection: { entity: "ingredient", id: garlicA.id } }, page: null });
      assert.equal(final.ok, true);
      assert.equal(final.data.operation, "batch");
      assert.equal(final.data.preview.items.length, 3);
      assert.equal(apiCalls, providerCalls);
      assert.equal(final.data.preview.items.find((item) => item.kind === "updateStuff").after.inStock, 25);
      assert.equal(await client.stuff.count({ where: { title: "Choice new decor" } }), 0);
      const confirmed = await actions.confirmInventoryBatch(final.data.preview);
      assert.equal(confirmed.ok, true);
      assert.equal((await client.stuff.findUnique({ where: { id: jarB.id } })).inStock, 25);
      assert.equal((await client.stuff.findUnique({ where: { id: jarA.id } })).inStock, 10);
      assert.equal((await client.ingredient.findUnique({ where: { id: garlicA.id } })).isInStock, false);
      assert.equal((await client.ingredient.findUnique({ where: { id: garlicB.id } })).isInStock, true);
    });

    await t.test("recipe composition choices stay scoped to the recipe and preserve the batch", async (subtest) => {
      subtest.mock.method(console, "error", () => {});
      const draft = await prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Scoped recipe", ["Scoped garlic fresh", "Scoped garlic dried", "Scoped salt"])] }, null);
      await applyInventoryBatch(draft);
      const fresh = await client.ingredient.findUnique({ where: { title: "Scoped garlic fresh" } });
      const outside = await client.ingredient.create({ data: ingredientData("Scoped garlic outside") });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "list", operations: [
        { kind: "createStuff", data: stuffData("Scoped extra jar", { inStock: 9 }) },
        { kind: "updateRecipe", targetName: "Scoped recipe", patch: recipePatch({ description: "Keep this description" }), composition: { mode: "patch", items: [{ action: "setAmount", title: "Scoped garlic", amount: "8 г", category: null }] } },
      ] } } };
      const initial = await actions.askInventoryAssistant({ prompt: "Зміни часник у рецепті та створи банку", selected: null, previousSearch: null, clarification: null });
      assert.equal(initial.ok, true);
      assert.equal(initial.data.operation, "chooseRecord");
      assert.equal(initial.data.question.candidates.length, 2);
      assert.equal(initial.data.question.candidates.some((item) => item.id === outside.id), false);
      const invalid = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: outside.id } }, page: null });
      assert.equal(invalid.ok, false);
      assert.equal(await client.stuff.count({ where: { title: "Scoped extra jar" } }), 0);
      const final = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: fresh.id } }, page: null });
      assert.equal(final.ok, true);
      assert.equal(final.data.preview.items.length, 2);
      const recipe = final.data.preview.items.find((item) => item.kind === "updateRecipe");
      assert.equal(recipe.after.fields.description, "Keep this description");
      assert.equal(recipe.after.ingredients.find((item) => item.id === fresh.id).amount, "8 г");
      assert.equal(recipe.after.ingredients.filter((item) => item.id !== fresh.id).every((item) => item.amount === "10 г"), true);
    });

    await t.test("recipe creation ingredient choices reuse inventory and retain proposed missing creates", async () => {
      await client.ingredient.create({ data: ingredientData("New recipe herb A") });
      const herbB = await client.ingredient.create({ data: ingredientData("New recipe herb B", { category: "OTHER" }) });
      const intent = recipeIntent("New choice recipe", ["New recipe herb", "New missing spice"]);
      modelPlan = { message: "Перегляд", assumptions: ["Рецепт прихований"], command: { kind: "mutation", intent } };
      const initial = await actions.askInventoryAssistant({ prompt: "Створи рецепт з травою", selected: null, previousSearch: null, clarification: null });
      assert.equal(initial.data.operation, "chooseRecord");
      const calls = apiCalls;
      const final = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: herbB.id } }, page: null });
      assert.equal(final.ok, true);
      assert.equal(apiCalls, calls);
      assert.equal(final.data.preview.items.length, 2);
      assert.deepEqual(final.data.assumptions, ["Рецепт прихований"]);
      const recipe = final.data.preview.items.find((item) => item.kind === "createRecipe");
      assert.equal(recipe.after.ingredients[0].id, herbB.id);
      assert.equal(recipe.after.ingredients[0].category, "OTHER");
      assert.equal(await client.recipe.count({ where: { title: intent.data.title } }), 0);
      assert.equal(await client.ingredient.count({ where: { title: "New missing spice" } }), 0);
    });

    await t.test("candidate pagination can choose beyond the first page without truncation or AI calls", async () => {
      await client.stuff.createMany({ data: Array.from({ length: 23 }, (_, index) => stuffData(`Paged jar ${String(index).padStart(2, "0")}`)) });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "updateStuff", targetName: "Paged jar", patch: stuffPatch({ stock: { mode: "set", value: 3 } }) } } };
      const initial = await actions.askInventoryAssistant({ prompt: "Зміни залишок банки", selected: null, previousSearch: null, clarification: null });
      assert.equal(initial.data.question.candidates.length, 20);
      assert.equal(initial.data.question.hasMore, true);
      const calls = apiCalls;
      const next = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: null, page: { key: initial.data.question.key, number: 1 } });
      assert.equal(next.data.question.candidates.length, 3);
      assert.equal(next.data.question.hasMore, false);
      const last = next.data.question.candidates[2];
      const final = await actions.resumeInventoryWrite({ pending: next.data.pending, choice: { key: next.data.question.key, selection: { entity: last.entity, id: last.id } }, page: null });
      assert.equal(final.ok, true);
      assert.equal(final.data.preview.target.id, last.id);
      assert.equal(final.data.preview.after.inStock, 3);
      assert.equal(apiCalls, calls);
    });

    await t.test("deleted choices and forged entity/key selections fail without writes", async (subtest) => {
      subtest.mock.method(console, "error", () => {});
      const a = await client.stuff.create({ data: stuffData("Stale choice A") });
      await client.stuff.create({ data: stuffData("Stale choice B") });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "deleteStuff", targetName: "Stale choice" } } };
      const initial = await actions.askInventoryAssistant({ prompt: "Видали банку", selected: null, previousSearch: null, clarification: null });
      const invalidEntity = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: a.id } }, page: null });
      assert.equal(invalidEntity.ok, false);
      const invalidKey = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: "99:target", selection: { entity: "stuff", id: a.id } }, page: null });
      assert.equal(invalidKey.ok, false);
      await client.stuff.delete({ where: { id: a.id } });
      const removed = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "stuff", id: a.id } }, page: null });
      assert.equal(removed.ok, false);
      assert.equal(removed.code, "STALE_PREVIEW");
      assert.equal(await client.stuff.count({ where: { title: "Stale choice B" } }), 1);
      const duplicateDecisions = await actions.resumeInventoryWrite({ pending: { ...initial.data.pending, decisions: [ { key: "0:target", selection: { entity: "stuff", id: a.id }, title: "Stale choice A" }, { key: "0:target", selection: { entity: "stuff", id: a.id }, title: "Stale choice A" } ] }, choice: null, page: null });
      assert.equal(duplicateDecisions.ok, false);
    });

    await t.test("recipe target selection can be followed by composition selection in one request", async () => {
      const creation = await prepareInventoryBatch({ kind: "list", operations: [recipeIntent("Pick recipe A", ["Pick garlic A", "Pick garlic B"]), recipeIntent("Pick recipe B", ["Pick garlic A", "Pick garlic B"])] }, null);
      await applyInventoryBatch(creation);
      const recipeB = await client.recipe.findUnique({ where: { title: "Pick recipe B" } });
      const garlicB = await client.ingredient.findUnique({ where: { title: "Pick garlic B" } });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "updateRecipe", targetName: "Pick recipe", patch: recipePatch({ notes: "Preserved note" }), composition: { mode: "patch", items: [{ action: "setAmount", title: "Pick garlic", amount: "9 г", category: null }] } } } };
      const first = await actions.askInventoryAssistant({ prompt: "Зміни часник у рецепті", selected: null, previousSearch: null, clarification: null });
      assert.equal(first.data.operation, "chooseRecord");
      assert.equal(first.data.question.candidates[0].entity, "recipe");
      const second = await actions.resumeInventoryWrite({ pending: first.data.pending, choice: { key: first.data.question.key, selection: { entity: "recipe", id: recipeB.id } }, page: null });
      assert.equal(second.data.operation, "chooseRecord");
      assert.equal(second.data.question.candidates[0].entity, "ingredient");
      const ready = await actions.resumeInventoryWrite({ pending: second.data.pending, choice: { key: second.data.question.key, selection: { entity: "ingredient", id: garlicB.id } }, page: null });
      assert.equal(ready.ok, true);
      assert.equal(ready.data.preview.items[0].target.id, recipeB.id);
      assert.equal(ready.data.preview.items[0].after.fields.notes, "Preserved note");
      const confirmed = await actions.confirmInventoryBatch(ready.data.preview);
      assert.equal(confirmed.ok, true);
      const changed = await client.recipe.findUnique({ where: { id: recipeB.id }, include: { ingredients: true } });
      assert.equal(changed.ingredients.find((item) => item.ingredientId === garlicB.id).amount, "9 г");
      const untouched = await client.recipe.findUnique({ where: { title: "Pick recipe A" }, include: { ingredients: true } });
      assert.equal(untouched.ingredients.every((item) => item.amount === "10 г"), true);
    });

    await t.test("tolerant search preserves SQL filters and approximate writes require choice before confirmation", async () => {
      const pepper = await client.ingredient.create({ data: ingredientData("Чорний перець мелений", { isInStock: true }) });
      const turmeric = await client.ingredient.create({ data: ingredientData("Куркума") });
      const filters = { entity: "ingredient", text: "перець чорний", category: null, isInStock: true, isSaved: null };
      const reordered = await actions.searchInventoryRecords(filters);
      assert.equal(reordered.ok, true);
      assert.deepEqual(reordered.data.items.map((row) => row.id), [pepper.id]);
      assert.equal((await actions.searchInventoryRecords({ ...filters, isInStock: false })).data.items.length, 0);
      assert.deepEqual((await actions.searchInventoryRecords({ ...filters, text: "куркумма", isInStock: false })).data.items.map((row) => row.id), [turmeric.id]);
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "updateIngredient", targetName: "куркумма", patch: ingredientPatch({ isInStock: true }) } } };
      const initial = await actions.askInventoryAssistant({ prompt: "Познач інгредієнт куркумма як наявний", selected: null, previousSearch: null, clarification: null });
      assert.equal(initial.ok, true);
      assert.equal(initial.data.operation, "chooseRecord");
      assert.deepEqual(initial.data.question.candidates.map((row) => row.id), [turmeric.id]);
      assert.equal((await client.ingredient.findUnique({ where: { id: turmeric.id } })).isInStock, false);
      const ready = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: turmeric.id } }, page: null });
      assert.equal(ready.ok, true);
      assert.equal(ready.data.operation, "mutation");
      assert.equal((await client.ingredient.findUnique({ where: { id: turmeric.id } })).isInStock, false);
      assert.equal((await actions.confirmInventoryMutation(ready.data.preview)).ok, true);
      assert.equal((await client.ingredient.findUnique({ where: { id: turmeric.id } })).isInStock, true);
    });

    await t.test("recipe ingredient filters and dependency resolution tolerate spelling without duplicate creation", async () => {
      const turmeric = await client.ingredient.findUnique({ where: { title: "Куркума" } });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "createRecipe", data: recipeData("Tolerance sauce"), ingredients: [named("куркумма")] } } };
      const initial = await actions.askInventoryAssistant({ prompt: "Створи рецепт з куркуммою", selected: null, previousSearch: null, clarification: null });
      assert.equal(initial.data.operation, "chooseRecord");
      const ready = await actions.resumeInventoryWrite({ pending: initial.data.pending, choice: { key: initial.data.question.key, selection: { entity: "ingredient", id: turmeric.id } }, page: null });
      assert.equal(ready.ok, true);
      assert.deepEqual(ready.data.preview.items.map((item) => item.kind), ["createRecipe"]);
      assert.equal((await actions.confirmInventoryBatch(ready.data.preview)).ok, true);
      assert.equal(await client.ingredient.count({ where: { title: "куркумма" } }), 0);
      const search = { entity: "recipe", text: null, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: ["куркумма"], excludeIngredients: [] };
      const included = await actions.searchInventoryRecords(search);
      assert.equal(included.ok, true);
      assert.deepEqual(included.data.items.map((row) => row.title), ["Tolerance sauce"]);
      const excluded = await actions.searchInventoryRecords({ ...search, text: "Tolerance sauce", includeIngredients: [], excludeIngredients: ["куркумма"] });
      assert.equal(excluded.ok, true);
      assert.equal(excluded.data.items.length, 0);
    });

    await t.test("explicit duplicate ingredient creation can reuse a record without overwriting its fields", async () => {
      const existing = await client.ingredient.findUnique({ where: { title: "Куркума" } });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "createIngredient", data: ingredientData("Куркумма", { category: "OTHER", description: "Do not copy", isInStock: false }) } } };
      const first = await actions.askInventoryAssistant({ prompt: "Створи інгредієнт Куркумма", selected: null, previousSearch: null, clarification: null });
      assert.equal(first.data.question.purpose, "ingredientCreation");
      const calls = apiCalls;
      const reused = await actions.resumeInventoryWrite({ pending: first.data.pending, choice: { key: first.data.question.key, selection: { entity: "ingredient", id: existing.id } }, page: null });
      assert.equal(reused.ok, true);
      assert.equal(reused.data.operation, "viewSelected");
      assert.equal(reused.data.record.id, existing.id);
      assert.deepEqual(await client.ingredient.findUnique({ where: { id: existing.id } }), existing);
      assert.equal(await client.ingredient.count({ where: { title: "Куркумма" } }), 0);
      assert.equal(apiCalls, calls);
    });

    await t.test("duplicate reuse preserves mixed batches and recipe dependencies regardless of operation order", async () => {
      const existing = await client.ingredient.findUnique({ where: { title: "Куркума" } });
      const jar = await client.stuff.create({ data: stuffData("Duplicate review jar") });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "list", operations: [
        recipeIntent("Duplicate review recipe", ["Куркумма"]),
        { kind: "createIngredient", data: ingredientData("Куркумма", { category: "OTHER", description: "Do not copy" }) },
        { kind: "updateStuff", targetName: jar.title, patch: stuffPatch({ stock: { mode: "adjust", value: 3 } }) },
      ] } } };
      const first = await actions.askInventoryAssistant({ prompt: "Створи рецепт, інгредієнт та поповни банку", selected: null, previousSearch: null, clarification: null });
      assert.equal(first.data.question.key, "1:createIngredient");
      const ready = await actions.resumeInventoryWrite({ pending: first.data.pending, choice: { key: first.data.question.key, selection: { entity: "ingredient", id: existing.id } }, page: null });
      assert.equal(ready.ok, true);
      assert.equal(ready.data.operation, "batch");
      assert.deepEqual(ready.data.preview.items.map((item) => item.kind), ["createRecipe", "updateStuff"]);
      assert.equal(ready.data.preview.items[0].after.ingredients[0].id, existing.id);
      assert.equal(ready.data.preview.unchanged.length, 1);
      assert.equal(await client.recipe.count({ where: { title: "Duplicate review recipe" } }), 0);
      const saved = await actions.confirmInventoryBatch(ready.data.preview);
      assert.equal(saved.ok, true);
      assert.equal((await client.stuff.findUnique({ where: { id: jar.id } })).inStock, 13);
      assert.deepEqual(await client.ingredient.findUnique({ where: { id: existing.id } }), existing);
      assert.equal(await client.ingredient.count({ where: { title: "Куркумма" } }), 0);
      const recipe = await client.recipe.findUnique({ where: { title: "Duplicate review recipe" }, include: { ingredients: true } });
      assert.equal(recipe.ingredients[0].ingredientId, existing.id);
    });

    await t.test("distinct creation survives later choices, preserves explicit fields, and saves only after confirmation", async () => {
      const pepper = await client.ingredient.findUnique({ where: { title: "Чорний перець мелений" } });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "list", operations: [
        { kind: "createIngredient", data: ingredientData("Куркумма", { description: "Intentional distinct record", category: "OTHER" }) },
        { kind: "createIngredient", data: ingredientData("Перець чорний мелений") },
      ] } } };
      const first = await actions.askInventoryAssistant({ prompt: "Створи два інгредієнти", selected: null, previousSearch: null, clarification: null });
      const second = await actions.resumeInventoryWrite({ pending: first.data.pending, choice: { key: first.data.question.key, createNew: true }, page: null });
      assert.equal(second.ok, true);
      assert.equal(second.data.question.key, "1:createIngredient");
      const calls = apiCalls;
      const ready = await actions.resumeInventoryWrite({ pending: second.data.pending, choice: { key: second.data.question.key, selection: { entity: "ingredient", id: pepper.id } }, page: null });
      assert.equal(ready.ok, true);
      assert.equal(apiCalls, calls);
      assert.equal(ready.data.preview.items.length, 1);
      assert.equal(ready.data.preview.items[0].after.title, "Куркумма");
      assert.equal(ready.data.preview.items[0].after.category, "OTHER");
      assert.equal(ready.data.preview.items[0].duplicateReview.title, "Куркумма");
      assert.equal(await client.ingredient.count({ where: { title: "Куркумма" } }), 0);
      assert.equal((await actions.confirmInventoryBatch(ready.data.preview)).ok, true);
      assert.equal((await client.ingredient.findUnique({ where: { title: "Куркумма" } })).description, "Intentional distinct record");
    });

    await t.test("confirmation rechecks edited titles and new near matches atomically", async (subtest) => {
      subtest.mock.method(console, "error", () => {});
      const earlier = { kind: "createStuff", after: stuffData("Must not save on duplicate conflict") };
      const unreviewed = { kind: "createIngredient", after: ingredientData("Перець чорний мелений") };
      const refused = await actions.confirmInventoryBatch({ items: [earlier, unreviewed], unchanged: [] });
      assert.equal(refused.ok, false);
      assert.equal(refused.code, "CONFLICT");
      assert.equal(await client.stuff.count({ where: { title: earlier.after.title } }), 0);
      assert.equal(await client.ingredient.count({ where: { title: unreviewed.after.title } }), 0);
      const existing = await client.ingredient.findUnique({ where: { title: "Чорний перець мелений" } });
      const approved = { ...unreviewed, duplicateReview: { title: unreviewed.after.title, candidates: [{ id: existing.id, title: existing.title }] } };
      await client.ingredient.create({ data: ingredientData("Чорний перець мелений дрібний") });
      const changed = await actions.confirmInventoryBatch({ items: [earlier, approved], unchanged: [] });
      assert.equal(changed.ok, false);
      assert.equal(changed.code, "CONFLICT");
      assert.equal(await client.stuff.count({ where: { title: earlier.after.title } }), 0);
      const edited = await actions.confirmInventoryMutation({ ...approved, after: { ...approved.after, title: "Перець чорний" } });
      assert.equal(edited.ok, false);
      assert.equal(edited.code, "CONFLICT");
    });

    await t.test("expanded search fields execute against stored columns and relationships", async (sub) => {
      const linked = await client.ingredient.create({ data: ingredientData("Stored ingredient linked", { description: null }) });
      const unused = await client.ingredient.create({ data: ingredientData("Stored ingredient unused", { description: "Опис", imageKey: "ingredient-photo" }) });
      const a = await client.recipe.create({ data: { ...recipeData("Stored fields A", { notes: "менше оцту; перевірити 50%_", confirmationNotes: "Контроль солі" }), ingredients: { create: [{ ingredientId: linked.id, amount: "5 г" }] }, variants: { create: [{ label: "250 г", inStock: 0 }, { label: "500 г", inStock: 9 }] } } });
      const b = await client.recipe.create({ data: { ...recipeData("Stored fields B", { description: "менше оцту", imageKey: "recipe-photo" }), variants: { create: [{ label: "250 г", inStock: 7 }] } } });
      const c = await client.recipe.create({ data: { ...recipeData("Stored fields C", { notes: "менше оцту", imageKey: "", confirmationNotes: "" }), variants: { create: [{ label: "250 г", inStock: 0 }] } } });
      const d = await client.recipe.create({ data: recipeData("Stored fields D", { description: "Опис", imageKey: "other-photo" }) });
      const base = { entity: "recipe", text: null, titleText: "Stored fields", category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] };
      async function ids(search) {
        const result = await actions.searchInventoryRecords(search);
        assert.equal(result.ok, true, result.message);
        return result.data.items.map((row) => row.id);
      }
      await sub.test("photo absence and scoped notes prompts keep their actual conditions", async () => {
        for (const [prompt, filters, expected] of [
          ["Покажи рецепти без фото", { hasImage: false }, [a.id, c.id]],
          ["Знайди рецепти, де в нотатках є менше оцту", { notesText: "менше оцту" }, [a.id, c.id]],
        ]) {
          modelPlan = { message: "Пошук", assumptions: [], command: { kind: "search", search: { ...base, ...filters } } };
          const result = await actions.askInventoryAssistant({ prompt, selected: null, previousSearch: null, clarification: null });
          assert.equal(result.ok, true);
          assert.deepEqual(result.data.results.items.map((row) => row.id), expected);
        }
        assert.deepEqual(await ids({ ...base, notesText: "50%_" }), [a.id]);
        assert.deepEqual(await ids({ ...base, notesText: "50%X" }), []);
        assert.deepEqual((await ids({ ...base, text: "менше оцту" })).sort((x, y) => x - y), [a.id, b.id, c.id]);
        assert.deepEqual(await ids({ ...base, confirmationNotesText: "Контроль солі" }), [a.id]);
        assert.deepEqual(await ids({ ...base, text: "Контроль солі" }), [a.id]);
        assert.deepEqual(await ids({ ...base, descriptionText: "менше оцту" }), [b.id]);
      });
      await sub.test("missing text/composition and ingredient usage preserve null, empty and false", async () => {
        assert.deepEqual(await ids({ ...base, hasImage: true }), [b.id, d.id]);
        assert.deepEqual(await ids({ ...base, hasDescription: false }), [a.id, c.id]);
        assert.deepEqual(await ids({ ...base, hasDescription: true }), [b.id, d.id]);
        assert.deepEqual(await ids({ ...base, hasNotes: false }), [b.id, d.id]);
        assert.deepEqual(await ids({ ...base, hasConfirmationNotes: false }), [b.id, c.id, d.id]);
        assert.deepEqual(await ids({ ...base, hasIngredients: false }), [b.id, c.id, d.id]);
        assert.deepEqual(await ids({ ...base, hasIngredients: true }), [a.id]);
        assert.deepEqual(await ids({ ...base, hasVariants: false }), [d.id]);
        assert.deepEqual(await ids({ ...base, hasVariants: true }), [a.id, b.id, c.id]);
        const ingredients = { entity: "ingredient", text: null, titleText: "Stored ingredient", category: null, isInStock: null, isSaved: null };
        assert.deepEqual(await ids({ ...ingredients, usedInRecipes: false, hasImage: true }), [unused.id]);
        assert.deepEqual(await ids({ ...ingredients, usedInRecipes: true, hasDescription: false }), [linked.id]);
      });
      await sub.test("variant label and stock refer to the same variant, and missing variants are not zero stock", async () => {
        assert.deepEqual(await ids({ ...base, variantLabel: "250 г", variantInStock: true }), [b.id]);
        assert.deepEqual(await ids({ ...base, variantLabel: "250 г", variantInStock: false }), [a.id, c.id]);
        assert.deepEqual(await ids({ ...base, variantLabel: "250 г", variantStockMin: 2, variantStockMax: 8 }), [b.id]);
        assert.deepEqual(await ids({ ...base, variantLabel: "250 г", variantStockMin: 8 }), []);
        assert.deepEqual(await ids({ ...base, isInStock: true }), [a.id, b.id]);
      });
      await sub.test("new filters survive clarification/refinement and frozen atomic batch previews", async () => {
        modelPlan = { message: "Пошук", assumptions: [], command: { kind: "search", search: { ...base, hasImage: false, notesText: "менше оцту", isHidden: true } } };
        const result = await actions.askInventoryAssistant({ prompt: "А лише приховані", selected: null, previousSearch: { ...base, hasImage: false, notesText: "менше оцту" }, clarification: null });
        assert.equal(result.ok, true);
        assert.deepEqual(result.data.results.items.map((row) => row.id), [a.id, c.id]);
        const preview = await prepareInventoryBatch({ kind: "filter", search: { ...base, hasImage: false, notesText: "менше оцту" }, change: { kind: "updateRecipes", patch: recipePatch({ isSaved: true }) } }, null);
        assert.deepEqual(preview.items.map((row) => row.target.id), [a.id, c.id]);
        const late = await client.recipe.create({ data: recipeData("Stored fields late", { notes: "менше оцту" }) });
        await applyInventoryBatch(preview);
        assert.equal((await client.recipe.findUnique({ where: { id: a.id } })).isSaved, true);
        assert.equal((await client.recipe.findUnique({ where: { id: c.id } })).isSaved, true);
        assert.equal((await client.recipe.findUnique({ where: { id: late.id } })).isSaved, false);
      });
    });

    await t.test("calendar-date filters use inclusive/exclusive Kyiv boundaries for every entity", async () => {
      const instants = ["2026-10-22T20:59:59.999Z", "2026-10-22T21:00:00.000Z", "2026-10-23T20:59:59.999Z", "2026-10-23T21:00:00.000Z"];
      for (const [index, instant] of instants.entries()) {
        const timestamps = { createdAt: new Date(instant), updatedAt: new Date(instant) };
        await client.stuff.create({ data: { ...stuffData(`Calendar fixture ${index}`), ...timestamps } });
        await client.ingredient.create({ data: { ...ingredientData(`Calendar fixture ${index}`), ...timestamps } });
        await client.recipe.create({ data: { ...recipeData(`Calendar fixture ${index}`), ...timestamps } });
      }
      const filters = { entity: "all", text: null, titleText: "Calendar fixture", createdFrom: "2026-10-23", createdBefore: "2026-10-24", updatedFrom: "2026-10-23", updatedBefore: "2026-10-24" };
      const found = await actions.searchInventoryRecords(filters);
      assert.equal(found.ok, true);
      assert.equal(found.data.items.length, 6);
      const hit = found.data.items.find((row) => row.entity === "stuff");
      const detail = await actions.getInventoryRecord({ entity: hit.entity, id: hit.id });
      assert.equal(detail.ok, true);
      assert.match(detail.data.fields.find((field) => field.label === "Створено (Київ)").value, /23\.10\./);
      for (const entity of ["ingredient", "recipe", "stuff"]) assert.deepEqual(found.data.items.filter((row) => row.entity === entity).map((row) => row.title), ["Calendar fixture 1", "Calendar fixture 2"]);
      const packaging = { entity: "stuff", text: null, titleText: "Calendar fixture", category: null, isInStock: null, stockMin: null, stockMax: null, hasDescription: false };
      assert.equal((await actions.searchInventoryRecords(packaging)).data.items.length, 4);
    });

    await t.test("short draft stock revision preserves a resolved target and needs fresh confirmation", async () => {
      const jar = await client.stuff.create({ data: stuffData("Task correction jar") });
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "updateStuff", targetName: "Task correction", patch: stuffPatch({ description: "Keep the proposed description", stock: { mode: "adjust", value: 5 } }) } } };
      const first = await actions.askInventoryAssistant({ prompt: "Додай 5 до залишку Task correction", selected: null, previousSearch: null, clarification: null });
      assert.equal(first.data.preview.after.inStock, 15);
      const other = await client.stuff.create({ data: stuffData("Task correction other jar") });
      modelPlan = { message: "Уточнюю", assumptions: [], command: { kind: "revise", revision: { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: stuffPatch({ stock: { mode: null, value: 7 } }) } }] } } };
      const revised = await actions.askInventoryAssistant({ prompt: "Краще 7", selected: null, previousSearch: null, clarification: null, activeWrite: { phase: "draft", pending: first.data.resolved } });
      assert.equal(revised.ok, true);
      assert.equal(revised.data.operation, "mutation");
      assert.equal(revised.data.preview.target.id, jar.id);
      assert.equal(revised.data.preview.after.inStock, 17);
      assert.equal(revised.data.preview.after.description, "Keep the proposed description");
      assert.equal((await client.stuff.findUnique({ where: { id: jar.id } })).inStock, 10);
      assert.equal((await actions.confirmInventoryMutation(revised.data.preview)).ok, true);
      assert.equal((await client.stuff.findUnique({ where: { id: jar.id } })).inStock, 17);
      assert.equal((await client.stuff.findUnique({ where: { id: other.id } })).inStock, 10);
    });

    await t.test("recipe revision keeps chosen ingredient IDs when removing and editing draft composition", async () => {
      const salt = await client.ingredient.create({ data: ingredientData("Task recipe salt") });
      await client.ingredient.create({ data: ingredientData("Task recipe garlic fresh") });
      const garlic = await client.ingredient.create({ data: ingredientData("Task recipe garlic dried", { category: "OTHER" }) });
      const pepper = await client.ingredient.create({ data: ingredientData("Task recipe pepper") });
      const intent = { kind: "createRecipe", data: recipeData("Task revised blend", { category: "SPICES", description: "User description", notes: "Keep notes", isSaved: true }), ingredients: [
        { title: salt.title, amount: "3 г", category: null }, { title: "Task recipe garlic", amount: "5 г", category: null }, { title: pepper.title, amount: "2 г", category: null },
      ] };
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent } };
      const choice = await actions.askInventoryAssistant({ prompt: "Створи рецепт", selected: null, previousSearch: null, clarification: null });
      assert.equal(choice.data.operation, "chooseRecord");
      const calls = apiCalls;
      const ready = await actions.resumeInventoryWrite({ pending: choice.data.pending, choice: { key: choice.data.question.key, selection: { entity: "ingredient", id: garlic.id } }, page: null });
      assert.equal(ready.data.operation, "batch");
      assert.equal(apiCalls, calls);
      // A competing literal name must not replace a prior explicit ingredient choice.
      await client.ingredient.create({ data: ingredientData("Task recipe garlic ground") });
      modelPlan = { message: "Уточнюю", assumptions: [], command: { kind: "revise", revision: { changes: [{ operationIndex: 0, change: { kind: "recipe", patch: recipePatch(), composition: { mode: "patch", items: [
        { action: "remove", title: salt.title, amount: null, category: null }, { action: "setAmount", title: garlic.title, amount: "7 г", category: null },
      ] } } }] } } };
      const revised = await actions.askInventoryAssistant({ prompt: "Прибери сіль, часнику 7 г", selected: null, previousSearch: null, clarification: null, activeWrite: { phase: "draft", pending: ready.data.resolved } });
      assert.equal(revised.ok, true);
      assert.equal(revised.data.operation, "batch");
      const snapshot = revised.data.preview.items.find((item) => item.kind === "createRecipe").after;
      assert.deepEqual(snapshot.ingredients.map((item) => [item.id, item.amount]), [[garlic.id, "7 г"], [pepper.id, "2 г"]]);
      assert.equal(snapshot.ingredients[0].category, "OTHER");
      assert.deepEqual(snapshot.fields, intent.data);
      assert.equal(await client.recipe.count({ where: { title: intent.data.title } }), 0);
      assert.equal((await actions.confirmInventoryBatch(revised.data.preview)).ok, true);
      const saved = await client.recipe.findUnique({ where: { title: intent.data.title }, include: { ingredients: true } });
      assert.equal(saved.ingredients.length, 2);
      assert.equal(saved.ingredients.find((item) => item.ingredientId === garlic.id).amount, "7 г");
      assert.equal(saved.notes, "Keep notes");
    });

    await t.test("filtered revisions retain their original cohort including unchanged rows and exclude later matches", async () => {
      const a = await client.stuff.create({ data: stuffData("Frozen task A", { inStock: 0 }) });
      const b = await client.stuff.create({ data: stuffData("Frozen task B", { inStock: 5 }) });
      const search = { entity: "stuff", text: null, titleText: "Frozen task", category: null, isInStock: null, stockMin: null, stockMax: null };
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "filter", search, change: { kind: "updateStuff", patch: stuffPatch({ stock: { mode: "set", value: 5 } }) } } } };
      const first = await actions.askInventoryAssistant({ prompt: "Встанови 5 для Frozen task", selected: null, previousSearch: null, clarification: null });
      assert.equal(first.data.preview.items.length, 1);
      assert.equal(first.data.preview.unchanged.length, 1);
      assert.deepEqual(first.data.resolved.targets, [{ entity: "stuff", id: a.id }, { entity: "stuff", id: b.id }]);
      const later = await client.stuff.create({ data: stuffData("Frozen task C", { inStock: 0 }) });
      modelPlan = { message: "Уточнюю", assumptions: [], command: { kind: "revise", revision: { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: stuffPatch({ stock: { mode: null, value: 7 } }) } }] } } };
      const revised = await actions.askInventoryAssistant({ prompt: "Краще 7", selected: null, previousSearch: null, clarification: null, activeWrite: { phase: "draft", pending: first.data.resolved } });
      assert.equal(revised.ok, true);
      assert.deepEqual(revised.data.preview.items.map((item) => item.target.id), [a.id, b.id]);
      assert.equal((await actions.confirmInventoryBatch(revised.data.preview)).ok, true);
      assert.equal((await client.stuff.findUnique({ where: { id: a.id } })).inStock, 7);
      assert.equal((await client.stuff.findUnique({ where: { id: b.id } })).inStock, 7);
      assert.equal((await client.stuff.findUnique({ where: { id: later.id } })).inStock, 0);
    });

    await t.test("deleted selections across all entities do not block independent search or creation", async () => {
      const search = { entity: "stuff", text: null, category: null, isInStock: null, stockMin: null, stockMax: null };
      for (const entity of ["ingredient", "stuff", "recipe"]) {
        const data = entity === "ingredient" ? ingredientData(`Expired ${entity}`) : entity === "stuff" ? stuffData(`Expired ${entity}`) : recipeData(`Expired ${entity}`);
        const old = await client[entity].create({ data });
        await client[entity].delete({ where: { id: old.id } });
        const selected = { entity, id: old.id };
        modelPlan = { message: "Пошук", assumptions: [], clarificationMode: "independent", command: { kind: "search", search } };
        const found = await actions.askInventoryAssistant({ prompt: "Покажи всі матеріали", selected, previousSearch: null, clarification: null });
        assert.equal(found.ok, true);
        assert.equal(found.data.operation, "search");
        assert.deepEqual(found.data.selectionExpired.selection, selected);
        const title = `Unwritten replacement ${entity}`;
        modelPlan = { message: "Перегляд", assumptions: [], clarificationMode: "independent", command: { kind: "mutation", intent: { kind: "createStuff", data: stuffData(title) } } };
        const created = await actions.askInventoryAssistant({ prompt: `Створи ${title}`, selected, previousSearch: null, clarification: null });
        assert.equal(created.data.operation, "mutation");
        assert.equal(created.data.resolved.selected, null);
        assert.equal(await client.stuff.count({ where: { title } }), 0);
      }
    });

    await t.test("deleted clarification binding cannot retarget an answer but permits an independent request", async () => {
      const old = await client.stuff.create({ data: stuffData("Expired clarification jar") });
      const other = await client.stuff.create({ data: stuffData("Independent clarification jar") });
      const selected = { entity: "stuff", id: old.id };
      modelPlan = { message: "Який залишок?", assumptions: [], command: { kind: "clarify", continuesPrevious: false } };
      const first = await actions.askInventoryAssistant({ prompt: "Встанови залишок обраного матеріалу", selected, previousSearch: null, clarification: null });
      await client.stuff.delete({ where: { id: old.id } });
      modelPlan = { message: "Перегляд", assumptions: [], clarificationMode: "continue", command: { kind: "mutation", intent: { kind: "updateStuff", targetName: null, patch: stuffPatch({ stock: { mode: "set", value: 30 } }) } } };
      for (const currentSelection of [selected, null, { entity: "stuff", id: other.id }]) {
        const blocked = await actions.askInventoryAssistant({ prompt: "30", selected: currentSelection, previousSearch: null, clarification: first.data.clarification });
        assert.equal(blocked.data.operation, "requestBlocked");
        assert.equal((await client.stuff.findUnique({ where: { id: other.id } })).inStock, 10);
      }
      modelPlan = { ...modelPlan, clarificationMode: "independent" };
      const independent = await actions.askInventoryAssistant({ prompt: "Інший запит: встанови залишок обраної банки 30", selected: { entity: "stuff", id: other.id }, previousSearch: null, clarification: first.data.clarification });
      assert.equal(independent.data.preview.target.id, other.id);
      assert.equal(independent.data.preview.after.inStock, 30);
      assert.equal((await client.stuff.findUnique({ where: { id: other.id } })).inStock, 10);
    });

    await t.test("expiry of incidental selection preserves draft identity; a deleted task target cannot be replaced by its reused title", async () => {
      const incidental = await client.ingredient.create({ data: ingredientData("Incidental selection for revision") });
      const target = await client.stuff.create({ data: stuffData("Stable expiry task jar") });
      const selected = { entity: "ingredient", id: incidental.id };
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "mutation", intent: { kind: "updateStuff", targetName: target.title, patch: stuffPatch({ description: "Мій опис", stock: { mode: "adjust", value: -3 } }) } } };
      const first = await actions.askInventoryAssistant({ prompt: "Спиши 3 з банки", selected, previousSearch: null, clarification: null });
      await client.ingredient.delete({ where: { id: incidental.id } });
      modelPlan = { message: "Уточнюю", assumptions: [], command: { kind: "revise", revision: { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: stuffPatch({ stock: { mode: null, value: 5 } }) } }] } } };
      const request = { prompt: "Краще 5", selected, previousSearch: null, clarification: null, activeWrite: { phase: "draft", pending: first.data.resolved } };
      const revised = await actions.askInventoryAssistant(request);
      assert.deepEqual(revised.data.selectionExpired.selection, selected);
      assert.equal(revised.data.preview.target.id, target.id);
      assert.equal(revised.data.preview.after.inStock, 5);
      assert.equal(revised.data.preview.after.description, "Мій опис");
      assert.equal((await client.stuff.findUnique({ where: { id: target.id } })).inStock, 10);
      await client.stuff.delete({ where: { id: target.id } });
      const replacement = await client.stuff.create({ data: stuffData(target.title, { inStock: 40 }) });
      const blocked = await actions.askInventoryAssistant({ ...request, selected: null });
      assert.equal(blocked.data.operation, "revisionFailed");
      assert.equal(blocked.data.code, "STALE_PREVIEW");
      assert.deepEqual(blocked.data.pending.decisions, first.data.resolved.decisions);
      assert.equal((await client.stuff.findUnique({ where: { id: replacement.id } })).inStock, 40);
    });

    await t.test("a deleted unchanged cohort member blocks revision, re-preparation and old confirmation without acquiring new matches", async (subtest) => {
      subtest.mock.method(console, "error", () => {});
      const a = await client.stuff.create({ data: stuffData("Expired cohort A", { inStock: 0 }) });
      const b = await client.stuff.create({ data: stuffData("Expired cohort B", { inStock: 5 }) });
      const search = { entity: "stuff", text: null, titleText: "Expired cohort", category: null, isInStock: null, stockMin: null, stockMax: null };
      modelPlan = { message: "Перегляд", assumptions: [], command: { kind: "batch", intent: { kind: "filter", search, change: { kind: "updateStuff", patch: stuffPatch({ stock: { mode: "set", value: 5 } }) } } } };
      const first = await actions.askInventoryAssistant({ prompt: "Встанови 5 для Expired cohort", selected: null, previousSearch: null, clarification: null });
      assert.equal(first.data.preview.items.length, 1);
      assert.deepEqual(first.data.preview.targets, [{ entity: "stuff", id: a.id }, { entity: "stuff", id: b.id }]);
      await client.stuff.delete({ where: { id: b.id } });
      const c = await client.stuff.create({ data: stuffData("Expired cohort C", { inStock: 0 }) });
      modelPlan = { message: "Уточнюю", assumptions: [], command: { kind: "revise", revision: { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: stuffPatch({ stock: { mode: null, value: 7 } }) } }] } } };
      const revised = await actions.askInventoryAssistant({ prompt: "Краще 7", selected: null, previousSearch: null, clarification: null, activeWrite: { phase: "draft", pending: first.data.resolved } });
      assert.equal(revised.data.operation, "revisionFailed");
      assert.equal(revised.data.code, "STALE_PREVIEW");
      assert.deepEqual(revised.data.pending.targets, first.data.resolved.targets);
      const rePrepared = await actions.resumeInventoryWrite({ pending: first.data.resolved, choice: null, page: null });
      assert.equal(rePrepared.ok, false);
      assert.equal(rePrepared.code, "STALE_PREVIEW");
      const oldConfirmation = await actions.confirmInventoryBatch(first.data.preview);
      assert.equal(oldConfirmation.ok, false);
      assert.equal(oldConfirmation.code, "STALE_PREVIEW");
      assert.equal((await client.stuff.findUnique({ where: { id: a.id } })).inStock, 0);
      assert.equal((await client.stuff.findUnique({ where: { id: c.id } })).inStock, 0);
    });

    const linkedRecipe = (title, ingredients) => client.recipe.create({ data: { ...recipeData(title), ingredients: { create: ingredients.map((ingredient) => ({ ingredientId: ingredient.id, amount: "1 г" })) } } });
    const askCommand = (command, extra = {}) => {
      modelPlan = { message: "Перегляд", assumptions: [], command };
      return actions.askInventoryAssistant({ prompt: "Перевір запит", selected: null, previousSearch: null, clarification: null, ...extra });
    };
    const removal = (recipe, title) => ({ kind: "updateRecipe", targetName: recipe.title, patch: recipePatch(), composition: { mode: "patch", items: [{ action: "remove", title, amount: null, category: null }] } });

    await t.test("single and one-item batch deletions identify stored blockers before any confirmable preview", async () => {
      const ingredient = await client.ingredient.create({ data: ingredientData("Preflight protected spice", { imageKey: "protected-preflight.webp" }) });
      const recipe = await linkedRecipe("Preflight protected recipe", [ingredient]);
      const intent = { kind: "deleteIngredient", targetName: ingredient.title };
      const messages = [];
      for (const command of [{ kind: "mutation", intent }, { kind: "batch", intent: { kind: "list", operations: [intent] } }]) {
        const blocked = await askCommand(command);
        assert.equal(blocked.data.operation, "writeBlocked");
        assert.equal(blocked.data.code, "CONFLICT");
        assert.equal("preview" in blocked.data, false);
        assert.ok(blocked.data.message.includes(recipe.title));
        assert.equal(blocked.data.pending.decisions[0].selection.id, ingredient.id);
        messages.push(blocked.data.message);
      }
      assert.equal(messages[0], messages[1]);
      assert.equal(await client.recipeIngredient.count({ where: { recipeId: recipe.id, ingredientId: ingredient.id } }), 1);
      assert.equal(await client.ingredient.count({ where: { id: ingredient.id } }), 1);
      assert.equal(cleaned.includes("protected-preflight.webp"), false);
    });

    await t.test("explicit removals from every referencing recipe allow deletion and preserve unrelated recipe data", async () => {
      const ingredient = await client.ingredient.create({ data: ingredientData("Preflight removed from all") });
      const retained = await client.ingredient.create({ data: ingredientData("Preflight retained spice") });
      const a = await linkedRecipe("Preflight removal recipe A", [ingredient, retained]);
      const b = await linkedRecipe("Preflight removal recipe B", [ingredient]);
      const reply = await askCommand({ kind: "batch", intent: { kind: "list", operations: [
        { kind: "deleteIngredient", targetName: ingredient.title }, removal(a, ingredient.title), removal(b, ingredient.title),
      ] } });
      assert.equal(reply.data.operation, "batch");
      assert.deepEqual(reply.data.preview.items.map((item) => item.kind), ["updateRecipe", "updateRecipe", "deleteIngredient"]);
      assert.equal(await client.ingredient.count({ where: { id: ingredient.id } }), 1, "preparation is read-only");
      assert.equal((await actions.confirmInventoryBatch(reply.data.preview)).ok, true);
      assert.equal(await client.ingredient.count({ where: { id: ingredient.id } }), 0);
      assert.equal(await client.recipe.count({ where: { id: { in: [a.id, b.id] } } }), 2);
      const after = await client.recipe.findUnique({ where: { id: a.id }, include: { ingredients: true } });
      assert.equal(after.ingredients.length, 1);
      assert.equal(after.ingredients[0].ingredientId, retained.id);
      assert.equal(after.notes, a.notes);
    });

    await t.test("one reference outside explicit cleanup blocks the whole batch without changing relationships", async () => {
      const ingredient = await client.ingredient.create({ data: ingredientData("Preflight external reference") });
      const a = await linkedRecipe("Preflight explicit delete", [ingredient]);
      const b = await linkedRecipe("Preflight explicit removal", [ingredient]);
      const c = await linkedRecipe("Preflight external blocker", [ingredient]);
      const reply = await askCommand({ kind: "batch", intent: { kind: "list", operations: [
        { kind: "deleteIngredient", targetName: ingredient.title }, { kind: "deleteRecipe", targetName: a.title }, removal(b, ingredient.title),
      ] } });
      assert.equal(reply.data.operation, "writeBlocked");
      assert.ok(reply.data.message.includes(c.title));
      assert.equal(reply.data.message.includes(a.title), false);
      assert.equal(reply.data.message.includes(b.title), false);
      assert.equal(reply.data.pending.command.intent.operations.length, 3);
      assert.equal(await client.recipeIngredient.count({ where: { ingredientId: ingredient.id } }), 3);
    });

    await t.test("proposed recipe creations, additions and retained references all block ingredient deletion", async () => {
      const ingredient = await client.ingredient.create({ data: ingredientData("Preflight proposed reference") });
      const existing = await linkedRecipe("Preflight retained reference", [ingredient]);
      const empty = await linkedRecipe("Preflight added reference", []);
      const proposals = [
        recipeIntent("Preflight proposed new recipe", [ingredient.title]),
        { kind: "updateRecipe", targetName: empty.title, patch: recipePatch(), composition: { mode: "patch", items: [{ action: "add", title: ingredient.title, amount: "2 г", category: null }] } },
        { kind: "updateRecipe", targetName: existing.title, patch: recipePatch({ description: "Залишити склад" }), composition: null },
      ];
      for (const proposal of proposals) {
        const operations = [{ kind: "deleteIngredient", targetName: ingredient.title }, proposal];
        if (proposal.kind === "createRecipe" || proposal.targetName === empty.title) operations.push(removal(existing, ingredient.title));
        const blocked = await askCommand({ kind: "batch", intent: { kind: "list", operations } });
        assert.equal(blocked.data.operation, "writeBlocked");
        const title = proposal.kind === "createRecipe" ? proposal.data.title : proposal.targetName;
        assert.ok(blocked.data.message.includes(title));
        assert.match(blocked.data.message, /рецептах \(1\)/);
      }
      assert.equal(await client.recipe.count({ where: { title: "Preflight proposed new recipe" } }), 0);
      assert.equal(await client.recipeIngredient.count({ where: { ingredientId: ingredient.id } }), 1);
      assert.equal((await client.recipe.findUnique({ where: { id: existing.id } })).description, "");
    });

    await t.test("candidate continuation retains the last resolved choice in a blocked task and explicit retargeting can recover", async () => {
      const free = await client.ingredient.create({ data: ingredientData("Preflight choice free") });
      const used = await client.ingredient.create({ data: ingredientData("Preflight choice used") });
      await linkedRecipe("Preflight choice blocker", [used]);
      const first = await askCommand({ kind: "batch", intent: { kind: "list", operations: [{ kind: "deleteIngredient", targetName: "Preflight choice" }] } });
      assert.equal(first.data.operation, "chooseRecord");
      const calls = apiCalls;
      const blocked = await actions.resumeInventoryWrite({ pending: first.data.pending, choice: { key: first.data.question.key, selection: { entity: "ingredient", id: used.id } }, page: null });
      assert.equal(blocked.data.operation, "writeBlocked");
      assert.equal(blocked.data.continuesTask, true);
      assert.equal(blocked.data.pending.decisions[0].selection.id, used.id);
      const again = await actions.resumeInventoryWrite({ pending: blocked.data.pending, choice: null, page: null });
      assert.equal(again.data.operation, "writeBlocked");
      assert.deepEqual(again.data.pending.decisions, blocked.data.pending.decisions);
      assert.equal(apiCalls, calls);
      const recovered = await askCommand({ kind: "revise", revision: { changes: [{ operationIndex: 0, change: { kind: "target", targetName: free.title } }] } }, { activeWrite: { pending: blocked.data.pending, phase: "blocked" } });
      assert.equal(recovered.data.operation, "batch");
      assert.equal(recovered.data.preview.items[0].target.id, free.id);
      assert.equal(await client.ingredient.count({ where: { id: { in: [free.id, used.id] } } }), 2);
    });

    await t.test("a revision restoring a reference becomes blocked and keeps its corrected structured task", async () => {
      const ingredient = await client.ingredient.create({ data: ingredientData("Preflight revision dependency") });
      const recipe = await linkedRecipe("Preflight revision recipe", [ingredient]);
      const first = await askCommand({ kind: "batch", intent: { kind: "list", operations: [
        { kind: "deleteIngredient", targetName: ingredient.title }, removal(recipe, ingredient.title),
      ] } });
      assert.equal(first.data.operation, "batch");
      const blocked = await askCommand({ kind: "revise", revision: { changes: [{ operationIndex: 1, change: { kind: "recipe", patch: recipePatch(), composition: { mode: "replace", items: [{ action: "add", title: ingredient.title, amount: "3 г", category: null }] } } }] } }, { activeWrite: { pending: first.data.resolved, phase: "draft" } });
      assert.equal(blocked.data.operation, "writeBlocked");
      assert.equal(blocked.data.continuesTask, true);
      assert.equal("preview" in blocked.data, false);
      assert.equal(blocked.data.pending.command.intent.operations[1].composition.items[0].amount, "3 г");
      const again = await actions.resumeInventoryWrite({ pending: blocked.data.pending, choice: null, page: null });
      assert.equal(again.data.operation, "writeBlocked");
      assert.equal(await client.recipeIngredient.count({ where: { ingredientId: ingredient.id } }), 1);
    });

    await t.test("blocked filtered deletions preserve their cohort through re-preparation and exclude new matches", async () => {
      const a = await client.ingredient.create({ data: ingredientData("Preflight filter A") });
      const b = await client.ingredient.create({ data: ingredientData("Preflight filter B") });
      const recipe = await linkedRecipe("Preflight filter blocker", [b]);
      const search = { entity: "ingredient", text: null, titleText: "Preflight filter", category: null, isInStock: null, isSaved: null };
      const blocked = await askCommand({ kind: "batch", intent: { kind: "filter", search, change: { kind: "deleteIngredients" } } });
      assert.equal(blocked.data.operation, "writeBlocked");
      const targets = [{ entity: "ingredient", id: a.id }, { entity: "ingredient", id: b.id }];
      assert.deepEqual(blocked.data.pending.targets, targets);
      const later = await client.ingredient.create({ data: ingredientData("Preflight filter C") });
      await client.recipe.delete({ where: { id: recipe.id } });
      const ready = await actions.resumeInventoryWrite({ pending: blocked.data.pending, choice: null, page: null });
      assert.equal(ready.data.operation, "batch");
      assert.deepEqual(ready.data.preview.targets, targets);
      assert.equal((await actions.confirmInventoryBatch(ready.data.preview)).ok, true);
      assert.equal(await client.ingredient.count({ where: { id: { in: [a.id, b.id] } } }), 0);
      assert.equal(await client.ingredient.count({ where: { id: later.id } }), 1);
    });

    await t.test("order-protected recipe blocks initial batch preparation without creating other records", async () => {
      const blocked = await askCommand({ kind: "batch", intent: { kind: "list", operations: [
        { kind: "createStuff", data: stuffData("Preflight order unwritten jar") }, { kind: "deleteRecipe", targetName: "Ordered sauce" },
      ] } });
      assert.equal(blocked.data.operation, "writeBlocked");
      assert.match(blocked.data.message, /замовленнях \(позицій: 1\)/);
      assert.equal(await client.stuff.count({ where: { title: "Preflight order unwritten jar" } }), 0);
      assert.equal(await client.recipe.count({ where: { title: "Ordered sauce" } }), 1);
    });

    await t.test("a reference added after preview rejects explicit cleanup and deletion atomically and preserves images", async () => {
      const ingredient = await client.ingredient.create({ data: ingredientData("Preflight race dependency", { imageKey: "race-preflight.webp" }) });
      const recipe = await linkedRecipe("Preflight race original recipe", [ingredient]);
      const preview = await prepareInventoryBatch({ kind: "list", operations: [removal(recipe, ingredient.title), { kind: "deleteIngredient", targetName: ingredient.title }] }, null);
      await linkedRecipe("Preflight race late recipe", [ingredient]);
      const beforeCleanup = cleaned.length;
      const blocked = await actions.confirmInventoryBatch(preview);
      assert.equal(blocked.ok, false);
      assert.equal(blocked.code, "CONFLICT");
      assert.ok(blocked.message.includes("Preflight race late recipe"));
      assert.equal(await client.recipeIngredient.count({ where: { ingredientId: ingredient.id } }), 2);
      assert.equal((await client.recipe.findUnique({ where: { id: recipe.id } })).updatedAt.toISOString(), recipe.updatedAt.toISOString());
      assert.equal(cleaned.length, beforeCleanup);
    });

    await t.test("both confirmation actions reject forbidden references in browser-supplied previews", async () => {
      const ingredient = await client.ingredient.create({ data: ingredientData("Preflight tamper dependency") });
      const recipe = await linkedRecipe("Preflight tamper recipe", [ingredient]);
      const preview = await prepareInventoryBatch({ kind: "list", operations: [removal(recipe, ingredient.title), { kind: "deleteIngredient", targetName: ingredient.title }] }, null);
      const tampered = structuredClone(preview);
      const update = tampered.items.find((item) => item.kind === "updateRecipe");
      update.after.ingredients = update.before.ingredients;
      const batch = await actions.confirmInventoryBatch(tampered);
      assert.equal(batch.ok, false);
      assert.equal(batch.code, "CONFLICT");
      const single = await actions.confirmInventoryMutation(preview.items.find((item) => item.kind === "deleteIngredient"));
      assert.equal(single.ok, false);
      assert.equal(single.code, "CONFLICT");
      assert.equal(await client.recipeIngredient.count({ where: { ingredientId: ingredient.id } }), 1);
    });

    await t.test("dependency preflight compares resolved IDs rather than case-folded titles", async () => {
      const free = await client.ingredient.create({ data: ingredientData("Preflight ID pepper") });
      const used = await client.ingredient.create({ data: ingredientData("Preflight ID PEPPER") });
      await linkedRecipe("Preflight ID reference recipe", [used]);
      const reply = await askCommand({ kind: "batch", intent: { kind: "list", operations: [
        { kind: "deleteIngredient", targetName: free.title }, recipeIntent("Preflight ID new recipe", [used.title]),
      ] } });
      assert.equal(reply.data.operation, "batch");
      assert.equal(reply.data.preview.items.find((item) => item.kind === "createRecipe").after.ingredients[0].id, used.id);
      assert.equal((await actions.confirmInventoryBatch(reply.data.preview)).ok, true);
      assert.equal(await client.ingredient.count({ where: { id: free.id } }), 0);
      assert.equal(await client.recipeIngredient.count({ where: { ingredientId: used.id } }), 2);
    });

    await t.test("unauthorized batch confirmation performs no writes", async (subtest) => {
      subtest.mock.method(console, "error", () => {});
      admin = false;
      const resume = await actions.resumeInventoryWrite({ pending: { command: { kind: "mutation", intent: { kind: "createStuff", data: stuffData("Forbidden resumed jar") } }, selected: null, assumptions: [], decisions: [] }, choice: null, page: null });
      assert.equal(resume.ok, false);
      assert.equal(await client.stuff.count({ where: { title: "Forbidden resumed jar" } }), 0);
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
