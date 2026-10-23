# Inventory assistant review

Reviewed 24 October 2026. Scope: planner instructions, vocabulary, schemas, request context, name resolution, previews, confirmation, recovery, and existing tests. Findings below record the reviewed behavior; implementation progress is tracked under the implementation order.

The confirmation boundary is sound in the paths checked: preparation does not write, approximate write matches require a choice, confirmations validate versions, and batches use a transaction. The largest usability problem is that the conversation looks continuous while the planner receives only a selection, the last search, and pending clarification. Pending previews and record choices have a different continuation mechanism that the text input does not use.

## Findings

### 1. P1 — A normal follow-up discards the pending operation without carrying it forward

Evidence: `lib/ai/inventory-assistant.ts:75–80`, `zod/ai-search.schema.ts:25–30`, and `app/(admin)/admin/ai/_components/AiAssistant.tsx:114–133, 165–168`.

Example: prepare “Встанови залишок обраного матеріалу на 20”, then send “Краще 30”. The second planner request contains neither the original operation nor its preview. If the first request required a candidate choice, selection was also cleared. Typing a candidate name instead of clicking a button starts a new request and loses the pending operation. Ordinary chat messages are never sent back to the planner.

This is a confirmed context gap; the exact response to a natural-language correction depends on the model and was not tested against a live provider. It can ask another question, lose the operation, or interpret the value without knowing whether the original operation was a stock set or adjustment.

**Proposed fix:** keep a typed active task containing the structured operation, clarification answers, resolution decisions, and draft edits. Classify incoming text as an answer, draft revision, or new task before replacing it. Apply a revision to that task and rebuild the preview. Candidate buttons must continue to work without another planner call. Until text continuation exists, show “Для зміни пропозиції повторіть повний запит або відредагуйте доступні поля” beside the draft; show “Оберіть запис кнопкою” beside candidate choices.

### 2. P1 — Failed planning and failed confirmation lose edited draft values

Evidence: `AiAssistant.tsx:119–126, 131–136, 259–283`; `InventoryMutationView.tsx:18–20, 27–35`; `AiAssistant.tsx:99–109`.

Reproduction: prepare a material creation, edit its title, description and quantity, then send another request while the provider is unavailable. The old draft is cleared before planning and is not restored when planning fails. The error says the request was retained, but the edited proposal is gone. A failed confirmation also removes the form; “Редагувати запит” restores the original prompt rather than the edited fields.

**Proposed fix:** retain draft values and context until a replacement is ready. On a definite validation/conflict failure, preserve an editable draft and require a newly validated preview before confirmation. On stale or uncertain outcomes, retain the draft as reference while disabling the old confirmation. Keep the existing inspection flow for unknown save outcomes; do not restore a blind retry button.

### 3. P2 — A deleted selection prevents unrelated requests

Evidence: `lib/actions/ai.actions.ts:51–53`, `lib/domain/ai-inventory.service.ts:105–109, 120–122, 135`.

Reproduction: select an ingredient, delete it in another tab, then ask “Покажи всі матеріали”. The action tries to load the selected ingredient before planning and fails. The independent search never reaches the planner. The same precondition affects named operations that should override the selection.

**Proposed fix:** represent a missing selection explicitly, drop it for independent requests, and only require it when the resulting command depends on that selection. Never substitute another record for a selection-dependent write. Return a structured “selection expired” notice with a clear-selection action.

### 4. P2 — Batch preparation can offer a deletion already known to be blocked

Evidence: `lib/domain/ai-batch.service.ts:63–68` passes `allowReferencedDelete=true` to every operation; `lib/domain/ai-mutations.service.ts:49–51` bypasses the reference check; `lib/domain/inventory-write.service.ts:49–55` rejects the eventual write.

Reproduction: deleting an ingredient used by a recipe fails immediately as a single mutation. Wrap the same deletion in a batch, even a one-item list, and preparation returns a confirmable preview. Confirmation then fails with `CONFLICT` despite no intervening database change.

The final delete guard prevents the write; this is a misleading preview, not evidence of a destructive bypass.

**Proposed fix:** validate references against the final proposed batch before presenting confirmation. Permit a referenced deletion only when explicitly requested operations in that batch remove every blocking reference. Show remaining blockers before confirmation, and recheck them transactionally when saving.

### 5. P2 — Recipe previews clear selection differently from other single-record previews

Evidence: `lib/domain/ai-write-workflow.service.ts:21` routes every recipe preview through the batch reply; `AiAssistant.tsx:156–164` clears selection for batches but preserves it for an ingredient/material mutation targeting the selected record. `InventorySearchView.tsx:58` says selection lasts until a new search, cancellation or reload.

Example: select a recipe and request a description update. Merely preparing the preview clears the selection. The corresponding selected-material update retains it. A follow-up using “цей рецепт” therefore has different context depending on entity, even before saving.

**Proposed fix:** make selection independent of the preview container. Retain the original selection while preparing its update. After a successful write, reload it if it still exists; for multi-target tasks show the affected records without arbitrarily selecting one.

### 6. P2 — The title and lookup rules contain conflicting instructions

Evidence: `lib/ai/inventory-assistant.ts:20, 43–44, 60`.

Creation says both “Preserve explicitly supplied names” and “title in Ukrainian”. A supplied title such as `Chili Mix` therefore has two possible treatments. Generic search says both “Preserve the supplied lookup words” and “Use Ukrainian nominative words or unambiguous stems”, without stating which applies to quoted text.

This is an instruction conflict, not a measured live-model failure.

**Proposed fix:** require Ukrainian interface messages while preserving user-supplied titles in their original language. Preserve quoted and field-specific text literally. Allow grammatical normalization only for unquoted generic search wording, never a guessed replacement title. Keep tolerant matching on the server.

### 7. P3 — Setup guidance and search copy describe older behavior

Evidence: `docs/ai-assistant.md:61–63, 75` says duplicate errors keep the preview editable, multiple ingredients require one-at-a-time requests, and the UI uses `confirmInventoryMutation`. Current behavior differs: duplicate review exists, batches are supported, and the mounted assistant confirms through `confirmInventoryBatch`. `InventorySearchView.tsx:28` describes only title/description search although recipes also search notes and confirmation notes.

**Proposed fix:** maintain one capability table and link detailed examples from it. Align onboarding and search hints with the actual schemas and current save flow.

## Proposed rules

[Proposed replacement planner instructions](ai-assistant-rules-v2.md) reorganize the current contract around a fixed decision order. They preserve the existing command schema and supported operations, remove the title-language conflict, define search refinement as a filter edit, and make clarification questions more useful.

These instructions alone cannot fix findings 1–5. Draft continuation, state retention, selection expiry, and batch dependency validation require application changes. Do not claim those behaviors in the planner prompt until they exist.

## Recommended interaction contract

| Situation | Predictable behavior |
| --- | --- |
| Complete supported request | Prepare the result immediately; do not ask whether a supplied name exists. |
| Missing required information | Ask one concise question covering related missing fields; offer relevant labels or an example. Preserve partial answers. |
| Several actual name matches | Show real clickable records and retain the entire task. |
| Pending draft + correction | Revise that draft, retain other fields, and require confirmation of the new version. Requires the active-task implementation. |
| Pending draft + independent request | Replace it only after a new result is ready. On failure, retain both the draft and typed request. |
| Search refinement | Retain every previous filter except those explicitly changed or removed. Show the resulting filters. |
| Selection expired | Clear or reselect explicitly; independent searches remain usable. |
| No matching records | State that no records matched. Offer removing a specific filter; do not silently broaden. |
| No changes needed | Show a neutral result and no confirmation button. |
| Known validation conflict | Keep recoverable input and explain what must change. |
| Save outcome unknown | Disable the attempted confirmation, show affected-record links, and inspect the outcome. |

Show the active target and task status near the input: “Уточнюємо запит”, “Оберіть запис”, or “Пропозиція очікує підтвердження”. The current collapsed context panel is useful, but it should not be the only place explaining what a short answer will affect. Category, availability and intent clarifications can eventually use typed quick replies; that needs a schema/UI extension rather than instructions to invent buttons.

## Implementation order

1. Preserve draft state through failed planning and definite confirmation failures; keep unsafe confirmation attempts disabled.
2. Add a typed active-task state and draft-revision path. Preserve explicit field edits, resolved targets and stock set/adjust intent. Keep selection stable across preview types.
3. Make selected-record expiry recoverable and validate batch deletion blockers before preview.
4. Adopt the replacement instructions and align capability/help text.
5. Add interpretation evaluations alongside the existing deterministic tests. For longer-term save recovery, use a durable operation ID so an uncertain response can be inspected without applying a stock adjustment twice.

### Step 1 implementation

Implemented draft retention through failed planning and confirmation. Edited creation fields can be revalidated without regenerating their original defaults. Known failed confirmations require a fresh preview; stale drafts remain read-only references; uncertain outcomes expose no preparation or confirmation action. Failed replacement requests retain candidate choices and their source context. See [recovery behavior and manual checks](ai-recovery.md).

Validation: 75 existing AI tests, 13 component recovery tests and 41 integration tests pass. TypeScript, lint for changed code/tests and whitespace checks pass. Recovery tests include rendered markup and mocked component event flows; browser smoke checks remain manual.

### Step 2 implementation

Implemented a typed active write task and patch-based text revisions. Form edits, original task context and resolution choices remain together; short corrections preserve other fields and stock set/adjust/debit meaning. Recipe composition edits preserve/remap ingredient choices. Filtered revisions retain the original cohort, including unchanged rows. Recipe previews, mixed batches and record choices retain explicit selection. Pending revision questions disable the old confirmation, and every successful revision requires a fresh preview confirmation. See [active task behavior and manual checks](ai-active-task.md).

Validation: 91 AI tests, 21 component recovery/task tests and 44 integration tests pass (156 total), along with TypeScript, lint for changed code/tests and whitespace checks. These include missing creation fields, dependency renames, refresh retries and independent-task replacement. Live model interpretation and browser smoke checks remain manual.

Steps 3–5 remain pending review and approval. The current planner received the commands/context needed for revisions; the full proposed replacement instructions have not been applied.

## Acceptance scenarios

Use fixture records and compare validated commands, exact targets, retained fields, visible controls and resulting writes. For interpretation tests, cover paraphrases rather than a single sentence per case.

| Scenario | Expected result |
| --- | --- |
| `Додай банки` with no context | Ask create-versus-restock intent and missing quantity; create nothing. |
| `Створи матеріал «Chili Mix», категорія декор` | Preserve the title exactly; propose zero stock and an empty description visibly. |
| Selected jar has 10; `Додай 5 до залишку`; revise with `Краще 7` | Draft revision preserves adjustment mode: 10 → 17, with fresh confirmation. Requires active-task support. |
| Selected jar has 10; `Встанови залишок 5`; revise with `Краще 7` | Draft revision preserves set mode: 10 → 7. |
| Choose between two jars; type the remembered title | Continue the pending task or explain that a button choice is required; never silently replace it. |
| Prepare creation, edit all fields, trigger provider failure | Edited draft remains recoverable; no write. |
| Select a recipe, prepare one description change | Selection remains available, matching ingredient/material behavior. |
| Select a record; delete it elsewhere; `Покажи всі матеріали` | Independent search succeeds and expiry is explained. |
| Delete a referenced ingredient in a single request and in a batch | Both identify known blockers before confirmation unless the requested batch removes all references. |
| Search hidden sauces without images; `А лише підтверджені` | Category, hidden state and image filter remain; only confirmation filter changes. |
| `Тепер покажи всі матеріали` after that search | Fresh stuff search; no recipe filters leak. |
| `Встанови залишок 20 і ціну 100` | Explain unsupported price changes; do not silently prepare only the stock change. |
| Approximate ingredient spelling, including one candidate | Explicit candidate choice; no invented title or duplicate creation. |
| Recipe ingredient with no amount | Ask for its amount with an example; preserve the title and all known fields. |
| Ask which categories exist during clarification | List relevant Ukrainian labels and retain the original task. |
| More than 20 operations, including new recipe ingredients | Request narrowing; never silently truncate. |
| Stale preview / uncertain save / failed post-save refresh | Prepare anew / inspect outcome / retry reads only, respectively. |

## Validation performed during the initial review

- `npm run test:ai`: 75 passing tests.
- `npm run test:ai:integration`: 41 passing tests, using a disposable embedded PostgreSQL database.
- Four temporary review probes: reproduced missing-selection blocking, batch/single deletion inconsistency, absence of draft context in follow-up input, and loss of the editable preview after planning failure. All four passed assertions describing the current defects. The draft-loss probe used a mocked React hook harness, not browser automation.
- Test logs and the temporary probe runner are under `/tmp/variatka-ai-review-*` in this workspace session. At that stage, no application code, database records, provider settings or active rules were changed.

The existing suites mock planner output. They test execution and boundaries, not whether natural-language requests produce the intended plans. Live model interpretation, browser layout and accessibility interactions were not validated during this review.
