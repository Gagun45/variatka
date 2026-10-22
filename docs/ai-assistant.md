# AI ingredient assistant: setup and implementation guide

The assistant lives at `/admin/ai` (also linked as **AI-помічник** in admin navigation). For ingredient creation, write a Ukrainian request, review/edit the proposed ingredient, then click **Підтвердити створення**. No packages or database migrations are needed. The assistant also supports [search and record selection](ai-search.md) and [complete ingredient/stuff CRUD](ai-crud.md).

## 1. Create an OpenAI API key

Open the [OpenAI developer platform](https://platform.openai.com/), create/select a project, configure API billing, and create a key in the project's API keys settings. API usage is billed separately from a ChatGPT subscription. Set a small project budget notification while experimenting.

Why: the website needs its own server credential to request drafts. You do not need to paste the key into this chat.

## 2. Configure the server

Add these entries to your existing local `.env` file:

```dotenv
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-6-luna
```

Use the same environment variables in your hosting provider when deploying, then restart/redeploy the app. Keep the key out of source control and never prefix it with `NEXT_PUBLIC_`.

Why: only the server calls OpenAI. The browser receives a validated draft, never the API key. `gpt-6-luna` supports Structured Outputs and suits this small extraction task. Luna uses `reasoning.effort: "none"` here because this is a focused extraction task. The model is configurable without code changes; replacements must support the Responses API and strict JSON Schema output.

## 3. Start the existing app

```bash
npm run dev
```

Sign in with your existing **ADMIN** account and visit `/admin/ai`. The existing admin layout protects the page, and each server action independently checks your role. A normal signed-in user cannot use the AI action or save an ingredient.

Why: hiding the page alone does not protect server operations.

## 4. Try a complete request

```text
Створи інгредієнт: чорний перець, категорія спеції, є в наявності.
Опис: мелений чорний перець.
```

The page shows a proposal with title, description, category, stock status, and saved status. Adjust fields if needed and click **Підтвердити створення**. A success message links to the saved ingredient. The ingredient query cache is invalidated so lists refresh.

Why: AI interprets the request; your existing application code performs the write only after confirmation. The model never receives database access.

## 5. Try missing information

```text
Додай інгредієнт куркума.
```

The assistant is instructed to propose `SPICES`, an empty description, and `isInStock=false` / `isSaved=false`, and explain every inferred/defaulted field in Ukrainian. Other ingredients use `OTHER`. Review these suggestions: schema validation enforces field types, but the model can still misunderstand meaning.

For a revised creation proposal, send the full request again or edit the preview directly. Search follow-ups can use the last search and explicitly selected record. When the assistant asks a clarification question, short replies continue that pending request; see [clarification examples](ai-crud.md#clarification-questions). Visible messages and context are local to this page and disappear on reload. A new prompt replaces the pending creation preview.

Why: transient context avoids conversation persistence and keeps this version easy to move into a floating panel later.

## 6. Check confirmation and error behavior

- Generate a preview, then cancel or reload. No ingredient should be created.
- Confirm one preview. It should create one ingredient and remove the confirmation form.
- Try the exact same title again. The existing duplicate-title check should reject it; the preview remains editable. Title uniqueness follows the existing database behavior (case-sensitive).
- Try `Зміни ціну яловичини на 200 грн`. The assistant should explain that price fields are unavailable.
- Try asking for several ingredients. The assistant should ask for one at a time.
- Try an unclear request. The assistant should request clarification rather than invent a name.
- Without the key, the page should report missing configuration. Provider failures, quota errors, malformed responses, refusals, and incomplete responses cannot create ingredients.
- Check `/admin/ai` as a non-admin and signed out: the existing layout redirects away. Both underlying actions also reject unauthorized callers.

Why: these checks cover the boundary between a proposal and an actual database write. Network failures during saving should be checked against the ingredient list before retrying.

## 7. Understand the code

1. `zod/ai.schema.ts` defines prompt limits. `zod/ai-search.schema.ts` defines a typed command and bounded clarification context; `zod/ai-mutation.schema.ts` defines creation/update/delete intents and previews for both ingredients and stuff.
2. `lib/ai/structured-output.ts` sends requests to OpenAI using built-in `fetch`. Zod generates the strict JSON Schema and validates the response locally. The request has a 30-second timeout, an output limit, and `store: false` (this disables response storage, not all provider retention policies). Only selected-record identity, previous search filters and bounded clarification context accompany the prompt; there is no inventory dump or full chat history.
3. `lib/actions/ai.actions.ts` authenticates the admin and routes the validated command to a search, detail read, clarification or mutation preview. Ingredient creation uses the same path as stuff creation; the old ingredient-only planner has been removed.
4. `InventoryMutationView.tsx` displays the common confirmation UI. Creation fields remain editable. Every write, including ingredient creation, calls `confirmInventoryMutation` and shares the same success, cache invalidation and search-refresh handling.
5. `lib/domain/inventory-write.service.ts` validates and performs confirmed writes. Manual ingredient/stuff actions reuse this service. `lib/ai/mutation-definitions.ts` explicitly maps operation kinds to entities/actions; exhaustive command switches prevent silently routing future operations to the wrong entity.

No autonomous agent loop, streaming, tool SDK, or separate REST API is required for this initial operation. These are drafts of operations, not provider function calls.

## 8. Add another operation later

For each new operation:

1. Define its allowed input and draft schema. As operations diverge, extend the typed `command` / mutation `kind` unions and explicit operation definitions.
2. Update the AI instructions and output contract to describe precisely what is supported.
3. Extend the common preview UI and confirmation dispatcher that calls an admin-only server action with server-side validation.
4. For updates/deletes, resolve a real database ID on the server and preview the target and proposed changes. Do not trust an AI-invented ID.
5. Add checks for unsupported requests, wrong targets, validation failures, authorization, and duplicate submissions.

The price example requires a database price field and defined units first: this application's Ingredient model currently has neither.

For personal use this version has no distributed rate limiter or persistent chat history. The UI allows one request at a time per mounted page, but this is not a server quota. Add server-side rate limits before expanding access to many admins. Database title uniqueness protects against identical duplicate ingredients, including concurrent writes; duplicate-title database errors return a clear application error.

Official references: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [API keys](https://platform.openai.com/api-keys).
