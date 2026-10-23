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
const { revisePendingWrite } = require("../lib/ai/write-revision.ts");

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
  assert.equal(request.activeWrite, null);
});

test("text corrections receive current form edits and preserve unrelated creation values", async () => {
  await submit("Створи матеріал Банка");
  editDraft();
  harness.actions.askInventoryAssistant = async (request) => {
    assert.deepEqual(request.activeWrite.pending.command.intent.data, edited);
    const revised = revisePendingWrite(request.activeWrite.pending, { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: { title: null, description: null, category: null, stock: { mode: null, value: 7 } } } }] });
    return ok({ ...creation(revised.command.intent.data, revised), continuesTask: true });
  };
  await submit("Краще 7");
  assert.deepEqual(view("InventoryMutationView").preview.after, { ...edited, inStock: 7 });
  assert.equal(view("InventoryMutationView").status, "ready");
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
  await view("InventoryMutationView").onConfirm();
  assert.deepEqual(harness.calls.confirmInventoryBatch[0][0].items[0].after, { ...edited, inStock: 7 });
});

test("short stock revisions preserve adjustment intent, resolved targets and the original task source", async () => {
  harness.actions.askInventoryAssistant = async () => ok({ operation: "mutation", message: "Перевірте", preview: stockPreview(), assumptions: [], resolved: stockPending });
  await submit("Додай 5 до залишку банки");
  harness.actions.askInventoryAssistant = async (request) => {
    const revised = revisePendingWrite(request.activeWrite.pending, { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: { title: null, description: null, category: null, stock: { mode: null, value: 7 } } } }] });
    assert.deepEqual(revised.decisions, stockPending.decisions);
    assert.equal(revised.command.intent.patch.stock.mode, "adjust");
    return ok({ operation: "mutation", message: "Перевірте", preview: { ...stockPreview(), after: { ...data, inStock: 17 } }, assumptions: [], resolved: revised, continuesTask: true });
  };
  await submit("Краще 7");
  assert.equal(view("InventoryMutationView").preview.after.inStock, 17);
  harness.actions.confirmInventoryBatch = async () => fail("CONFLICT");
  await view("InventoryMutationView").onConfirm();
  view("AssistantErrorPanel").onEdit();
  assert.equal(input().value, "Додай 5 до залишку банки", "a short correction does not replace the task's full source");
  assert.equal(view("InventoryMutationView").preview.after.inStock, 17);
});

test("revision questions retain the task and disable its old confirmation until answered or cancelled", async () => {
  await submit("Створи матеріал Банка");
  editDraft();
  const clarification = { originalPrompt: "Зміни опис", turns: [], question: "Який опис? Наприклад: скляна банка.", selected: null, previousSearch: null };
  harness.actions.askInventoryAssistant = async () => ok({ operation: "clarifyRevision", message: clarification.question, clarification });
  await submit("Зміни опис");
  assert.equal(view("InventoryMutationView").status, "invalid");
  assert.equal(view("InventoryMutationView").onPrepare, undefined);
  assert.deepEqual(view("InventoryMutationView").preview.after, edited);
  await view("InventoryMutationView").onConfirm();
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
  harness.actions.askInventoryAssistant = async (request) => {
    assert.equal(request.activeWrite.phase, "clarification");
    assert.deepEqual(request.clarification, clarification);
    const values = { ...request.activeWrite.pending.command.intent.data, description: request.prompt };
    return ok({ ...creation(values), continuesTask: true });
  };
  await submit("Новий опис");
  assert.deepEqual(view("InventoryMutationView").preview.after, { ...edited, description: "Новий опис" });
  assert.equal(view("InventoryMutationView").status, "ready");
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
  harness.actions.askInventoryAssistant = async () => ok({ operation: "clarifyRevision", message: clarification.question, clarification });
  await submit("Зміни опис");
  const cancel = tree().find((node) => node.type?.marker === "Button" && node.props.children === "Скасувати уточнення");
  cancel.props.onClick();
  assert.equal(view("InventoryMutationView").status, "ready");
  assert.equal(view("InventoryMutationView").preview.after.description, "Новий опис");
});

test("button reminders retain candidate choices and a later explicit independent request replaces the task", async () => {
  const question = { key: "0:target", name: "Банка", context: "Операція 1", candidates: [record], page: 0, hasMore: false };
  harness.actions.askInventoryAssistant = async () => ok({ operation: "chooseRecord", message: "Оберіть", question, pending: stockPending });
  await submit("Додай 5 до залишку банки");
  harness.actions.askInventoryAssistant = async (request) => {
    assert.equal(request.activeWrite.phase, "choice");
    return ok({ operation: "keepTask", message: "Оберіть запис кнопкою." });
  };
  await submit("Банка 250 мл");
  assert.deepEqual(view("RecordChoiceView").question, question);
  assert.equal(view("RecordChoiceView").prompt, "Додай 5 до залишку банки");
  assert.equal(harness.calls.resumeInventoryWrite.length, 0);
  harness.actions.resumeInventoryWrite = async () => ok({ operation: "mutation", message: "Перевірте", preview: stockPreview(), assumptions: [], resolved: stockPending });
  view("RecordChoiceView").onChoose({ entity: "stuff", id: 2 });
  await finishPreparation();
  assert.equal(harness.calls.askInventoryAssistant.length, 2, "the button does not call the planner again");
  harness.actions.askInventoryAssistant = async () => ok({ operation: "keepTask", message: "Натисніть кнопку підтвердження." });
  await submit("Так, збережи");
  assert.ok(view("InventoryMutationView"));
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
  harness.actions.askInventoryAssistant = async () => ok(searchReply);
  await submit("Інший запит: покажи всі матеріали");
  assert.equal(view("InventoryMutationView"), undefined);
  assert.ok(view("Results"));
  await submit("Покажи всі матеріали");
  assert.equal(harness.calls.askInventoryAssistant.at(-1)[0].activeWrite, null);
});

test("failed revision preparation retains its revised operation and blocks the old confirmation", async () => {
  await submit("Створи матеріал Банка");
  editDraft();
  harness.actions.askInventoryAssistant = async (request) => {
    const revised = revisePendingWrite(request.activeWrite.pending, { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: { title: null, description: null, category: null, stock: { mode: null, value: 7 } } } }] });
    return ok({ operation: "revisionFailed", pending: revised, code: "CONFLICT", message: "Підготуйте новий перегляд", revisionApplied: true });
  };
  await submit("Краще 7");
  assert.equal(input().value, "Краще 7");
  assert.equal(view("InventoryMutationView").status, "invalid");
  assert.deepEqual(view("InventoryMutationView").preview.after, { ...edited, inStock: 7 });
  await view("InventoryMutationView").onConfirm();
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
  view("InventoryMutationView").onPrepare();
  await finishPreparation();
  assert.equal(harness.calls.resumeInventoryWrite[0][0].pending.command.intent.data.inStock, 7);
  assert.equal(view("InventoryMutationView").status, "ready");
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
});

test("recipe previews, mixed batches and candidate choices retain explicit selection through saving", async () => {
  const selected = { entity: "recipe", id: 99, title: "Обраний рецепт", fields: [], ingredients: [], summary: "Спеції" };
  harness.actions.askInventoryAssistant = async () => ok({ ...searchReply, results: { ...searchReply.results, items: [selected] } });
  harness.actions.getInventoryRecord = async () => ok(selected);
  await submit("Покажи рецепти");
  await view("Results").onSelect(selected);
  const fields = { title: selected.title, description: "", notes: "", confirmationNotes: null, category: "SPICES", series: "DEFAULT", spicy: 0, isHidden: true, isConfirmed: false, isSaved: false };
  const preview = { items: [{ kind: "updateRecipe", target: { id: 99, title: selected.title, updatedAt: "2026-10-24T00:00:00.000Z" }, before: { fields, ingredients: [] }, after: { fields: { ...fields, description: "Новий опис" }, ingredients: [] } }], unchanged: [] };
  const pending = { command: { kind: "mutation", intent: { kind: "updateRecipe", targetName: null, patch: { title: null, description: "Новий опис", notes: null, confirmationNotes: null, category: null, series: null, spicy: null, isHidden: null, isConfirmed: null, isSaved: null }, composition: null } }, selected: { entity: "recipe", id: 99 }, assumptions: [], decisions: [] };
  harness.actions.askInventoryAssistant = async () => ok({ operation: "batch", message: "Перевірте", preview, assumptions: [], resolved: pending });
  await submit("Зміни опис на Новий опис");
  assert.deepEqual(view("Record").record, selected, "a single recipe's batch container must not clear selection");
  harness.actions.askInventoryAssistant = async () => ok({ operation: "chooseRecord", message: "Оберіть", question: { key: "0:target", name: "Банка", candidates: [record], page: 0, hasMore: false }, pending: stockPending });
  await submit("Інший запит: додай 5 до залишку банки");
  assert.deepEqual(view("Record").record, selected);
  harness.actions.resumeInventoryWrite = async () => ok({ operation: "batch", message: "Перевірте", preview: { items: [stockPreview(), { kind: "createStuff", after: data }], unchanged: [] }, assumptions: [], resolved: { ...stockPending, command: { kind: "batch", intent: { kind: "list", operations: [stockPending.command.intent, pendingCreation().command.intent] } } } });
  view("RecordChoiceView").onChoose({ entity: "stuff", id: 2 });
  await finishPreparation();
  assert.deepEqual(view("Record").record, selected);
  harness.actions.confirmInventoryBatch = async () => ok({ results: [{ entity: "stuff", id: 2, operation: "updated", title: "Банка" }, { entity: "stuff", id: 3, operation: "created", title: "Етикетка" }] });
  harness.actions.getInventoryRecord = async () => fail("INTERNAL_ERROR");
  await view("InventoryBatchView").onConfirm();
  assert.equal(view("AssistantErrorPanel").code, "REFRESH_FAILED");
  harness.actions.getInventoryRecord = async () => ok(selected);
  await view("AssistantErrorPanel").onRefresh();
  assert.deepEqual(view("Record").record, selected);
  assert.deepEqual(harness.calls.getInventoryRecord.at(-1)[0], { entity: "recipe", id: 99 });
  assert.equal(harness.calls.confirmInventoryBatch.length, 1, "refreshing selection must not repeat the batch");
});

test("incomplete creation fields remain visible and corrections can complete them without losing valid edits", async () => {
  await submit("Створи матеріал Банка");
  editDraft();
  editDraft({ ...edited, title: "", description: "Останній опис", inStock: NaN });
  await view("InventoryMutationView").onConfirm();
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
  const clarification = { originalPrompt: "Кількість 7", question: "Яка назва? Наприклад: Банка 250 мл.", turns: [], selected: null, previousSearch: null };
  harness.actions.askInventoryAssistant = async (request) => {
    assert.deepEqual(request.activeWrite.incompleteFields, ["title", "stock"]);
    assert.equal(request.activeWrite.pending.command.intent.data.inStock, edited.inStock);
    assert.equal(request.activeWrite.pending.command.intent.data.description, "Останній опис");
    return ok({ operation: "clarifyRevision", message: clarification.question, clarification });
  };
  await submit("Кількість 7");
  assert.equal(view("InventoryMutationView").preview.after.title, "");
  assert.ok(Number.isNaN(view("InventoryMutationView").preview.after.inStock));
  harness.actions.askInventoryAssistant = async (request) => {
    assert.deepEqual(request.clarification, clarification);
    const revised = revisePendingWrite(request.activeWrite.pending, { changes: [{ operationIndex: 0, change: { kind: "stuff", patch: { title: "Завершена назва", description: null, category: null, stock: { mode: null, value: 7 } } } }] });
    return ok({ ...creation(revised.command.intent.data, revised), continuesTask: true });
  };
  await submit("Завершена назва");
  assert.deepEqual(view("InventoryMutationView").preview.after, { ...edited, title: "Завершена назва", description: "Останній опис", inStock: 7 });
  assert.equal(harness.calls.confirmInventoryBatch.length, 0);
});

test("invalid form inputs do not block independent requests or get overwritten by rejected corrections", async () => {
  const { assistantRequestSchema } = require("../zod/ai-search.schema.ts");
  await submit("Створи матеріал Банка");
  editDraft({ ...edited, title: "", inStock: NaN });
  harness.actions.askInventoryAssistant = async (request) => ok({ operation: "revisionFailed", pending: request.activeWrite.pending, code: "VALIDATION_ERROR", revisionApplied: false, message: "Вкажіть назву" });
  await submit("Зміни категорію на Слоїчки");
  assert.equal(view("InventoryMutationView").preview.after.title, "");
  assert.ok(Number.isNaN(view("InventoryMutationView").preview.after.inStock));
  harness.actions.askInventoryAssistant = async (request) => {
    assert.equal(assistantRequestSchema.safeParse(request).success, true);
    return ok(searchReply);
  };
  await submit("Інший запит: покажи всі матеріали");
  assert.equal(view("InventoryMutationView"), undefined);
  assert.ok(view("Results"));
});
