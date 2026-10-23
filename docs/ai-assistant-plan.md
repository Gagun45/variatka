# Inventory assistant implementation plan

Revised after steps 1 and 2. This is the current execution plan; the [review](ai-assistant-review.md) records the original findings. The [version 2 rules](ai-assistant-rules-v2.md) are an earlier proposal, not the active prompt or an adoption-ready replacement.

## Approval boundaries and order

Implement one checkpoint, report changes and validation, then wait for the user's confirmation before starting the next. This revision changes documentation only and does not start step 3.

| Checkpoint | Status | Result |
| --- | --- | --- |
| 1 — Draft recovery | Implemented | Failed planning retains edited drafts; failed/uncertain confirmations have distinct recovery controls. |
| 2 — Active tasks and revisions | Implemented | Typed patches preserve fields, resolved IDs, stock intent and filtered cohorts; selection survives recipe/batch previews. |
| 3A — Expired selection | Next, awaiting approval | An incidental deleted selection cannot block an independent request or change a task's actual targets. |
| 3B — Deletion preflight | Awaiting separate approval after 3A | Known references block confirmation unless explicitly requested batch operations remove all of them. |
| 4 — Rules and help | Pending 3A and 3B | Reconcile rules with the implemented contract, compare interpretation, then adopt and align help. |
| 5 — Repeatable interpretation evaluation | Pending step 4 | Turn the comparison cases into a reusable evaluation workflow and finish browser UX checks. |

The original step 3 is split into 3A and 3B because selection recovery and deletion dependency validation touch different contracts. Approval for 3A does not authorize 3B. Steps 4 and 5 keep their numbering, but a baseline interpretation comparison moves into step 4 before changing the active prompt.

## Implemented baseline to preserve

Step 1 retains drafts, form edits, candidate choices and source context through failed replacement requests. Definite confirmation failures require fresh preparation; stale drafts are references; unknown save outcomes expose inspection/read recovery without another confirmation attempt. See [recovery behavior](ai-recovery.md).

Step 2 adds `activeWrite` and the `revise`, `clarifyRevision` and `keepTask` planner commands. Server-side patches preserve unaffected fields/operations, resolved identities, recipe ingredient choices, stock set/adjust/debit meaning and the original filtered cohort, including initially unchanged records. Candidate buttons remain the resolution mechanism; typed names/save requests retain the task and explain which button to use. Every revised preview requires new confirmation. See [active task behavior](ai-active-task.md).

The last recorded step 2 validation is 91 AI tests, 21 component tests and 44 integration tests: **156 passing tests**, plus TypeScript, lint for changed code/tests and whitespace checks. Those suites mock planner output; the component harness is not a browser. They establish application behavior for supplied plans, not reliable interpretation of Ukrainian phrases. Live interpretation, browser focus/layout and accessibility interactions remain unverified. No suites were rerun for this documentation-only revision.

Preserve these constraints in every remaining checkpoint:

- Keep UI selection, clarification-bound selection and active-task targets distinct. Recovering one must not erase or rebind the others.
- Preserve edits, missing-field markers, source context and resolution decisions on failure. Last valid fallback values for invalid creation fields are not answers.
- Preserve frozen filter targets; revisions/re-preparation must not acquire new matches or silently omit deleted targets.
- Require fresh confirmation after correction/re-preparation. Text cannot save data or choose a candidate.
- Keep uncertain saves read-only. Selection recovery, revision and failed reads must not become implicit retries of adjustments.
- Retain authorization, schema/limit checks, version checks, transactional rollback and image cleanup after commit.

## 3A — Recover expired selection without changing task identity

**Problem:** `askInventoryAssistant` reads UI selection before planning. A deleted record aborts even an independent search. Step 2 now preserves selection across more previews, so clearing all selection/task state would undo its guarantees.

**Scope:**

1. Distinguish a missing record structurally from unexpected database/read errors. Authentication still precedes reads. Only a confirmed missing record qualifies for expiry recovery.
2. Carry an explicit unavailable-selection signal through planning and the reply/UI contract. Independent searches, creations and explicitly named operations can proceed. Selected-record details and unnamed dependent writes must request a selection/name; a lost reference must not become creation or a broader write.
3. Continue active revisions from saved `pending.selected`, decisions and frozen targets, even if UI selection differs/expires. Missing actual task targets block that task with recoverable input, never replacement by name, filter reruns or partial execution.
4. Preserve clarification binding. A continuation cannot migrate to another record. A clearly independent request can leave an obsolete clarification without inheriting its selection/search filters. Ordinary read failures must not masquerade as expiry.
5. Show a concise expiry notice and clear/reselect recovery, including alongside successful independent results. Clear only expired UI selection while preserving unrelated tasks and edits. The current clear-selection handler also cancels the task, so it cannot be reused blindly.

**Acceptance checks:**

| Case | Required outcome |
| --- | --- |
| Delete selected ingredient/material/recipe elsewhere; request independent search/creation | Request succeeds; expiry explained; stale UI selection cleared. |
| Expired selection; explicitly name another write target | Resolve supplied name normally; never use deleted selection. |
| Expired selection; request its details or an unnamed update/delete | Request a selection/name; no write or guessed replacement. |
| UI selection expires while a different resolved draft is active | Draft values, identity and revision/choice flow survive. |
| Actual task target or frozen cohort member disappears | Block affected preparation/save; retain task; never silently broaden/shrink scope. |
| Selection expires during clarification | Preserve original binding; allow independent requests; dependent answers cannot retarget. |
| Selected-record read fails for another reason | Report failure; retain work; do not claim deletion. |
| Uncertain save is present during selection recovery | Inspection remains available; no revision/preparation/confirmation retry for that save. |

**Likely areas:** `lib/actions/ai.actions.ts`, `lib/domain/ai-inventory.service.ts`, clarification/request/reply types, planner context, `AiAssistant.tsx` and recovery tests. Run existing step 1/2 tests alongside new action/component/integration cases. Update behavior docs and report browser checks separately before requesting approval for 3B.

## 3B — Reject known deletion blockers before confirmation

**Problem:** batch preparation passes `allowReferencedDelete=true` to ingredient deletions without validating whether the batch removes their recipe references. Confirmation already rejects protected deletes; the defect is a misleading confirmable preview.

**Scope:**

1. Validate the fully resolved/normalized proposed batch against stored references before returning a confirmable preview. Use IDs, not titles/display order. Include references outside the batch and references introduced/retained by proposed recipe creations/updates.
2. Allow ingredient deletion only when explicitly requested recipe deletions/composition changes remove every reference in the proposed final state. Never add cleanup operations or change relationships just to permit deletion. Preserve existing recipe/order guards; orders cannot be edited through this assistant.
3. Apply preflight to initial preparation, candidate continuation, text revision and re-preparation. Restoring a blocking reference must invalidate the old confirmable state. Keep task data recoverable and explain remaining blockers; offer no confirmation for a blocked batch.
4. Revalidate in the confirmation transaction against current data, including browser-supplied previews. Keep version checks, dependency ordering, foreign-key guards and rollback. References/orders added after preview must reject the entire save; image cleanup remains after commit.

**Acceptance checks:** single versus one-item batch deletion has the same blocker behavior; removing all explicit references succeeds; leaving one external reference fails; retaining/adding a reference in a proposed recipe fails; an order-protected recipe blocks the batch; ambiguity choices/revisions rerun preflight; filtered cohorts stay frozen; references added after preview cause complete rollback with no image removal.

**Likely areas:** batch preparation/workflow services, dependency validation and existing write guards, plus fixture-based integration tests. Exercise both confirmation actions, which share batch application. Update behavior docs and report validation before requesting approval for step 4.

## 4 — Reconcile rules, compare interpretation, then adopt

The proposed rules predate active tasks. Copying them now would omit revision commands and explicitly deny draft context. Step 4 must reconcile that document with current schemas and steps 1–3 before runtime replacement.

1. Freeze synthetic interpretation cases and capture the current planner baseline before editing runtime instructions. Start with the [review scenarios](ai-assistant-review.md#acceptance-scenarios); add debit direction, incomplete creation fields, original operation indexes, frozen cohorts and independent requests during clarification.
2. Reconcile the proposed instruction body with `activeWrite`, `revise`, `clarifyRevision` and `keepTask`. Preserve patch-only revisions, explicit retargeting versus renaming, recipe choices, scoped clarification and button-only choices/saves. Preview order is not operation identity. Changing operation type/count or filtered cohort requires a new complete task, not an invented revision capability.
3. Resolve title/lookup precedence: Ukrainian messages; literal supplied titles in any language; literal quoted/field-specific text; grammatical normalization only for unquoted generic search wording. Keep actual matching on the server. Unsupported requests must not become silent partial writes.
4. Compare current and candidate instructions before adoption. Record model/provider configuration, prompt version, context, expected structured outcomes and actual outputs. Use paraphrases/repeated trials for short or ambiguous corrections. Check intent, target/operation identity, retained constraints and missing information, not exact message wording. Critical regressions in targeting, stock direction, partial writes or confirmation behavior block adoption. If live evaluation cannot run, report it as unverified and leave adoption pending.
5. Adopt reconciled instructions after comparison. Maintain one capability table in the main assistant guide; align onboarding, search hints and recovery text. Run schema/instruction checks and existing application suites; perform browser checks for changed flows.

Do not expand supported entities/fields, introduce typed candidate selection, add full chat history or invent quick-reply UI here. Report comparison results, uncertainty and manual checks before requesting approval for step 5.

## 5 — Make interpretation and UX checks repeatable

Step 4 needs a small before/after comparison. Step 5 turns its cases into a maintained workflow instead of delaying all language validation until after adoption.

- Add an opt-in live interpretation runner with synthetic fixture context and no production writes. Keep deterministic execution tests separate. Store case IDs, expected structured properties, model/prompt configuration, repeated-trial results and failure examples without secrets.
- Expand cases across clarification answers, independent requests, literal titles, search refinements, stock corrections, recipe patches, candidate reminders, deletion scope, unsupported mixed requests and operation limits. Check required questions/preserved constraints, not exact Ukrainian phrasing.
- Make critical expectations explicit: no guessed targets, dropped operations/filters, changed stock direction, fabricated missing values or text-authorized writes in evaluated trials. Report observed pass counts/variability, without claiming universal reliability from a passing sample.
- Complete browser checks for task visibility, focus after errors/questions, keyboard candidate choice, disabled confirmations, cancel/reselect behavior and unknown-save inspection. Label mocked component tests, browser checks and live-model results separately.

Done when evaluation can be rerun for prompt/model changes, failures are actionable and unrun checks are clearly reported. Live evaluation remains deliberate and separate from ordinary offline test commands.

## Separate follow-up: durable save recovery

A durable operation ID/idempotency record is a persistence feature, not interpretation testing. Specify and approve it separately, including transaction ownership, replay rules for stock adjustments, retention and outcome lookup. Until then, retain conservative uncertain-save behavior from step 1. Cross-reload task persistence, quick replies and new inventory capabilities are also outside this plan.
