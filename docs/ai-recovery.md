# Request states and recovery

The assistant shows real request phases: analysis/preparation (one server call), preparing a chosen target, loading, saving and refreshing saved data. It does not simulate progress with timers. Controls remain disabled during each request, and a synchronous pending guard prevents duplicate submissions.

## Recovery actions

Requests that already match stored values are normal results, not failures: **Змін не потрібно**. They show no error recovery controls, do not write data, and are not logged as errors.

- Invalid values or conflicting records: **Редагувати запит** restores the last prompt and its selection/search/clarification context. Failed planning also restores the prompt directly to the input.
- Provider failures: the prompt is retained. Error codes distinguish temporary availability, limits, configuration and invalid responses. No automatic provider retries are performed.
- Stale preview: discard the old preview; **Підготувати новий перегляд** reruns the original request against current data. This may call the model again and always requires a new confirmation. **Редагувати запит** is also available.
- Unknown save outcome (lost connection or unclassified server error): remove confirmation controls and show links to the inventory pages for inspection. Do not retry a write blindly. This is conservative recovery, not durable idempotency; that remains a separate implementation batch.
- Refresh failure after successful saving: retain saved-record notices and links. **Оновити дані** only invalidates queries and reads records/search results. It cannot repeat creation, deletion or stock adjustments. Both thrown errors and resolved `{ok:false}` read failures are reported.

Errors carry an optional structured code in the shared action envelope, preserving existing `ok`/`message` consumers. Known application errors default to validation; unexpected errors use INTERNAL_ERROR. Confirmation treats missing/unknown internal codes as uncertain. Provider bodies and credentials are not exposed to the client.

Request/context recovery is held in the mounted page, not persisted across reloads. **Новий чат** clears it.

## Manual checks

1. Submit a request that causes a validation error, e.g. stock below zero. Verify the prompt is back in the input and Редагувати запит focuses it.
2. Select a material, ask to increase its stock, then change it in a second tab before confirming. The old preview should disappear with a stale error. Prepare a new preview; its stock calculation must use the updated value and require confirmation.
3. Repeat with a clarification answer (e.g. answer `15` to a quantity question). Recovering/editing must retain the original clarification and selected record rather than interpreting `15` independently.
4. In development, temporarily use an invalid provider key or block the planning request with browser devtools. The prompt should survive and controls become usable again. Restore configuration afterward.
5. Prepare a preview, then simulate a lost confirmation response with devtools. Verify the uncertain-outcome message, record inspection links and absence of the old confirmation button. Inspect the database before issuing another change.
6. Simulate a failed record/search refresh after a successful save. Saved notices must remain visible; Оновити дані retries reads only. In particular, stock must not increase twice.
7. Use Новий чат after any error and verify messages, previews, error and recovery context clear.

Automated tests cover error codes, recovery policies, read-only refresh retries and existing CRUD/transaction regressions. Browser/network timing and visual states require the manual checks above.
