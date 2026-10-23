# Ukrainian terminology and request context

The assistant uses a vocabulary built from the same entity, category and series labels as its UI. `lib/ai/inventory-vocabulary.ts` adds aliases and grammatical forms to the planner instructions. It does not rewrite stored titles or translate database values.

- Матеріал/матеріали/матеріалів, тара and generic пакування mean the entire `stuff` entity. They do not add a category filter.
- Слоїчки/банки/баночки identify the JARS category; декор/етикетки/наліпки identify DECOR.
- Складники means ingredients. Category interpretation remains scoped to the entity (спеції can describe ingredients or recipes).
- Залишок means numeric material stock. Ingredient availability remains a boolean.
- Quoted titles are preserved. Missing quantities and ambiguous create-versus-restock requests still require clarification.

The collapsed context section near the input shows the selected record and last search with filters when present. Pending clarification appears separately. Search context is used for explicit refinements, not every new request. The conversation display is not persistent general chat memory.

The [active task](ai-active-task.md) is shown separately near the input. Short corrections revise its current proposed values; explicit independent requests start a new task. Selection remains independent of single/batch preview layout, including recipe previews and candidate choices.

**Новий чат** clears messages, selection, last search/results, clarification, pending target choice, previews, assumptions, notices, errors and the draft input. It focuses the input and does not delete saved records. Reset is disabled while a request is running.

## Manual smoke check

1. `Покажи всі матеріали` and `Покажи список матеріалів` should search stuff without category/text filters.
2. `Покажи залишки слоїчків` should search stuff with JARS.
3. `Покажи матеріали із залишком менше 10` should use stockMax 9, without a category.
4. `Встанови залишок усіх матеріалів на 5` should prepare a filtered stuff batch, never save automatically. Cancel it.
5. `Видали всі матеріали категорії декор` should prepare a DECOR-only deletion batch. Cancel it.
6. `Покажи наявні складники` should search available ingredients.
7. `Додай банки` on a clean context should ask whether to create a material or increase stock.
8. Search/select a record, then verify its name and the search filters in the context panel. Trigger a clarification and verify its question is visible above the input.
9. Use Новий чат with a pending preview/clarification. Verify all context, messages and proposals disappear, input receives focus, and no database data changes. A new request must send no previous selection/search/clarification.
10. Check the input, context section and action buttons on a narrow screen.

`npm run test:ai` checks that the vocabulary reaches the provider request and that context filter labels preserve false/zero values. These mocked tests do not measure live model interpretation. Use the prompts above against your configured model for that check.
