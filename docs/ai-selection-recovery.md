# Expired inventory selections

Implemented in checkpoint 3A. A record deleted in another tab no longer prevents the assistant from handling an independent search, creation or explicitly named write. The reply explains the expired selection alongside its normal result. The UI clears only that selection and offers a way to return to the input for a name/search.

For details or an unnamed write that needs the deleted selection, the assistant requests another name/selection. It must not substitute a record, infer creation or broaden the operation. Preparation remains read-only; saving still requires the preview confirmation button.

## Context and recovery

- An active task retains its own selected target, resolved IDs, fields and recipe choices. Expiring an incidental UI selection does not cancel that task or its candidates. Source context remains available, but **Редагувати запит** cannot restore a known-deleted selection.
- Clarification remains bound to its original selection/search even after automatic UI clearing. The server verifies the bound record's absence before allowing that clearing to coexist with a continuation. Selecting a different record cannot silently move an answer to it.
- The planner now returns `clarificationMode` (`continue` or `independent`). Continuations use the bound context; clearly independent requests can leave an obsolete clarification. Current search context and the clarification's original search are sent separately. The existing question command's `continuesPrevious` governs continuation for clarification replies.
- Planner context includes `unavailableSelection` and `clarificationSelectionUnavailable`, both based on verified missing rows. They are not usable record targets. The server independently enforces selection requirements and resolves named targets.
- A confirmed expiry can accompany a structured blocked request, including a provider error. That reply preserves the typed prompt, old task and clarification. Unexpected database errors are reported as failures, without inventing an expiry or clearing valid selection.
- A verified missing target/dependency immediately marks an affected draft stale; unrelated drafts remain usable and uncertain saves remain read-only. A missing actual task target blocks revision/re-preparation instead of resolving a replacement with the same title. Filtered previews also carry their complete frozen cohort, including unchanged rows; confirmation checks that every member still exists inside its transaction. No newly matching records are acquired and no deleted members are silently omitted.
- Unknown save outcomes retain their read-only inspection controls. Selection recovery does not enable preparation or another confirmation attempt for that save.

This behavior does not add persistent tasks or idempotent writes. Reload/new chat still clears local task context. Checkpoint 3B now also provides [final-state deletion preflight](ai-deletion-preflight.md).

## Validation

Checkpoint 3A validation: `npm run test:ai` passes 101 AI tests and 30 component event/recovery tests; `npm run test:ai:integration` passes 48 tests with disposable embedded PostgreSQL (**179 total**). TypeScript, lint for changed code/tests and whitespace checks pass. Tests cover all three selected entity types, named versus unnamed targets, clarification binding, unrelated drafts/candidates, provider/read failures, authorization, edit-request recovery, unknown saves and deleted frozen targets.

These tests mock planner outputs; the component harness is not browser automation. Live interpretation and browser layout/focus/accessibility remain unverified. Run these manual checks with disposable fixture records:

1. Select an ingredient, material and recipe in turn; delete each elsewhere. Ask `Інший запит: покажи всі матеріали`, then try an explicit creation/named update. Verify the result and expiry notice appear together, with no write before confirmation.
2. Repeat with `Покажи обраний запис` and an unnamed update/delete. Verify no replacement target or confirmable write appears. Enter a remembered name or search/select another record to continue.
3. Prepare an unrelated draft while another record is selected, edit its fields, delete the selection elsewhere, then correct the draft. Check retained edits, exact target IDs, stock direction and the requirement for fresh confirmation. Repeat while candidate buttons are visible.
4. Start a selected-record quantity clarification, delete that record, answer the question and then send an independent search. Check that the answer cannot affect another selection, while the independent search succeeds.
5. Prepare a filtered draft containing both changed and unchanged rows. Delete one unchanged row and add a new match elsewhere. Revision/re-preparation and the old confirmation must fail without updating surviving/new records.
6. Simulate a provider/read failure or uncertain confirmation, then encounter expiry. Check retained input, disabled unsafe controls, available inspection links and keyboard focus through the recovery controls. **Редагувати запит** must not restore the deleted selection.
