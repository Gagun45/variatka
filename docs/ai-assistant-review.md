# Inventory assistant review

Initial review: 24 October 2026. Scope: planner instructions, vocabulary, schemas, request context, name resolution, previews, confirmation, recovery, and existing tests. Findings and source line numbers below describe that initial baseline, before implementation. The [current implementation plan](ai-assistant-plan.md) is the source for remaining work, approval checkpoints and acceptance checks.

The confirmation boundary was sound in the paths checked: preparation did not write, approximate write matches required a choice, confirmations validated versions, and batches used a transaction. The largest initial usability problem was that the conversation looked continuous while the planner lacked pending task context. Step 2 now sends a typed active task and supports text revisions; live language interpretation still needs evaluation.

| Finding | Current status through checkpoint 3B |
| --- | --- |
| 1 — Lost follow-up context | Application fix implemented in step 2; live interpretation checks pending. |
| 2 — Lost edited drafts on failure | Implemented in step 1, preserved by step 2; browser checks pending. |
| 3 — Expired selection blocks unrelated requests | Implemented in 3A; live interpretation/browser checks pending. |
| 4 — Known deletion blockers appear confirmable | Implemented in 3B; live interpretation/browser checks pending. |
| 5 — Recipe previews clear selection | Implemented in step 2; browser checks pending. |
| 6 — Conflicting title/lookup rules | Open; step 4. |
| 7 — Stale help/search copy | Partly updated in steps 1 and 2; remaining capability/copy audit in step 4. |

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

[Proposed replacement planner instructions](ai-assistant-rules-v2.md) were drafted before step 2. They propose a fixed decision order, literal title preservation, search refinement as a filter edit, and more useful clarification questions. They do not yet include active-task commands/context and must be reconciled before adoption in step 4.

Instructions alone cannot fix findings 1–5. Application changes in steps 1 and 2 addressed findings 1, 2 and 5; checkpoint 3A addressed finding 3 and 3B addressed finding 4. Full instruction/copy reconciliation remains step 4. Do not claim proposed behavior in the active planner prompt until it exists.

## Recommended interaction contract

| Situation | Predictable behavior |
| --- | --- |
| Complete supported request | Prepare the result immediately; do not ask whether a supplied name exists. |
| Missing required information | Ask one concise question covering related missing fields; offer relevant labels or an example. Preserve partial answers. |
| Several actual name matches | Show real clickable records and retain the entire task. |
| Pending draft + correction | Revise that draft, retain other fields, and require confirmation of the new version. Implemented in step 2; live interpretation checks pending. |
| Pending draft + independent request | Replace it only after a new result is ready. On failure, retain both the draft and typed request. |
| Search refinement | Retain every previous filter except those explicitly changed or removed. Show the resulting filters. |
| Selection expired | Clear or reselect explicitly; independent requests remain usable without changing active-task targets. Implemented in 3A; live interpretation/browser checks pending. |
| No matching records | State that no records matched. Offer removing a specific filter; do not silently broaden. |
| No changes needed | Show a neutral result and no confirmation button. |
| Known validation conflict | Keep recoverable input and explain what must change. Implemented batch deletion preflight retains blocked tasks without confirmation. |
| Save outcome unknown | Disable the attempted confirmation, show affected-record links, and inspect the outcome. |

Step 2 added a current-task summary near the input showing phase and targets. Category, availability and intent clarifications could eventually use typed quick replies; that is outside the current plan and would need a schema/UI extension rather than instructions to invent buttons.

## Implementation order

See the [revised execution plan](ai-assistant-plan.md) for detailed scope and acceptance checks. Implement one checkpoint and wait for confirmation before the next:

1. **Implemented:** retain drafts through failures and distinguish definite, stale and uncertain saves.
2. **Implemented:** active tasks, typed revisions, stable resolved/filter targets and selection across preview types.
3. **Implemented as separate checkpoints:** 3A recovers incidental expired selection while preserving task identity; 3B validates final-state deletion blockers before confirmation and retains blocked task context.
4. **Pending:** reconcile proposed rules with steps 1–3, capture/compare interpretation before adoption, then align capability/help text.
5. **Pending:** make live interpretation evaluation repeatable and complete browser UX checks. Durable save idempotency is a separately specified follow-up, not part of this testing step.

### Step 1 implementation

Implemented draft retention through failed planning and confirmation. Edited creation fields can be revalidated without regenerating their original defaults. Known failed confirmations require a fresh preview; stale drafts remain read-only references; uncertain outcomes expose no preparation or confirmation action. Failed replacement requests retain candidate choices and their source context. See [recovery behavior and manual checks](ai-recovery.md).

Validation: 75 existing AI tests, 13 component recovery tests and 41 integration tests pass. TypeScript, lint for changed code/tests and whitespace checks pass. Recovery tests include rendered markup and mocked component event flows; browser smoke checks remain manual.

### Step 2 implementation

Implemented a typed active write task and patch-based text revisions. Form edits, original task context and resolution choices remain together; short corrections preserve other fields and stock set/adjust/debit meaning. Recipe composition edits preserve/remap ingredient choices. Filtered revisions retain the original cohort, including unchanged rows. Recipe previews, mixed batches and record choices retain explicit selection. Pending revision questions disable the old confirmation, and every successful revision requires a fresh preview confirmation. See [active task behavior and manual checks](ai-active-task.md).

Validation: 91 AI tests, 21 component recovery/task tests and 44 integration tests pass (156 total), along with TypeScript, lint for changed code/tests and whitespace checks. These include missing creation fields, dependency renames, refresh retries and independent-task replacement. Live model interpretation and browser smoke checks remain manual.

### Checkpoint 3A implementation

Implemented structured missing-record lookup, independent-versus-continuing clarification scope, and expiry notices alongside successful/blocked replies. Clearing incidental UI selection preserves drafts, candidates, edits and original binding. Known-deleted selections cannot return through edit-request recovery. Missing actual targets block revision/re-preparation; filtered confirmation also checks unchanged frozen members in its transaction. Ordinary read errors and uncertain saves retain their existing failure boundaries. See [selection recovery behavior and manual checks](ai-selection-recovery.md).

Validation: 101 AI tests, 30 component tests and 48 integration tests pass (179 total), plus TypeScript, lint for changed code/tests and whitespace checks. Live interpretation and browser checks remain unverified.

### Checkpoint 3B implementation

Implemented a shared final-state deletion preflight after batch resolution and inside the save transaction. Explicit recipe deletions/composition changes can remove blockers; external, retained and newly proposed references still block. Blocked tasks preserve choices and frozen targets without a confirmable preview; revisions, candidate continuation and rechecks use the same validation. Failed independent replacements retain earlier drafts/uncertain references. See [deletion preflight behavior and manual checks](ai-deletion-preflight.md).

Validation: 104 AI tests, 36 component tests and 59 integration tests pass (199 total), plus TypeScript, lint for changed code/tests and whitespace checks. Live interpretation and browser checks remain unverified.

Steps 4–5 remain pending approval. The current planner received only the context/scope additions needed for implemented checkpoints; the full proposed replacement instructions have not been applied.

## Acceptance scenarios

Use fixture records and compare validated commands, exact targets, retained fields, visible controls and resulting writes. This table defines expected behavior, not completed live-model checks. For interpretation tests, cover paraphrases rather than a single sentence per case. The [current plan](ai-assistant-plan.md) adds acceptance checks for the step 2 contract and the two step 3 checkpoints.

| Scenario | Expected result |
| --- | --- |
| `Додай банки` with no context | Ask create-versus-restock intent and missing quantity; create nothing. |
| `Створи матеріал «Chili Mix», категорія декор` | Preserve the title exactly; propose zero stock and an empty description visibly. |
| Selected jar has 10; `Додай 5 до залишку`; revise with `Краще 7` | Draft revision preserves adjustment mode: 10 → 17, with fresh confirmation. Application path implemented in step 2; live phrase check pending. |
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
