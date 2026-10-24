# Deletion preflight and blocked tasks

Implemented in checkpoint 3B. Single and batch ingredient deletions now check recipe references before offering confirmation. A referenced ingredient can be deleted only when explicitly requested operations in that same batch remove every reference in its proposed final state. Recipes used by orders remain protected. No recipe, order or composition is changed merely to make a deletion possible.

For example, `Видали інгредієнт «Тестова сіль»` is blocked if a recipe uses it. `У рецепті «Тестовий соус» прибери «Тестову сіль» зі складу та видали цей інгредієнт` can produce a preview if no other recipes reference that ingredient. These are example requests for manual interpretation checks, not verified live-model results.

## What the check includes

- Stored references outside the batch and references retained by its recipe updates.
- References introduced by proposed recipe creations/additions. Removing an old reference does not permit a new reference to the ingredient being deleted.
- Explicit recipe deletion and composition removal/replacement. The server compares resolved IDs, not title similarity, case or preview order.
- Current order-item counts for recipe deletion. Blockers show actual counts and bounded examples of affected titles.

Preparation resolves and normalizes the batch before validating ingredient dependencies. The internal ingredient-check deferral now means “validate the entire batch afterward”; it does not authorize a protected deletion. Recipe/order blockers can be reported earlier because this assistant cannot remove orders.

## Correct or recheck a blocked task

The reply contains `writeBlocked`, `CONFLICT` and the structured task with its resolution decisions/frozen targets. It contains no confirmable preview. The interface shows the blocker, keeps the request editable, and offers **Перевірити знову** and **Скасувати завдання**. The planner receives `activeWrite.phase='blocked'` so a typed `так` or `збережи` cannot point to a nonexistent confirmation.

Candidate continuation retains the last clicked record even if final validation then blocks deletion. A text revision that restores a reference replaces the prior confirmable preview with this blocked state. Short corrections retain unaffected fields and decisions. Rechecking uses the same task without a model call, filter rerun, new matching records or automatic writes. Only successful fresh preparation produces a preview that can be confirmed.

A failed independent replacement preserves an already active edited draft or uncertain-save reference instead of discarding it. Its blocked request stays in the input with the error; the current-task summary identifies which task remains active. Unknown save outcomes keep their read-only inspection flow and cannot be retried through these controls.

## Confirmation remains authoritative

`validateBatchDeletions` runs again inside the confirmation transaction before writes, including for browser-supplied previews and both confirmation actions. References/orders added after preparation reject the whole batch. Existing version checks, dependency ordering, foreign-key/write guards and serializable transaction settings remain in place. Image cleanup still happens only after commit.

The preflight does not introduce cascading operations, new supported writes, durable idempotency, migrations or dependencies. Full prompt replacement and capability/help alignment remain step 4.

## Validation

`npm run test:ai`: 104 AI tests and 36 component recovery/task tests. `npm run test:ai:integration`: 59 tests using disposable embedded PostgreSQL. **199 tests pass**, along with TypeScript, lint for changed code/tests and whitespace checks.

Coverage includes single/batch parity, complete versus partial explicit cleanup, proposed references, case-sensitive identities, candidate/revision recovery, frozen filtered targets, order protection, references added after preview, modified confirmation payloads, no partial data changes and no premature image cleanup. Existing draft/uncertain-save recovery tests still pass.

Planner outputs are mocked, and component handlers use a mocked React harness. Live interpretation, browser focus/layout/accessibility and distributed concurrency/load remain unverified. Manual fixture checks:

1. Try deleting the same referenced ingredient alone and in a batch. Verify blocker titles/counts and absence of confirmation.
2. Explicitly remove all references in the batch, then leave one external reference in a second attempt. Only the complete cleanup should offer a preview, and preparing either attempt must change no records.
3. Resolve an ambiguous delete target that is protected. Correct/recheck it and verify the chosen ID remains until explicitly retargeted.
4. Revise a valid cleanup to retain/add the ingredient again. Verify the old confirmation disappears; cancelling or rechecking writes nothing.
5. Add a reference or order in another tab after preview, then confirm. Verify the entire save fails and all records/images remain intact.
6. Block a filtered deletion, add a new match elsewhere, resolve the blocker externally and recheck. Verify the original target list stays fixed and a fresh confirmation is required.
