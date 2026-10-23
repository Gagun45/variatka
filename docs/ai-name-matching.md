# Tolerant inventory name matching

Search supports incomplete names, reordered words, common Ukrainian endings,
punctuation/apostrophe variations, unit spacing, and small spelling mistakes.
Stored titles are never rewritten. This is deterministic text matching, not
semantic search or a synonym dictionary.

Try these with the corresponding records present:

- `Знайди інгредієнт перець чорний` finds `Чорний перець мелений`.
- `Познач інгредієнт куркумма як наявний` offers `Куркума` for selection.
  Selecting it prepares a preview; only the confirmation button saves it.
- `Знайди слоїчки 250мл` can find `Слоїчки — 250 мл`; numeric tokens are
  not typo-corrected to another capacity.

## Search

Title matches rank before description matches, and stronger matches rank first.
Category, availability and other structured filters still apply in PostgreSQL.
Recipe ingredient inclusion/exclusion uses the same tolerant title matcher;
inclusion still requires every requested ingredient and exclusion rejects any
matching ingredient. Similar names can produce multiple results; matching does
not infer ingredient equivalence or allergens.

The lookup scans compact fields in database pages of 250, then retrieves only
one result page. It does not truncate the candidate pool to the first 250 rows.
No inventory data is sent to the model. This avoids a migration or extension,
but lookup cost grows with catalogue size; a large catalogue should eventually
use an indexed database retrieval implementation with the same matching rules.

## Writes and recipe composition

Literal exact spelling has priority, then case-insensitive exact matches, then
literal partial titles. A unique literal match keeps the existing preview flow.
Only when literal lookup fails are normalized/word/typo candidates offered.
Even a single tolerant candidate requires explicit selection before preview.

The same choice mechanism applies to adding recipe ingredients and editing
composition. Possible existing ingredients are offered before proposing a
missing ingredient creation. Removal/amount changes remain scoped to that
recipe's ingredients. Choices are revalidated when resumed, and renamed or
deleted choices cannot be reused. Existing confirmation, version and transaction
checks remain in place.

Approximation requires all query tokens to match separate title words. Short
words and numbers are not typo-corrected; longer words allow one edit, or two
when both words have at least eight characters. Common suffixes and word
prefixes provide conservative grammatical matching, not full morphology.
