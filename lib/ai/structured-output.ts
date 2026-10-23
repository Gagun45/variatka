import z from "zod";
import { AppError } from "../error";

const responseSchema = z.object({
  status: z.string(),
  output: z.array(z.object({
    type: z.string(),
    content: z.array(z.object({
      type: z.string(),
      text: z.string().optional(),
    })).optional(),
  })),
});

export async function requestStructuredOutput<T>(options: {
  name: string;
  schema: z.ZodType<T>;
  instructions: string;
  input: string;
}): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new AppError("AI ще не налаштовано: додайте OPENAI_API_KEY на сервері.", "PROVIDER_CONFIGURATION");

  const model = process.env.OPENAI_MODEL || "gpt-6-luna";
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
      body: JSON.stringify({
        model,
        ...(model === "gpt-6-luna" ? { reasoning: { effort: "none" } } : {}),
        store: false,
        instructions: options.instructions,
        input: options.input,
        max_output_tokens: 9000,
        text: { format: {
          type: "json_schema",
          name: options.name,
          strict: true,
          schema: z.toJSONSchema(options.schema, { override: ({ jsonSchema }) => { delete jsonSchema.default; } }),
        } },
      }),
    });
  } catch {
    throw new AppError("Не вдалося з’єднатися з AI. Спробуйте ще раз.", "PROVIDER_UNAVAILABLE");
  }

  if (!response.ok) {
    // Never expose provider response bodies or credentials to the browser/logs.
    if (response.status === 429) throw new AppError("Ліміт AI вичерпано. Перевірте баланс або спробуйте пізніше.", "PROVIDER_LIMIT");
    if (response.status >= 500 || response.status === 408) throw new AppError("AI тимчасово недоступний. Спробуйте пізніше.", "PROVIDER_UNAVAILABLE");
    throw new AppError("Помилка AI. Перевірте API-ключ, модель і налаштування OpenAI.", "PROVIDER_CONFIGURATION");
  }

  try {
    const result = responseSchema.parse(await response.json());
    if (result.status !== "completed") throw new Error("Incomplete response");
    const content = result.output.filter((item) => item.type === "message")
      .flatMap((item) => item.content ?? []);
    if (content.some((item) => item.type === "refusal")) throw new Error("Refusal");
    const text = content.filter((item) => item.type === "output_text")
      .map((item) => item.text ?? "").join("");
    return options.schema.parse(JSON.parse(text));
  } catch {
    throw new AppError("AI не повернув коректну пропозицію. Уточніть запит і спробуйте ще раз.", "PROVIDER_INVALID_RESPONSE");
  }
}
