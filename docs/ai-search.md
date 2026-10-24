# AI search and record selection

The admin assistant at `/admin/ai` searches ingredients, recipes and stuff, displays matching records, and lets you select one for detail questions. [Ingredient and stuff CRUD](ai-crud.md) is also available with preview/confirmation. Search, selection and detail questions make no database changes.

## 1. Start with your existing setup

No new dependencies, database migrations, or environment variables are required. Keep your existing `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-6-luna`. See [initial setup](ai-assistant.md) if needed.

```bash
npm run dev
```

Sign in as admin and open `/admin/ai`.

Why: the existing API connection and admin authentication are reused. Each search/detail/chat server action checks admin access independently.

## 2. Search in Ukrainian

Try these prompts individually:

| Prompt | Expected filters |
| --- | --- |
| Покажи спеції-інгредієнти, яких немає в наявності | Ingredients, SPICES, availability false |
| Знайди рецепти з часником без цукру | Recipes containing garlic and excluding sugar |
| Покажи приховані непідтверджені соуси | Recipes, SAUCES, hidden true, confirmed false |
| Покажи негострі рецепти серії Nomly Gold | Recipes, NOMLYGOLD, spiciness 0 |
| Які рецепти можна приготувати з наявних інгредієнтів? | Nonempty recipes with every ingredient available |
| Знайди слоїчки із залишком менше 10 | Stuff, JARS, stock at most 9 |
| Знайди все з назвою або описом «перець» | All three types, title/description search |

The result panel displays the actual applied filters. Check them before interpreting the results: AI can misunderstand a sentence even when the filter values are valid. If the requested entity or condition is unclear/unsupported, the assistant is instructed to ask for clarification.

Why: the model translates language into a restricted query description. The server validates it and builds Prisma queries; it never executes model-generated SQL or arbitrary Prisma input. Search results and details come directly from database reads, not generated answers.

## 3. Select a record

Click **Обрати** on a result. A compact panel shows its type/title; expand **Дані запису** to inspect stored fields. Recipes include their composition with amounts and ingredient availability, notes, statuses, and variant stock. Ingredient details show how many recipes reference them; stuff details show numeric stock. Previous search results collapse while a record/task is active and remain available on demand. See [UI behavior](ai-ui-polish.md).

**Відкрити** opens the original page in another tab, preserving your current chat. **Скасувати вибір** clears the selection.

Why: explicitly selecting a real record avoids guessing a database ID or choosing the wrong similarly named item. Selection reloads the record from the database and does not make an AI call.

## 4. Ask about the selected record

After selecting a recipe, send:

```text
Покажи її склад.
```

Or ask `Покажи опис` / `Який залишок?` for the selected record. The assistant refreshes and opens the detail panel with current stored values. It displays full details rather than generating a free-form analysis. It cannot calculate production quantities from ingredient amounts or answer arbitrary analytical questions.

Why: follow-up context contains the selected entity and ID. The server reloads the record on every follow-up; the model only receives its identity/title, not private descriptions, notes, composition, or the whole inventory. If the record was deleted, clear the selection and search again.

## 5. Refine the previous search

For example:

```text
Покажи всі інгредієнти категорії спеції.
```

Then:

```text
А лише наявні.
```

The previous validated filters are provided to the model, so it can preserve the category and change availability. A new independent request starts a fresh search. A successful new search clears the old record selection; select a result again for record-specific questions.

When the assistant asks for essential missing information, short answers continue the [pending clarification](ai-crud.md#clarification-questions). Messages, the last search, selection and clarification context live only in this mounted page. Reloading or leaving the page resets them; there is no persistent chat history.

## 6. Load additional results

Each page contains at most 20 records per type. Cross-type searches show up to 60 records per page, so ingredients cannot crowd recipes or stuff out of the first page. Click **Показати ще** to append the next page. Pages use title/ID ordering, and the UI removes duplicates.

Loading more uses a database action directly, without another AI call. Searches are not snapshot-isolated across pages: concurrent edits can shift records; rerun the search for a refreshed list.

## Search semantics and limits

- Generic text search (including recipe notes and confirmation notes) ranks exact and substring matches ahead of tolerant word-order, normalization and spelling matches. Ingredient inclusion/exclusion also uses tolerant title matching. There is no synonym dictionary or vector search; see [name matching](ai-name-matching.md).
- Specified filters are combined with AND. All included ingredient terms must match; none of the excluded terms may match. This is based on recorded composition, not inferred dietary/allergen guarantees.
- Ingredient availability is a boolean, not a quantity.
- Recipe finished-product availability means at least one variant has positive stock. A recipe without variants is unavailable.
- “Can be cooked” means a recipe has at least one ingredient and all listed ingredients are marked available. It does not check quantities, packaging or finished-product stock. Recipes without ingredients are not considered ready.
- Stuff stock is a nonnegative integer; stock/spiciness range bounds are inclusive. Spiciness is 0–4. For example, “less than 10” becomes a maximum of 9.
- Searches do not default to public-only recipes: admins can find hidden and unconfirmed recipes.
- Prompts are limited to 12000 characters, text filters to 200, and included/excluded ingredient lists to 8 terms each. Pagination is bounded. Unsupported filters such as prices or numeric ingredient quantities should produce a clarification rather than silently changing the query.
- Ingredients, recipes and stuff support create/update/delete through separate confirmation previews. Orders remain excluded; see the [CRUD guide](ai-crud.md).

## Implementation map

1. `zod/ai-search.schema.ts`: allowed filters, selected-record reference, request/plan contracts and pagination validation.
2. `lib/ai/structured-output.ts`: shared OpenAI transport, strict output validation, timeout and error handling.
3. `lib/ai/inventory-assistant.ts`: one typed command for search, selected-record details, ingredient/stuff mutation previews, clarification and unsupported requests. `lib/ai/clarification.ts` preserves bounded question/answer context.
4. `lib/ai/inventory-search.ts`: typed Prisma filter builders, including relations, literal text escaping and availability rules.
5. `lib/domain/ai-inventory.service.ts`: bounded database reads, range checks and detail projection. No order/customer data is queried.
6. `lib/actions/ai.actions.ts`: authenticated chat routing, direct search/pagination and selection/detail actions.
7. `InventorySearchView.tsx` and `AiAssistant.tsx`: filters/results, selection, detail panels and transient session context.

This still uses structured plans rather than a provider tool-calling loop. Ingredient/stuff mutations reuse resolved selections with before/after previews and explicit confirmation. Recipe writes and atomic batches now use the same approach; see the [recipe and batch guide](ai-recipes-batches.md).

## Verification

```bash
npm run test:ai
npx tsc --noEmit
npm run build
```

The tests use Node's built-in runner and the installed TypeScript compiler, with mocked database/authentication/API boundaries. They cover query construction, filter validation, auth before reads/API calls, selection refresh, stale records, pagination, structured-output schema compatibility, malformed/refused responses unified creation and clarification regressions. They require no real key and never access your database. They do not verify live model interpretation or real database query execution.

For a browser smoke test, run the prompts above against known records, verify displayed filters/results, select a recipe and ask for its composition, refine a search, load more, and refresh to check that context clears. Also verify a non-admin is redirected and an ingredient creation preview still saves only after confirmation.

## More stored fields

If the selected record was deleted elsewhere, [selection recovery](ai-selection-recovery.md) clears that UI selection and explains the expiry alongside independent results. Named operations remain usable; details/unnamed writes need another name or selection. Active tasks retain their own targets and clarification bindings.

Search now supports scoped notes/descriptions, missing images/text/composition,
ingredient usage, Kyiv calendar dates and variant-specific stock. See the
[prompt examples and filter semantics](ai-stored-field-search.md).
