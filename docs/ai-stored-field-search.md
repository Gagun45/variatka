# Search stored fields and relationships

AI search can now use existing database columns and relationships without a
migration. All requested conditions combine with AND and remain visible in the
search chips. Admin authentication and confirmation requirements are unchanged.

## Prompts to try

| Prompt | Filter |
| --- | --- |
| Покажи рецепти без фото | recipe `hasImage=false` |
| Знайди рецепти, де в нотатках є «менше оцту» | recipe `notesText="менше оцту"` |
| Покажи рецепти з приміткою до підтвердження «перевірити сіль» | recipe `confirmationNotesText="перевірити сіль"` |
| Знайди інгредієнти з описом «для риби» | ingredient `descriptionText="для риби"` |
| Які інгредієнти ніде не використовуються? | ingredient `usedInRecipes=false` |
| Покажи рецепти з порожнім описом | recipe `hasDescription=false` |
| Покажи рецепти без варіантів | recipe `hasVariants=false` |
| Покажи рецепти без складу | recipe `hasIngredients=false` |
| Покажи рецепти без нотаток | recipe `hasNotes=false` |
| Покажи матеріали, додані сьогодні | stuff calendar creation range |
| Покажи рецепти, змінені цього тижня | recipe calendar update range |
| Покажи рецепти з варіантом «250 г» у наявності | same variant label + positive stock |
| Покажи рецепти, де залишок варіанта «250 г» менше 5 | same variant label + stock maximum 4 |
| Покажи все без опису | cross-entity `hasDescription=false` |

Use a phrase actually stored in the requested field when testing text searches.
A notes-only request cannot match that phrase solely in a title or description.

## Text and missing content

Generic `text` keeps tolerant title/description matching and now includes recipe
notes and confirmation notes. Ranking prefers title, then description, then
notes, then confirmation notes. Field-specific `titleText`, `descriptionText`,
`notesText` and `confirmationNotesText` use literal case-insensitive substrings,
preserving phrases and escaping SQL LIKE wildcards. The assistant must not put
the same scoped phrase into generic text as well.

`hasDescription` is supported for all entities. Ingredients and recipes support
`hasImage`; stuff has no image column. Recipes also support `hasNotes`,
`hasConfirmationNotes`, `hasIngredients` and `hasVariants`. Missing text means null or an empty
string; whitespace-only stored text is not treated as empty. Missing image
means null/empty imageKey, regardless of the default poster displayed by the UI.

Ingredient `usedInRecipes` checks whether any recipe references it, regardless
of that recipe's visibility or confirmation status. It does not remove or
modify those relationships.

## Dates

`createdFrom` / `updatedFrom` are inclusive YYYY-MM-DD calendar dates.
`createdBefore` / `updatedBefore` are exclusive dates. The server converts
boundaries at midnight in Europe/Kyiv, including daylight saving changes, then
compares the stored timestamps. Inclusive requested end dates become the next
calendar date; for example 23 October 2026 uses from `2026-10-23` and before
`2026-10-24`.

The model receives the current Kyiv date and server-computed ranges for today,
yesterday, this/last week (Monday start) and this/last month. It must ask about
ambiguous dates instead of inventing a year. Reversed/empty date ranges are
rejected before database reads. Detail views show creation/update times in Kyiv.

## Variants

`variantLabel`, `variantInStock`, `variantStockMin`, and `variantStockMax` all
apply to the same variant in a recipe. Variant labels are literal substrings.
Stock bounds are inclusive integers. A zero-stock matching variant differs
from having no matching variant. Recipe-level `isInStock` continues to mean
positive stock in any variant. This adds reads only, not variant or stock writes.

## Follow-ups and filter-based writes

New fields survive prior-search and clarification context. Common text,
description-presence and date filters can also apply across all three entities.
Type-specific conditions must not be silently dropped to perform an all-entity
search. Unknown fields and invalid dates/quantities are rejected.

Filter-based writes reuse these predicates, retain the 20-operation cap, and
freeze concrete records into the preview. Later matching records are not added
at confirmation. No search request writes data. Existing name matching and
duplicate ingredient review remain active.

New nullable fields default to null for older request payloads; the provider's
strict output schema still requires them explicitly and omits default metadata.
