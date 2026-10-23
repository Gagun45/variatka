/* eslint-disable @typescript-eslint/no-require-imports */
// Exercise the mounted component's handlers and rendered props without a browser
// or live services. Child preview markup is also checked in ai-inventory.test.cjs.
const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");

const root = path.resolve(__dirname, "..");
const componentFile = path.join(root, "app/(admin)/admin/ai/_components/AiAssistant.tsx");
const originalLoad = Module._load;
const originalTs = require.extensions[".ts"];
const originalTsx = require.extensions[".tsx"];
let harness;
const marker = (name) => Object.assign(() => null, { marker: name });
const hooks = {
  useState(initial) {
    const index = harness.cursor++;
    if (!(index in harness.hooks)) harness.hooks[index] = initial;
    return [harness.hooks[index], (value) => {
      harness.hooks[index] = typeof value === "function" ? value(harness.hooks[index]) : value;
    }];
  },
  useRef(initial) {
    const index = harness.cursor++;
    if (!(index in harness.hooks)) harness.hooks[index] = { current: initial };
    return harness.hooks[index];
  },
};
const actionNames = ["askInventoryAssistant", "confirmInventoryBatch", "getInventoryRecord", "resumeInventoryWrite", "searchInventoryRecords"];
const actions = Object.fromEntries(actionNames.map((name) => [name, async (...args) => {
  harness.calls[name].push(args);
  return harness.actions[name](...args);
}]));
Module._load = function (id, parent, main) {
  if (id === "react") return { ...React, ...hooks };
  if (id === "@/lib/actions/ai.actions") return actions;
  if (id === "@tanstack/react-query") return { useQueryClient: () => ({ invalidateQueries: async () => {} }) };
  if (id === "next/link") return marker("Link");
  if (id === "lucide-react") return { MessageSquarePlus: marker("Plus"), Send: marker("Send") };
  if (id === "@/components/ui/button") return { Button: marker("Button") };
  if (id === "@/components/ui/textarea") return { Textarea: marker("Textarea") };
  if (parent?.filename === componentFile && id === "./InventorySearchView") return { InventoryRecordView: marker("Record"), InventorySearchView: marker("Results") };
  if (parent?.filename === componentFile && id.startsWith("./")) return marker(id.slice(2));
  if (id.startsWith("@/")) id = path.join(root, id.slice(2));
  return originalLoad.call(this, id, parent, main);
};
const compile = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
}).outputText, file);
require.extensions[".ts"] = compile;
require.extensions[".tsx"] = compile;
const Assistant = require(componentFile).default;

const data = { title: "Банка", description: "Скляна", category: "JARS", inStock: 10 };
const edited = { title: "Банка 250 мл", description: "Мій опис", category: "DECOR", inStock: 17 };
const ok = (reply) => ({ ok: true, data: reply });
const fail = (code = "PROVIDER_UNAVAILABLE") => ({ ok: false, code, message: `Failure: ${code}` });
const pendingCreation = (values = data) => ({ command: { kind: "mutation", intent: { kind: "createStuff", data: values } }, selected: null, assumptions: ["Порожній залишок не запитували."], decisions: [] });
const creation = (values = data, pending = pendingCreation(values)) => ({ operation: "mutation", message: "Перевірте", preview: { kind: "createStuff", after: values }, assumptions: pending.assumptions, resolved: pending });
const record = { entity: "stuff", id: 2, title: edited.title, fields: [], ingredients: [], summary: "Слоїчки" };
const search = { entity: "stuff", text: null, category: null, isInStock: null, stockMin: null, stockMax: null };
const searchReply = { operation: "search", message: "Результати", results: { search, items: [], page: 0, hasMore: false } };
const stockPending = {
  command: { kind: "mutation", intent: { kind: "updateStuff", targetName: "Банка", patch: { title: null, description: null, category: null, stock: { mode: "adjust", value: 5 } } } },
  selected: null, assumptions: [], decisions: [{ key: "0:target", selection: { entity: "stuff", id: 2 }, title: "Банка" }],
};
const stockPreview = (amount = 10) => ({ kind: "updateStuff", target: { id: 2, title: "Банка", updatedAt: `2026-10-24T10:00:${amount}.000Z` }, before: { ...data, inStock: amount }, after: { ...data, inStock: amount + 5 } });

beforeEach(() => {
  harness = {
    cursor: 0, hooks: [], calls: Object.fromEntries(actionNames.map((name) => [name, []])),
    actions: {
      askInventoryAssistant: async () => ok(creation()),
      confirmInventoryBatch: async () => ok({ results: [{ entity: "stuff", id: 2, title: edited.title, operation: "created" }] }),
      getInventoryRecord: async () => ok(record),
      resumeInventoryWrite: async ({ pending }) => ok(creation(pending.command.intent.data, pending)),
      searchInventoryRecords: async () => ok(searchReply.results),
    },
  };
});
after(() => {
  Module._load = originalLoad;
  if (originalTs) require.extensions[".ts"] = originalTs; else delete require.extensions[".ts"];
  if (originalTsx) require.extensions[".tsx"] = originalTsx; else delete require.extensions[".tsx"];
});

function flatten(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(flatten);
  return [node, ...flatten(node.props?.children)];
}
function tree() { harness.cursor = 0; return flatten(Assistant()); }
function view(name) { return tree().find((node) => node.type?.marker === name)?.props; }
function input() { return view("Textarea"); }
async function submit(prompt) {
  input().onChange({ target: { value: prompt } });
  return tree().find((node) => node.type === "form").props.onSubmit({ preventDefault() {} });
}
function editDraft(values = edited) {
  const draft = view("InventoryMutationView");
  draft.onChange({ ...draft.preview, after: values });
}
async function finishPreparation() {
  // onPrepare intentionally starts an async event without returning its promise.
  await new Promise((resolve) => setImmediate(resolve));
}

test("planning failures retain edited fields, assumptions and typed request until replacement succeeds", async (t) => {
  for (const thrown of [false, true]) await t.test(thrown ? "lost connection" : "structured failure", async () => {
    await submit("Створи матеріал Банка");
    editDraft();
    let rejectRequest;
    harness.actions.askInventoryAssistant = () => new Promise((resolve, reject) => { rejectRequest = () => thrown ? reject(new Error("offline")) : resolve(fail()); });
    const pending = submit("Покажи всі матеріали");
    assert.equal(view("InventoryMutationView").busy, true);
    assert.deepEqual(view("InventoryMutationView").preview.after, edited);
    rejectRequest();
    await pending;
    assert.equal(input().value, "Покажи всі матеріали");
    assert.deepEqual(view("InventoryMutationView").preview.after, edited);
    assert.deepEqual(view("InventoryMutationView").assumptions, pendingCreation().assumptions);
    view("AssistantErrorPanel").onEdit();
    assert.deepEqual(view("InventoryMutationView").preview.after, edited);
    harness.actions.askInventoryAssistant = async () => ok(searchReply);
    await submit("Покажи всі матеріали");
    assert.equal(view("InventoryMutationView"), undefined);
    assert.deepEqual(view("Results").results, searchReply.results);
    assert.equal(harness.calls.confirmInventoryBatch.length, 0);
  });
});

test("failed replacement preserves record choices, original prompt and the structured continuation", async () => {
  const question = { key: "0:target", name: "Банка", context: "Операція 1", candidates: [record], page: 0, hasMore: false };
  harness.actions.askInventoryAssistant = async () => ok({ operation: "chooseRecord", message: "Оберіть", question, pending: stockPending });
  await submit("Додай 5 до залишку банки");
  harness.actions.askInventoryAssistant = async () => fail();
  await submit("Покажи рецепти");
  assert.equal(view("RecordChoiceView").prompt, "Додай 5 до залишку банки");
  assert.deepEqual(view("RecordChoiceView").question, question);
  harness.actions.resumeInventoryWrite = async () => ok({ operation: "mutation", message: "Перевірте", preview: stockPreview(), assumptions: [], resolved: stockPending });
  view("RecordChoiceView").onChoose({ entity: "stuff", id: 2 });
  await finishPreparation();
  assert.deepEqual(harness.calls.resumeInventoryWrite[0][0].pending, stockPending);
  assert.equal(view("InventoryMutationView").preview.after.inStock, 15);
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
});

test("definite confirmation failure retains edits and requires fresh preparation before another confirmation", async () => {
  await submit("Створи матеріал Банка");
  editDraft();
  harness.actions.confirmInventoryBatch = async () => fail("CONFLICT");
  await view("InventoryMutationView").onConfirm();
  assert.equal(view("InventoryMutationView").status, "invalid");
  assert.deepEqual(view("InventoryMutationView").preview.after, edited);
  view("AssistantErrorPanel").onEdit();
  assert.equal(input().value, "Створи матеріал Банка");
  assert.deepEqual(view("InventoryMutationView").preview.after, edited);
  editDraft({ ...edited, title: "Виправлена банка", inStock: 23 });
  await view("InventoryMutationView").onConfirm();
  assert.equal(harness.calls.confirmInventoryBatch.length, 1, "the failed preview cannot be confirmed again");
  view("InventoryMutationView").onPrepare();
  await finishPreparation();
  const expected = { ...edited, title: "Виправлена банка", inStock: 23 };
  assert.deepEqual(harness.calls.resumeInventoryWrite[0][0].pending.command.intent.data, expected);
  assert.equal(view("InventoryMutationView").status, "ready");
  assert.deepEqual(view("InventoryMutationView").preview.after, expected);
  assert.equal(harness.calls.confirmInventoryBatch.length, 1, "preparation never saves");
  harness.actions.confirmInventoryBatch = async () => ok({ results: [{ entity: "stuff", id: 2, title: expected.title, operation: "created" }] });
  await view("InventoryMutationView").onConfirm();
  assert.deepEqual(harness.calls.confirmInventoryBatch[1][0].items[0].after, expected);
  assert.equal(view("InventoryMutationView"), undefined);
});

test("renamed ingredient recovery drops old duplicate decisions and preserves other edited creation fields", async () => {
  const values = { title: "Куркумма", description: "", category: "SPICES", isInStock: false, isSaved: false };
  const pending = { command: { kind: "mutation", intent: { kind: "createIngredient", data: values } }, selected: null, assumptions: [], decisions: [{ key: "0:createIngredient", title: values.title, createNew: true, candidates: [{ id: 1, title: "Куркума" }] }] };
  harness.actions.askInventoryAssistant = async () => ok({ operation: "mutation", message: "Перевірте", preview: { kind: "createIngredient", after: values }, assumptions: [], resolved: pending });
  await submit("Створи інгредієнт Куркумма");
  const changed = { ...values, title: "Перець", description: "Мелений", category: "OTHER", isInStock: true, isSaved: true };
  editDraft(changed);
  harness.actions.confirmInventoryBatch = async () => fail("CONFLICT");
  await view("InventoryMutationView").onConfirm();
  harness.actions.resumeInventoryWrite = async ({ pending }) => ok({ operation: "chooseRecord", message: "Оберіть", pending, question: { key: "0:createIngredient", name: changed.title, candidates: [], page: 0, hasMore: false } });
  view("InventoryMutationView").onPrepare();
  await finishPreparation();
  const sent = harness.calls.resumeInventoryWrite[0][0].pending;
  assert.deepEqual(sent.command.intent.data, changed);
  assert.deepEqual(sent.decisions, [], "the old title's distinct-ingredient choice is not reused");
  assert.ok(view("RecordChoiceView"));
  assert.equal(harness.calls.confirmInventoryBatch.length, 1);
});

test("stale recovery retains the old snapshot and rebuilds using the original signed adjustment and resolved target", async () => {
  harness.actions.askInventoryAssistant = async () => ok({ operation: "mutation", message: "Перевірте", preview: stockPreview(), assumptions: [], resolved: stockPending });
  await submit("Додай 5 до залишку банки");
  harness.actions.confirmInventoryBatch = async () => fail("STALE_PREVIEW");
  await view("InventoryMutationView").onConfirm();
  assert.equal(view("InventoryMutationView").status, "stale");
  assert.equal(view("InventoryMutationView").preview.after.inStock, 15);
  await view("InventoryMutationView").onConfirm();
  assert.equal(harness.calls.confirmInventoryBatch.length, 1);
  harness.actions.resumeInventoryWrite = async () => ok({ operation: "mutation", message: "Новий перегляд", preview: stockPreview(20), assumptions: [], resolved: stockPending });
  view("InventoryMutationView").onPrepare();
  await finishPreparation();
  assert.deepEqual(harness.calls.resumeInventoryWrite[0][0].pending, stockPending);
  assert.equal(view("InventoryMutationView").preview.after.inStock, 25);
  assert.equal(view("InventoryMutationView").status, "ready");
  assert.equal(harness.calls.confirmInventoryBatch.length, 1);
});

test("uncertain outcomes retain a reference without confirmation or preparation, including after failed replacement", async (t) => {
  for (const thrown of [false, true]) await t.test(thrown ? "lost response" : "internal failure", async () => {
    harness.actions.askInventoryAssistant = async () => ok(creation());
    await submit("Створи матеріал Банка");
    editDraft();
    harness.actions.confirmInventoryBatch = async () => { if (thrown) throw new Error("lost response"); return fail("INTERNAL_ERROR"); };
    await view("InventoryMutationView").onConfirm();
    assert.equal(view("InventoryMutationView").status, "uncertain");
    assert.deepEqual(view("InventoryMutationView").preview.after, edited);
    assert.equal(view("InventoryMutationView").onPrepare, undefined);
    assert.equal(view("AssistantErrorPanel").code, "SAVE_UNCERTAIN");
    const count = harness.calls.confirmInventoryBatch.length;
    await view("InventoryMutationView").onConfirm();
    view("AssistantErrorPanel").onPrepare();
    assert.equal(harness.calls.confirmInventoryBatch.length, count);
    assert.equal(harness.calls.resumeInventoryWrite.length, 0);
    harness.actions.askInventoryAssistant = async () => fail();
    await submit("Покажи всі матеріали");
    assert.equal(view("InventoryMutationView").status, "uncertain");
    assert.deepEqual(view("InventoryMutationView").preview.after, edited);
    assert.equal(view("InventoryMutationView").onPrepare, undefined);
  });
});

test("batch recovery preserves every preview item, assumptions, unchanged records and resolved choices", async () => {
  const preview = { items: [stockPreview(), { kind: "createStuff", after: { ...data, title: "Етикетка" } }], unchanged: ["Кришка"] };
  const pending = { command: { kind: "batch", intent: { kind: "list", operations: [stockPending.command.intent, pendingCreation().command.intent] } }, selected: null, decisions: stockPending.decisions, assumptions: ["Початковий залишок етикетки: 10"] };
  harness.actions.askInventoryAssistant = async () => ok({ operation: "batch", message: "Перевірте", preview, assumptions: pending.assumptions, resolved: pending });
  await submit("Додай 5 до залишку банки та створи етикетку");
  harness.actions.confirmInventoryBatch = async () => fail("VALIDATION_ERROR");
  await view("InventoryBatchView").onConfirm();
  assert.equal(view("InventoryBatchView").status, "invalid");
  assert.deepEqual(view("InventoryBatchView").preview, preview);
  assert.deepEqual(view("InventoryBatchView").assumptions, pending.assumptions);
  await view("InventoryBatchView").onConfirm();
  assert.equal(harness.calls.confirmInventoryBatch.length, 1);
  harness.actions.resumeInventoryWrite = async () => fail("CONFLICT");
  view("InventoryBatchView").onPrepare();
  await finishPreparation();
  assert.deepEqual(harness.calls.resumeInventoryWrite[0][0].pending, pending);
  assert.deepEqual(view("InventoryBatchView").preview, preview);
  assert.equal(view("InventoryBatchView").status, "invalid");
});

test("post-save refresh failure cannot revive a completed draft or repeat its write", async () => {
  await submit("Створи матеріал Банка");
  harness.actions.getInventoryRecord = async () => fail("INTERNAL_ERROR");
  await view("InventoryMutationView").onConfirm();
  assert.equal(view("InventoryMutationView"), undefined);
  assert.equal(view("AssistantErrorPanel").code, "REFRESH_FAILED");
  harness.actions.getInventoryRecord = async () => ok(record);
  await view("AssistantErrorPanel").onRefresh();
  assert.equal(view("AssistantErrorPanel"), undefined);
  assert.equal(harness.calls.confirmInventoryBatch.length, 1);
  assert.equal(harness.calls.getInventoryRecord.length, 2);
});

test("cancel and new chat remove retained drafts and their recovery state", async () => {
  await submit("Створи матеріал Банка");
  harness.actions.confirmInventoryBatch = async () => fail("CONFLICT");
  await view("InventoryMutationView").onConfirm();
  view("InventoryMutationView").onCancel();
  assert.equal(view("InventoryMutationView"), undefined);
  await submit("Створи матеріал Банка");
  assert.equal(view("InventoryMutationView").status, "ready");
  await view("InventoryMutationView").onConfirm();
  const reset = tree().find((node) => node.type?.marker === "Button" && node.props.children.includes("Новий чат"));
  reset.props.onClick();
  assert.equal(view("InventoryMutationView"), undefined);
  assert.equal(view("AssistantErrorPanel"), undefined);
  assert.equal(input().value, "");
  await submit("Створи матеріал Банка");
  assert.equal(view("InventoryMutationView").status, "ready");
  const request = harness.calls.askInventoryAssistant.at(-1)[0];
  assert.equal(request.selected, null);
  assert.equal(request.clarification, null);
  assert.equal(request.previousSearch, null);
});
