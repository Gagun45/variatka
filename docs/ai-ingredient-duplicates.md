# Review similar ingredients before creation

Explicit AI ingredient creation now searches existing ingredient titles across
all categories before preparing a creation preview. It uses the tolerant name
matcher introduced in [name matching](ai-name-matching.md): exact/partial names,
word order, normalization and small spelling differences. It is not semantic
ingredient equivalence, and suggestions are not automatic substitutions.

With `Куркума` or `Чорний перець мелений` already stored, try:

- `Створи інгредієнт «Куркумма», категорія спеції.`
- `Створи інгредієнт «Перець чорний мелений», категорія спеції.`

The assistant shows matching candidates instead of immediately offering a new
record. Candidates are paginated, including matches beyond the first lookup
page, and selection does not require another model call.

## Choose existing or create separately

**Використати наявний** reuses the selected record without changing its title,
description, category, availability or saved status. A single creation request
then displays the existing record. In a batch, only the redundant creation is
skipped: other operations remain, and recipes referencing that proposed
ingredient use the chosen existing record. Explicit creations are resolved
before recipe dependencies, regardless of operation order.

**Це інший інгредієнт — створити окремий** records an explicit decision to keep
the supplied name and fields. It prepares a normal preview; a separate
confirmation button is still required to save. The decision survives later
choices in the same request. If an exact case-insensitive title already exists,
the separate-creation option is unavailable; cancel and use another title.

A genuinely unmatched ingredient proceeds directly to the existing editable
creation preview. Existing recipe ingredient matching remains in place.

## Revalidation

Choices are bound to the proposed title and revalidated on continuation.
Deleted/renamed choices are rejected. Newly appeared near matches require a
fresh review rather than inheriting a previous distinct-creation decision.

Before confirming a batch, the transaction checks ingredient creations again,
including implicit recipe dependencies. An edited title or a newly appeared
match without a corresponding review rejects the entire save. No earlier
operation is committed. Send a new request with the edited title to review the
candidates and choose again. Exact-title database uniqueness remains in force.

This check covers existing database records; it does not infer synonyms or
merge differently named ingredients automatically. Similar-title review is an
assistant workflow, not a database uniqueness constraint on approximate names.
Manual creation forms are unchanged.
