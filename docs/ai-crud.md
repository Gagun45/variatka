# Ingredient and stuff CRUD through the AI assistant

The assistant at `/admin/ai` can now create, search/view, update and delete ingredients and stuff (materials). Every write requires a preview and an explicit button confirmation. Recipe search/details remain available; recipe writes and order functionality are excluded.

No new packages, environment variables or database migrations are required. Use your existing OpenAI setup.

## 1. Create a record

Existing ingredient creation still works:

```text
Створи інгредієнт куркума, категорія спеції, є в наявності.
```

For stuff:

```text
Створи новий матеріал «Слоїчки 250 мл», категорія слоїчки, залишок 30, опис: скляні слоїчки.
```

Check the editable creation form, then click **Підтвердити створення**. Missing stuff description defaults to empty, stock to 0, and category is inferred as JARS or DECOR where clear. Proposed defaults are explained. Existing ingredient defaults are unchanged. Titles must be nonblank and unique within their entity type; the database's existing uniqueness remains case-sensitive.

Why: AI proposes values; the application validates and saves them only after confirmation. Confirmation itself does not call OpenAI.

## 2. Find the record to change

You can search, click **Обрати**, then refer to the selected record:

```text
Познач її як відсутню.
```

Or include the existing title directly:

```text
Познач інгредієнт «Куркума» як відсутній.
```

A unique case-insensitive exact title match prepares a preview automatically. Otherwise, matching candidates are shown; choose one and the pending operation is prepared without another AI request. If several candidates are shown, nothing is changed until you select one and confirm the resulting preview. An explicitly named target takes precedence over a different selected record.

Why: the model cannot invent a database ID. Target resolution happens on the server, using real records or an explicit selection.

## 3. Edit ingredient fields

Examples:

```text
Перейменуй інгредієнт «Куркума» на «Куркума мелена».
```

```text
Для обраного інгредієнта встанови опис «Мелений корінь куркуми» і категорію спеції.
```

```text
Познач обраний інгредієнт як наявний та збережений.
```

```text
Очисти опис обраного інгредієнта.
```

Editable fields: title, description, category (SPICES/OTHER), availability and saved status. Ingredients have boolean availability, not a numeric quantity or price.

The preview lists only changed fields, with **Було → Буде**. Other fields are preserved, including existing empty/null descriptions and saved status. To revise an update proposal, cancel it and send the complete revised request. Creating/editing multiple records in one request is not supported.

Why: defaults are appropriate for new records, but must never reset existing data during an update.

## 4. Edit stuff and stock

Editable fields: title, description, category (JARS/DECOR), and nonnegative integer stock.

| Prompt | Meaning if current stock is 10 |
| --- | --- |
| Встанови залишок обраного матеріалу на 30 | 10 → 30 |
| Додай 5 до залишку обраного матеріалу | 10 → 15 |
| Спиши 3 штуки обраного матеріалу | 10 → 7 |
| Встанови залишок обраного матеріалу на 0 | 10 → 0 |

For a named target: `Збільш залишок матеріалу «Слоїчки 250 мл» на 5`.

The server computes the resulting total from the current database value. A write that would produce negative, fractional or overflowing stock is rejected. If “додай слоїчки” could mean creating a new record or increasing stock, the assistant is instructed to ask for clarification; use explicit creation or stock wording.

Why: calculating the total on the server prevents the model from guessing current stock. The preview shows the exact final quantity you are approving.

## 5. Confirm or cancel

Click **Підтвердити зміни** to save an update, or **Скасувати** to discard it. A pending target-choice operation also has a cancel button. Selecting another record or sending a new prompt clears the previous preview.

Before/after previews contain the record's `updatedAt` version. Confirmation performs an atomic conditional write against that version. If another tab/user changes the record after the preview, confirmation is rejected; request a fresh preview. Reconfirming a previously applied update cannot apply a stock adjustment twice.

After success, the page refreshes the selected record and current search. Relevant ingredient/stuff queries and recipe queries affected by ingredient changes are invalidated. If only the refresh fails, the UI reports that the operation succeeded and asks you to refresh the search. A transport failure during saving can leave the result uncertain: check the record before requesting a new stock adjustment.

Why: the approved change should apply to the values you reviewed, and a refresh error should not encourage repeating an already successful write.

## 6. Delete one record

```text
Видали обраний матеріал.
```

```text
Видали інгредієнт «Тестова спеція».
```

The deletion preview shows the entity, exact title, ID and current values. Click **Підтвердити видалення** only after checking the target. There is no undo in the assistant.

Ingredients used in recipes cannot be deleted. This is checked both when preparing the preview and when deleting; the delete predicate and database foreign key also protect against a new recipe reference being added concurrently. The assistant will not detach ingredients or delete related recipes to work around this restriction.

For deleted ingredients with images, the database row is deleted first, then image cleanup is attempted. A rejected/stale delete never removes the image. If storage cleanup fails after a successful deletion, the deletion remains successful and the server logs the cleanup failure; an orphaned image may need later cleanup. Stuff has no image attachment in the current model.

Why: deletion must preserve existing recipe relationships and cannot remove an image belonging to a record whose deletion failed.

## Implementation map

1. `zod/ai-mutation.schema.ts` defines allowed intents/patches, typed previews and version/ID validation. Unknown fields and unsupported entity operations are rejected.
2. `lib/ai/inventory-assistant.ts` plans the new operations with null for unspecified patch fields. It does not execute writes.
3. `lib/domain/ai-mutations.service.ts` resolves targets, reads current values, merges patches, calculates stock and prepares previews. It dispatches confirmed previews to the shared write service.
4. `lib/domain/inventory-write.service.ts` implements validated ingredient/stuff creation, editing and deletion, uniqueness errors, atomic version checks and deletion restrictions. Existing manual actions reuse this service; stock inputs must now be whole numbers in manual forms as well.
5. `lib/actions/ai.actions.ts` independently checks admin access and validates preparation/confirmation input on the server. Browser payloads are never trusted based on TypeScript types alone.
6. `InventoryMutationView.tsx` shows editable stuff creation, before/after changes and explicit deletion confirmation. `AiAssistant.tsx` manages pending target selection, previews and refreshes.

## Test before deploying

```bash
npm run test:ai
npx tsc --noEmit
npm run build
```

Automated checks use mocked API/auth/database/storage boundaries; they do not modify live data or test live model interpretation. They cover search regressions, CRUD previews/confirmation, field preservation, stock set/adjust rules, stale/repeated writes, ambiguous targets, protected deletes, cleanup failures and manual action validation.

In the browser, use clearly named test records:

1. Create a test ingredient and stuff record, confirm, and verify their actual pages.
2. Change ingredient availability, saved status, name and description. Confirm that unrelated fields are preserved.
3. Set stuff stock to 10, add 5, subtract 3 and set to zero. Check each preview and saved total.
4. Cancel a proposal and verify nothing changes.
5. Generate a stock preview, change the record manually in another tab, then confirm the stale preview: it must fail.
6. Try deleting an ingredient used in a recipe: it must fail. Delete the unreferenced test records through explicit confirmation.
7. Verify search, record details and existing manual ingredient/stuff forms still work.

Use the same smoke test after deployment with your existing production API environment variables. No recipe or order AI writes are included in this step.
