# Clickable name resolution

All AI writes now share one preparation workflow: interpret once → resolve names → review the complete preview → confirm → save atomically. This applies to single records, mixed batches, recipe targets, and recipe ingredients.

When a name matches several records, the assistant shows clickable candidates. Choose one; the rest of the original structured request, its values and creation assumptions remain intact. If another name is ambiguous, the next choice appears. Selection and candidate pagination do not call the model or write to the database.

Matching prefers literal spelling, then case-insensitive exact names, then unique literal title substrings. General description matches are not mutation candidates. Amount changes/removals search only the selected recipe’s composition; recipe additions search the ingredient inventory across categories. Ingredient categories are never required for existing records. Genuinely missing new recipe ingredients remain proposed dependency creates in the final preview.

Previously resolved records remain identified by ID while subsequent names are resolved. Stock values and other fields are read again when building the final preview, so it shows current values. If a chosen record is deleted, renamed or removed from the recipe, resolution fails without silently substituting another record. Prepare a revised request in that case. Version checks and atomic transactions still apply at confirmation.

Candidate lists use pages of 20, independently of the batch cap of 20 writes. Next/back/refresh only reload candidates. A selection is revalidated against its entity, name and recipe scope on the server; invalid IDs, keys and malformed continuation payloads cannot perform writes.

Cancel the entire request or use **Новий чат** to discard pending selection. Sending a new prompt replaces it. Continuations live in the mounted page only; no new database tables, environment variables, packages or agent framework are needed.

The UI uses the same reply handler for initial prompts and resumed selections. Recovery can rebuild a stale preview from the resolved structured request, preserving chosen record IDs instead of sending the prompt to the model again.

## Manual check from an empty database

1. Send and confirm:

   > Створи одним пакетом матеріали «Тест банка 250 мл» і «Тест банка 500 мл», категорія слоїчки, залишок кожного 10. Також створи інгредієнти «Тест часник свіжий» і «Тест часник сушений», категорія спеції, обидва наявні.

2. Send:

   > Одним пакетом збільш залишок матеріалу «Тест банка» на 5 і познач інгредієнт «Тест часник» як відсутній.

   Choose a jar, then garlic. Verify neither record changes yet. The final preview must contain both operations with the selected full names and stock 10 → 15. Confirm and check the selected records only.

3. Create and confirm a recipe:

   > Створи рецепт «Тест приправа», категорія спеції. Склад: «Тест часник свіжий» 3 г і «Тест часник сушений» 2 г.

   Then send:

   > У рецепті «Тест приправа» зміни кількість часнику на 8 г і опис на «Для овочів».

   The choice list must contain only that recipe’s two garlic ingredients. Choose one; the final preview must retain the description change and the other ingredient amount. Cancel and verify nothing changes.

4. Start the mixed request again and cancel after the first selection. Verify no changes. Repeat, choose a candidate deleted in another tab, and verify a clear error; refresh candidates or edit the request.

Automated checks cover multi-step continuation, recipe scope, dependency creation, pagination, stale/tampered selections, authorization, no extra provider calls and no writes before confirmation. Browser focus, layout and cancellation interactions still need the manual checks above.

## Implementation

- `zod/ai-resolution.schema.ts`: bounded continuation and selection validation.
- `lib/domain/ai-resolution.service.ts`: shared exact/partial matching, candidates, scoped decisions and paging.
- `lib/domain/ai-write-workflow.service.ts`: common preparation for initial requests and clicks.
- `RecordChoiceView.tsx`: one candidate-selection UI for all write types.
