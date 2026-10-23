/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
function load(relative, mocks = {}, cache = new Map()) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const requireLocal = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/") || name.startsWith(".")) {
      const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      const target = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      return load(path.relative(root, target), mocks, cache);
    }
    return require(name);
  };
  new Function("require", "module", "exports", code)(requireLocal, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const sessions = {
  guest: null,
  user: { user: { pid: 7, role: "USER" } },
  admin: { user: { pid: 9, role: "ADMIN" } },
};

function fixture(session) {
  const reads = [];
  const prisma = Object.fromEntries(["recipe", "ingredient", "stuff", "order", "withlistItem"].map((entity) => [entity, {
    findMany: async (args) => { reads.push({ entity, args }); return []; },
  }]));
  const mocks = { "server-only": {}, "@/lib/auth": { auth: async () => session }, "@/lib/prisma": { prisma } };
  return { mocks, reads };
}

test("bootstrap starts all permitted reads concurrently and hydrates their existing query keys", async () => {
  const { mocks } = fixture(sessions.admin);
  const server = load("lib/data/server.ts", mocks);
  const { collectionKeys } = load("lib/data/collections.ts");
  const started = [];
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  mocks["@/lib/data/server"] = {
    ...server,
    collectionLoaders: () => Object.fromEntries(Object.keys(collectionKeys).map((name) => [name, async () => {
      started.push(name);
      await gate;
      return [];
    }])),
  };
  const bootstrap = load("components/QueryPrefetcher.tsx", mocks).default;
  const pending = bootstrap({ session: sessions.admin, children: "page" });
  assert.equal(started.length, 7, "all reads start before any finishes");
  release();
  const element = await pending;
  assert.equal(element.props.children, "page");
  assert.deepEqual(element.props.state.queries.map((query) => query.queryKey), started.map((name) => collectionKeys[name]));
});

test("a failed bootstrap collection does not discard successful collections", async () => {
  const { mocks } = fixture(sessions.user);
  const server = load("lib/data/server.ts", mocks);
  mocks["@/lib/data/server"] = { ...server, collectionLoaders: () => ({
    publicRecipes: async () => [], wishlistIds: async () => { throw new Error("DB unavailable"); }, myOrders: async () => [],
  }) };
  const element = await load("components/QueryPrefetcher.tsx", mocks).default({ session: sessions.user, children: null });
  assert.deepEqual(element.props.state.queries.map((query) => query.queryKey), [["public-recipes"], ["orders", "mine"]]);
});

test("GET enforces collection permissions without reading forbidden data", async () => {
  const { NextRequest } = require("next/server");
  for (const [role, allowed] of Object.entries({
    guest: ["publicRecipes"], user: ["publicRecipes", "wishlistIds", "myOrders"],
    admin: ["publicRecipes", "wishlistIds", "myOrders", "recipes", "ingredients", "stuff", "allOrders"],
  })) {
    const { mocks, reads } = fixture(sessions[role]);
    const { GET } = load("app/api/data/route.ts", mocks);
    for (const collection of ["publicRecipes", "wishlistIds", "myOrders", "recipes", "ingredients", "stuff", "allOrders"]) {
      const before = reads.length;
      const response = await GET(new NextRequest(`http://localhost/api/data?collection=${collection}`));
      assert.equal(response.status, allowed.includes(collection) ? 200 : role === "guest" ? 401 : 403);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      if (!allowed.includes(collection)) assert.equal(reads.length, before);
    }
    for (const collection of ["unknown", "__proto__", "toString"]) {
      assert.equal((await GET(new NextRequest(`http://localhost/api/data?collection=${collection}`))).status, 400);
    }
    const personalReads = reads.filter(({ args }) => args?.where?.userId !== undefined);
    assert.ok(personalReads.every(({ args }) => args.where.userId === sessions[role]?.user.pid));
  }
});

test("GET reports collection failures without exposing database errors", async (t) => {
  t.mock.method(console, "error", () => {});
  const { mocks } = fixture(sessions.guest);
  mocks["@/lib/prisma"].prisma.recipe.findMany = async () => { throw new Error("private DB detail"); };
  const { GET } = load("app/api/data/route.ts", mocks);
  const { NextRequest } = require("next/server");
  const response = await GET(new NextRequest("http://localhost/api/data?collection=publicRecipes"));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: "Could not load data" });
});

test("client GET preserves nested Prisma dates and order presentation strings", async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url, options) => {
      assert.equal(options.cache, "no-store");
      assert.ok(url.startsWith("/api/data?collection="));
      return Response.json([{ createdAt: "2026-10-23T00:00:00.000Z", ingredients: [{ ingredient: { updatedAt: "2026-10-23T00:00:00.000Z" } }] }]);
    };
    const { readCollection } = load("lib/data/client.ts");
    const recipes = await readCollection("recipes");
    assert.ok(recipes[0].createdAt instanceof Date);
    assert.ok(recipes[0].ingredients[0].ingredient.updatedAt instanceof Date);
    assert.equal(typeof (await readCollection("myOrders"))[0].createdAt, "string");
    global.fetch = async () => Response.json({ message: "Unauthorized" }, { status: 401 });
    await assert.rejects(readCollection("ingredients"), /Unauthorized/);
  } finally {
    global.fetch = originalFetch;
  }
});
