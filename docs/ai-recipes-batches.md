# Recipe CRUD and atomic batches

The assistant at `/admin/ai` can create, read, update and delete recipes, ingredients and stuff. Every write first produces a preview. Batches save in one database transaction: either every operation succeeds or none does.

## 1. Run the existing setup

Keep the existing AI API key, model and database configuration. No new environment variables or database migrations are required. Test dependencies are declared directly in `package.json`; run your usual `npm ci` when setting up a fresh checkout.

Why: this extends the existing structured-plan and confirmation flow rather than adding another agent framework.

## 2. Try a recipe creation

Send a Ukrainian prompt such as:

> Створи прихований рецепт «Тестова приправа» у категорії спеції: сіль 20 г, часник 5 г. Гострота 1.

Check the preview before confirming. It shows recipe fields and the complete composition. Existing ingredients are resolved by name across all ingredient categories; you do not need to supply their categories. Their stored category is preserved. Exact names take precedence. Otherwise, a unique case-insensitive title substring is resolved to its full stored name, shown in the preview. Multiple matches pause preparation and show clickable alternatives; choose a record to continue the whole request without another model call. Amount changes and removals search only that recipe’s composition, while additions search the ingredient inventory. Unknown composition names show the existing ingredients. If literal lookup fails, tolerant spelling, word-order and normalization matches are offered for explicit selection, even for one candidate. See [name matching](ai-name-matching.md). Missing ingredients appear as separate creation operations in the same batch; they start with an empty description, unavailable and unsaved. Their category is shown for review; when unspecified, a missing ingredient defaults to OTHER (Інше).

Defaults: hidden, unconfirmed, unsaved, DEFAULT series, spiciness 0 and empty optional text. The assistant asks about an unclear recipe category. It must not invent composition or amounts; a recipe without supplied composition can be created as an empty draft.

Why: dependency creation remains visible and cannot leave half-created recipes if a later operation fails.

## 3. Edit a recipe

Select a recipe from search, then try:

> Зміни кількість часнику на 8 г, решту складу залиш без змін.

Or identify the recipe explicitly:

> У рецепті «Тестова приправа» зміни опис на «Для овочів» і познач як збережений.

Composition edits support adding an ingredient, changing its amount and removing it. Full replacement happens only when explicitly requested, for example:

> Повністю заміни склад рецепта «Тестова приправа» на: сіль 15 г, перець 3 г.

Amounts are stored as text, preserving supplied units. Spiciness must be an integer from 0 to 4. Unmentioned fields and ingredients remain unchanged. Recipe preview cards are read-only; [text revisions](ai-active-task.md) change the proposal while preserving other fields and require a fresh preview confirmation.

Why: editing one amount should not accidentally replace the rest of a recipe.

## 4. Try a batch

Explicit list:

> Створи інгредієнти «Тестова сіль» і «Тестовий перець» у категорії спеції, а також матеріал «Тестовий пакет» із залишком 10.

Filtered update:

> Познач усі інгредієнти категорії спеції як наявні.

Single updates, deletions and recipe previews use the same change cards as batches, with an action-specific heading such as **Оновлення матеріалу** instead of a one-operation package. Single ingredient/material creation remains editable. Multi-operation previews summarize creation/update/deletion counts and counts by entity. Cards stay in execution order so dependencies remain visible. Updates show changed fields and composition entries only; expand **Усі дані запису** to inspect unchanged values too. New ingredient cards identify the recipes that need them. Deletions have a distinct warning and require confirmation through the same atomic batch flow.

The confirmation bar stays near the bottom of the viewport while reviewing a long batch, with the total and deletion count. Keyboard focus moves to a new preview heading and to errors. Nothing is saved by opening details or focusing the preview.

The preview lists concrete records, their before/after values and the operation count. Records already matching the request are reported without a write. If every record is unchanged, the assistant returns a neutral **Змін не потрібно** result with no confirmation button or red validation error. This also applies to a single unchanged ingredient, material or recipe. Confirmation affects the frozen list shown in that preview; records added later are not silently included.

The maximum is **20 operations**, including missing ingredient creates. Broader requests are rejected with instructions to narrow them. Conflicting or repeated operations on the same record must be combined. There is one confirmation for the whole batch, and cancellation writes nothing.

Why: a bounded, inspectable transaction is easier to verify and retry.

## 5. Delete carefully

Deleting a recipe used by an order is blocked. Single and batch ingredient deletions validate all stored and proposed recipe references before confirmation. An explicit batch may remove every reference or delete the referencing recipes before deleting an ingredient, provided those recipes are not protected by orders. External, retained or newly proposed references still block the batch. No related recipe, order or composition is silently removed. [Blocked tasks](ai-deletion-preflight.md) retain their choices and frozen targets for correction/rechecking and have no confirmation until validation succeeds.

Concurrent changes invalidate stale previews. The transaction rolls back and you must prepare a fresh preview. Image cleanup runs only after successful database commit; storage failures are logged separately.

Why: database validation remains authoritative even if something changed after the preview.

## 6. Verify locally and after deployment

Run:

```bash
npm run test:ai
npm run test:ai:integration
npx tsc --noEmit
npm run build
```

The integration suite uses disposable in-process PostgreSQL through PGlite, applies the existing migrations and executes real Prisma SQL. It does not read the production connection string, call the model or open a network listener. Cases cover rollback, stale versions, dependency ordering, reference restrictions, filters and authorization. It does not simulate distributed concurrency or load.

For a browser smoke test, create a uniquely named test recipe with one missing ingredient, inspect both preview operations and confirm. Change one amount and verify the rest stays intact. Cancel a batch and verify no records were created. Try an over-limit request and a stale preview. Also inspect a mixed batch on a narrow screen: verify long names and descriptions wrap, all values remain accessible, the confirmation bar stays usable, Tab reaches expandable details and buttons, and error focus is visible. Finally delete your unreferenced test records and repeat the basic create/update flow after deployment.

Recipe variants, finished-product stock writes, images and orders are outside this feature. Ingredient availability and stuff stock remain supported.

## Implementation map

- `zod/ai-recipe.schema.ts`, `zod/ai-batch.schema.ts`: validated intents and previews.
- `lib/domain/ai-recipe.service.ts`: ingredient resolution and recipe proposals.
- `lib/ai/batch-preview.ts`: visible dependency creates, duplicate checks and cap.
- `lib/domain/ai-batch.service.ts`: frozen targets and atomic execution.
- `lib/domain/recipe-write.service.ts`: shared manual/AI recipe writes with version checks.
- `app/(admin)/admin/ai/_components/`: recipe and batch previews.
