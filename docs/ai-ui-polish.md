# Assistant UI polish

Implemented separately after checkpoint 3B, at the user's request. Step 4's full instruction rewrite remains pending. This change focuses the page on the current request, question, preview and next action; backend planning, target resolution and confirmation rules are unchanged.

## Main flow

- The latest request is a compact expandable row. Full chat history and supporting search context stay in a closed history section. Generic server replies no longer repeat information already shown by result/preview cards.
- Button reminders, unsupported-operation explanations and selected-record responses remain visible when relevant. Cancelling a task removes its obsolete confirmation reminder.
- Previous search results collapse while a record or task is active. Current search filters remain inspectable as chips; result counts describe loaded records rather than promising a total.
- Selected records show a compact title and clear-selection control. Their stored fields/composition are expandable, and an explicit details request opens them automatically. Preparing a write compacts incidental details again.
- Clarification questions remain open above the work area. Their preceding preview folds into a reference disclosure, with confirmation/re-preparation disabled and preview auto-focus suppressed until the question is resolved.
- The composer contains a small target/status summary. New chat moves to the page header. The empty page starts directly with the composer; the welcome card and starter examples have been removed.

## Less visual noise

Cards share the app's semantic surfaces, restrained accents and consistent spacing. The assistant overrides inherited page spacing to avoid doubled gaps. A single-record preview no longer needs a second surrounding card. Batch summaries show action counts; repeated entity counts and internal IDs are removed from the main flow. IDs remain visible when otherwise identical candidates need distinguishing.

Initial assumption explanations start collapsed; actual proposed field values remain visible. Full snapshots and original prompts remain available on demand. Creation fields use a responsive grid, and search results use simple divided rows. Success notices show three records with the rest expandable. A retained stale preview owns its primary re-preparation button, avoiding a duplicate button in the error panel.

Deletion warnings, actual blockers, unknown-save explanations and inspection links remain visible. No uncertain save gains a confirmation/retry action. Revisions still require a fresh preview confirmation.

## Validation

`npm run test:ai`: 104 AI tests and 39 component recovery/task tests. `npm run test:ai:integration`: 59 embedded PostgreSQL tests. **202 tests pass**, plus TypeScript, lint for changed code/tests, app stylesheet compilation and whitespace checks.

Markup checks cover collapsed explanations, explicit record expansion, distinguishable candidates, read-only recovery controls and confirmation visibility. Component checks cover current-action visibility, retained hidden context, clarification precedence and stale-reminder removal. Existing recovery and deletion protections still pass.

No browser is installed in this workspace. Actual layout, keyboard focus, native disclosure behavior and accessibility interactions still need a browser check; live-model interpretation remains unverified. Check the page at narrow/mobile and desktop widths in light/dark themes, especially long titles, open history, explicit recipe details, a clarification over a long preview, deletion warnings and uncertain-save inspection links.
