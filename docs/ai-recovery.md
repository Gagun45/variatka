# Request states and recovery

The assistant shows real request phases: analysis/preparation (one server call), preparing a chosen target, loading, saving and refreshing saved data. It does not simulate progress with timers. Controls remain disabled during each request, and a synchronous pending guard prevents duplicate submissions.

## Recovery actions

Requests that already match stored values are normal results, not failures: **Змін не потрібно**. They show no error recovery controls, do not write data, and are not logged as errors.

- Invalid values or conflicting records: retain the proposal, its edited fields and assumptions. Single ingredient/material creation remains editable; **Перевірити пропозицію** prepares the edited values on the server before a fresh confirmation is offered. Other previews use **Підготувати новий перегляд**. **Редагувати запит** restores the source prompt and selection/search/clarification context without erasing the retained draft.
- Provider failures: retain both the submitted prompt and any previous draft or record choice, including its original request and resolution decisions. Replace the previous proposal only after a successful response. Error codes distinguish temporary availability, limits, configuration and invalid responses. No automatic provider retries are performed.
- Stale preview: retain the old values for reference and disable their confirmation. **Підготувати новий перегляд** reuses the structured operation and resolved targets against current data when available, preserving stock set/adjust intent. It falls back to planning the source request when needed and always requires fresh confirmation. **Редагувати запит** is also available.
- Unknown save outcome (lost connection or unclassified server error): retain a read-only reference, remove confirmation/preparation controls and show links to the inventory pages for inspection. Do not retry a write blindly. This is conservative recovery, not durable idempotency; that remains a separate implementation batch. **Прибрати пропозицію** only removes the displayed reference; it does not cancel a possibly committed write.
- Refresh failure after successful saving: retain saved-record notices and links. **Оновити дані** only invalidates queries and reads records/search results. It cannot repeat creation, deletion or stock adjustments. Both thrown errors and resolved `{ok:false}` read failures are reported.

Errors carry an optional structured code in the shared action envelope, preserving existing `ok`/`message` consumers. Known application errors default to validation; unexpected errors use INTERNAL_ERROR. Confirmation treats missing/unknown internal codes as uncertain. Provider bodies and credentials are not exposed to the client.

Request/context recovery is held in the mounted page, not persisted across reloads. **Новий чат** clears it.

[Active tasks](ai-active-task.md) also retain text corrections and their scoped clarification questions. A revision that cannot be prepared disables the old confirmation and keeps the corrected structured operation for another preparation attempt when valid. Uncertain save references are never sent as active revision context. Selected-record identity is retained separately for refresh retries.

## Manual checks

1. Submit a request that causes a validation error, e.g. stock below zero. Verify the prompt is back in the input and Редагувати запит focuses it.
2. Select a material, ask to increase its stock, then change it in a second tab before confirming. The old preview should remain read-only with a stale error and no confirmation button. Prepare a new preview; its stock calculation must use the updated value and require confirmation.
3. Repeat with a clarification answer (e.g. answer `15` to a quantity question). Recovering/editing must retain the original clarification and selected record rather than interpreting `15` independently.
4. In development, temporarily use an invalid provider key or block the planning request with browser devtools. The prompt should survive and controls become usable again. Restore configuration afterward.
5. Prepare a preview, then simulate a lost confirmation response with devtools. Verify the uncertain-outcome message, record inspection links and absence of the old confirmation button. Inspect the database before issuing another change.
6. Simulate a failed record/search refresh after a successful save. Saved notices must remain visible; Оновити дані retries reads only. In particular, stock must not increase twice.
7. Use Новий чат after any error and verify messages, previews, error and recovery context clear.
8. Prepare a material creation, edit the title, description, category and stock, then block a new planning request. Verify every edited value remains and the failed request returns to the input. Unblock it and successfully search: the previous draft should now be replaced.
9. Edit a material creation title to an existing title, confirm, and verify the conflict retains the editable form. Correct the title and use Перевірити пропозицію: no record should be saved until the newly prepared proposal is explicitly confirmed.
10. After an uncertain save, fail a separate planning request. The retained proposal must still be read-only and expose no confirmation or preparation action.

Automated tests cover error codes, recovery policies, component event flows for retained drafts and candidate choices, edited-value revalidation, stale/uncertain confirmation guards, preview markup and read-only refresh retries, alongside existing CRUD/transaction regressions. The component tests use mocked React hooks and actions; browser/network timing and visual states require the manual checks above.
