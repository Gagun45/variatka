# Active tasks and draft revisions

The assistant keeps one typed active write task while a proposal, record choice or revision question is pending. It contains the structured operation, current form edits, resolved record choices, original request context, preview, and confirmation status. The task is local to the mounted page; reloading or using **Новий чат** clears it.

## Correct a proposal

Prepare `Додай 5 до залишку банки`, then send `Краще 7`. If stock is 10, the revised preview shows 10 → 17. After `Встанови залишок банки на 5`, the same correction shows 10 → 7. After `Спиши 3`, `Краще 5` retains a debit of 5. Explicit `Ні, встанови 7` changes the mode to an absolute final quantity; `Тепер додай 7` changes direction to an increase.

The planner returns only a typed patch. The server merges it into the current task, reads current database values, and builds a fresh preview. It does not regenerate every field or infer a new target from the previous chat. No correction saves data; the newly prepared preview still requires its confirmation button.

For ingredient/material creation, direct form edits update the same task sent with the next prompt. A correction to stock therefore preserves an edited title, description, category and other fields. The assumptions section describes the initial suggested values; current values are in the updated fields/preview.

Empty/invalid creation titles and quantities remain visible in the form and are marked as missing in task context. They must be explicitly completed before preparing another creation preview; their previous values cannot silently become answers. Other valid edits remain intact, and an independent new request can still be processed.

Recipe corrections can update scalar fields or use named add/setAmount/remove composition changes. A partial correction preserves the other proposed ingredients/actions. Removing or reordering draft ingredients remaps existing resolution choices so unchanged ingredients retain their IDs. Renaming an explicitly created ingredient in a batch updates its recipe creation/addition references, preserving the dependency instead of proposing another ingredient under the old name. Full replacement requires explicit replacement intent.

For several operations, name the record to change. Planner operation indexes refer to the structured task; preview card numbers can differ because dependency operations are sorted first. An unclear ordinal should produce a question rather than modify a guessed record.

## Questions, choices and independent requests

- A revision question retains the task and all known values. Short answers continue that correction. The old preview cannot be confirmed or re-prepared while the question is pending. **Скасувати уточнення** returns to the preceding draft; cancelling the entire task clears its pending question too.
- A typed candidate name receives a reminder to use the actual record button. It retains the candidate list and complete operation. Field corrections can still revise the task before a choice is made. Candidate buttons continue without another planner call.
- `Так`, `збережи` and similar replies remind the user to use the confirmation button. They cannot authorize a write or regenerate the operation.
- A clear independent request, such as `Інший запит: покажи всі матеріали`, starts a new task. A failed request retains the previous task as described in [recovery behavior](ai-recovery.md).
- A task with an uncertain save outcome is excluded from revision context and remains a read-only reference. It cannot be revised/re-prepared as an implicit retry.

The **Поточне завдання** area near the input shows the task phase and targets so the user can see what a short correction will affect.

The [polished layout](ai-ui-polish.md) places this summary inside the composer. History, previous results and incidental record details collapse; questions, blockers, confirmation and uncertain-save recovery stay visible. An explicit details request opens stored data automatically.

Checkpoint 3B adds a [blocked deletion phase](ai-deletion-preflight.md). A known dependency conflict retains the structured task, chosen IDs and frozen targets without confirmation. **Перевірити знову** rechecks the same task without a model call or writes; only a valid fresh preview can be confirmed. A blocked revision removes the preceding confirmation. A failed independent replacement still retains the prior edited draft or uncertain-save reference.

## Stable targets and selection

Resolved record IDs are retained until the user explicitly changes a target. Renaming a record uses its title patch and keeps its ID; retargeting is a separate explicit change that drops only that operation's resolution decisions. Deleted/renamed resolved records still fail validation rather than being silently replaced.

A filtered proposal freezes its original cohort, including rows initially reported as unchanged. Revising its fields does not run the filter against new matching records. Every revised preview and confirmation still checks actual current records and versions.

Checkpoint 3A adds [expired-selection recovery](ai-selection-recovery.md): deleting an incidental UI selection does not cancel this task or change its target IDs. A missing actual target blocks preparation; a missing frozen cohort member, including an unchanged row, also blocks confirmation. Edit-request recovery cannot restore a known-deleted UI selection.

The explicitly selected record is independent of whether the proposal uses a single or batch preview. Preparing recipe previews, mixed batches and candidate choices retains selection. After saving, the selected record is reloaded if it still exists, including during refresh retries. Deleting it clears selection; a different batch record is not silently selected in its place. A new search, explicit selection/cancellation, reload or new chat can still change selection.

## Validation

`npm run test:ai` checks task schemas, patch preservation, stock modes/directions, mixed batches, recipe ingredient resolution keys, confirmation guards, form-to-text handoff, revision clarification, button reminders and stable selection. `npm run test:ai:integration` checks revisions and frozen cohorts against a disposable embedded PostgreSQL database.

Planner outputs are mocked in these suites. Live language interpretation and browser focus/layout still require manual checks:

1. Prepare stock set/adjust/debit proposals; correct each with a short number and check the new total before confirming.
2. Edit a creation form, correct one field in text, and verify every other edited field remains.
3. Select a recipe, prepare an update, and verify its selection remains through the preview and save.
4. Ask to change a description without supplying text. Answer the question, then repeat and cancel it; inspect that only the intended values change.
5. Type a candidate name and `так`; verify the task remains and neither reply saves data.
6. Prepare a filtered draft, add a matching record in another tab, then revise the draft; the new record must remain outside its target list.
7. Start an explicitly independent search and verify the task is replaced. Simulate a planning failure and verify the prior task remains instead.
