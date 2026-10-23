# Natural filter combinations

Search now supports category lists, ingredient alternatives and one level of
bounded logical groups. Existing requests keep their old meaning; omitted new
arrays default to empty. No database migration is needed.

## Prompts to try

| Prompt | Meaning |
| --- | --- |
| Покажи соуси й варення | Either SAUCES or JAMS category |
| Покажи рецепти з часником або цибулею | At least one, including recipes containing both |
| Покажи рецепти з часником і цибулею | Both ingredients are required |
| Покажи соуси й варення з часником або цибулею, але без солі | Category alternatives AND ingredient alternatives AND no salt |
| Покажи рецепти, крім збережених соусів | Exclude only recipes that are BOTH saved AND sauces |
| Покажи все, крім збережених соусів | Same recipe exclusion; ingredients and materials remain eligible |
| Покажи приховані або непідтверджені соуси | Sauce category AND (hidden OR unconfirmed) |
| Покажи рецепти з часником і томатами або з цибулею і гірчицею | Either complete ingredient pair |
| Покажи соуси або слоїчки | Recipe sauce branch OR material jar branch |

Names still use tolerant stored-title matching. Category words are interpreted
as categories rather than title text. “Or” is inclusive unless the request
explicitly says only one alternative may match.

## Supported predicates

- `category` keeps the existing single-category filter.
- `categories` accepts any listed category; `excludeCategories` rejects listed
  categories. Both are typed for their entity. Combining a single category with
  a list intersects the conditions; the model should normally use one form.
- Recipe `includeIngredients` requires all names, `anyIngredients` requires at
  least one, and `excludeIngredients` rejects every listed name. These three
  filters combine with AND. Each list is bounded to eight names. A nonexistent
  alternative matches nothing; it never removes the other alternatives.
- `anyOf` contains up to four flat typed branches. At least one must match.
- `noneOf` contains up to four flat typed branches. No branch may match.

The full expression is:

`main conditions AND (anyOf[0] OR anyOf[1] ...) AND NOT (noneOf[0] OR noneOf[1] ...)`

An empty anyOf/noneOf list adds no condition. Each branch combines its fields
with AND and explicitly names its entity. Branches cannot contain more groups.
Requests that need deeper/more extensive logic or have ambiguous scope must be
clarified rather than silently simplified.

A typed search accepts branches for its own entity or `all` common fields.
An `all` search can combine branches for different entities. A recipe branch is
false for ingredients/materials, so it cannot broaden or exclude those types
by accident. Invalid cross-type branches and invalid branch ranges are rejected
before database reads. The schema rejects unknown fields and nested groups.

## Consistent matching and review

The server resolves tolerant text and ingredient names inside groups as well as
at the root. Nullable text predicates explicitly account for nulls, so excluding
a phrase does not accidentally remove records with no description/notes.

Complete predicates run before pagination. Main generic text retains relevance
ordering; searches with generic text only inside branches use deterministic
alphabetical ordering. Lookup/result scans use bounded database pages and do
not silently restrict matching to the first result page. Lookup cost still
scales with catalogue size.

Search chips display category names and parenthesized groups in Ukrainian.
Previous searches and clarification retain the complete expression. Filter
batches use the same compiler, keep the 20-operation cap, and freeze the matched
records into the confirmation preview. A later matching record is not added to
that preview. Filter-based writes still require one concrete root entity matching
the change type; mixed-entity search does not add mixed-entity filter writes.
Existing version checks and atomic saves still apply.

## Ingredient families

This is literal/tolerant name matching, not an ingredient ontology or allergen
filter. “Без перцю” matches stored titles containing/matching that name; it does
not silently add paprika, chili or substitute names. Explicit family/synonym
requests need a supplied list of member ingredients or clarification. No
unverified ingredient-family equivalence is introduced by this change.
