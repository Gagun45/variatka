"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { proposeIngredient } from "@/lib/actions/ai.actions";
import { createIngredient } from "@/lib/actions/ingredient.actions";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { frontendUrls } from "@/lib/urls";
import type { IngredientDraft } from "@/zod/ai.schema";
import type { IIngredientFormValues } from "@/zod/ingredient.schema";

type Message = { role: "user" | "assistant"; text: string };

export default function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<IngredientDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ id: number; title: string } | null>(null);
  const pending = useRef(false);
  const queryClient = useQueryClient();

  function editIngredient(patch: Partial<IIngredientFormValues>) {
    setDraft((old) => old?.ingredient
      ? { ...old, ingredient: { ...old.ingredient, ...patch } } : old);
  }

  async function propose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !prompt.trim()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setDraft(null);
    setCreated(null);
    const request = prompt.trim();
    setMessages((old) => [...old, { role: "user", text: request }]);
    setPrompt("");
    try {
      const result = await proposeIngredient(request);
      if (!result.ok) { setError(result.message); return; }
      setMessages((old) => [...old, { role: "assistant", text: result.data.message }]);
      setDraft(result.data);
    } catch {
      setError("Не вдалося отримати відповідь. Спробуйте ще раз.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || draft?.operation !== "createIngredient" || !draft.ingredient) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await createIngredient(draft.ingredient);
      if (!result.ok) { setError(result.message); return; }
      setCreated({ id: result.data.id, title: result.data.title });
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    } catch {
      setError("Не вдалося підтвердити створення. Перевірте список інгредієнтів перед повторною спробою.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8" lang="uk">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">AI-помічник</h1>
        <p className="text-muted-foreground">Опишіть новий інгредієнт українською. Перевірте пропозицію та підтвердьте створення.</p>
        <p className="text-sm text-muted-foreground">Поки що підтримується лише створення одного інгредієнта за запит. Кожен запит незалежний — вказуйте всі деталі заново.</p>
      </header>

      <div role="log" aria-label="Повідомлення" aria-live="polite" className="space-y-3">
        {messages.map((message, index) => (
          <div key={index} className={`whitespace-pre-wrap break-words rounded-xl p-4 ${message.role === "user" ? "ml-6 bg-primary text-primary-foreground" : "mr-6 bg-muted"}`}>
            <p className="mb-1 text-xs font-semibold">{message.role === "user" ? "Ви" : "Помічник"}</p>
            {message.text}
          </div>
        ))}
      </div>

      {draft?.operation === "createIngredient" && draft.ingredient && (
        <form onSubmit={confirm} className="space-y-4 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Попередній перегляд</h2>
          <p className="text-sm text-muted-foreground">Ще нічого не збережено. Можна змінити будь-яке поле нижче.</p>
          {draft.assumptions.length > 0 && <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Запропоновані значення:</p>
            <ul className="list-disc pl-5">{draft.assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul>
          </div>}
          <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
            <label className="block space-y-1"><span>Назва</span>
              <Input required maxLength={200} value={draft.ingredient.title} onChange={(e) => editIngredient({ title: e.target.value })} />
            </label>
            <label className="block space-y-1"><span>Опис</span>
              <Textarea maxLength={2000} value={draft.ingredient.description} onChange={(e) => editIngredient({ description: e.target.value })} />
            </label>
            <label className="block space-y-1"><span>Категорія</span>
              <select className="block w-full rounded-md border bg-background p-2" value={draft.ingredient.category} onChange={(e) => editIngredient({ category: e.target.value as IIngredientFormValues["category"] })}>
                <option value="SPICES">Спеції</option><option value="OTHER">Інше</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft.ingredient.isInStock} onChange={(e) => editIngredient({ isInStock: e.target.checked })} />У наявності
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!draft.ingredient.title.trim()}>Підтвердити створення</Button>
              <Button type="button" variant="outline" onClick={() => { setDraft(null); setError(""); }}>Скасувати</Button>
            </div>
          </fieldset>
        </form>
      )}

      {created && <p role="status" className="rounded-xl border p-4">Створено: <Link className="underline" href={frontendUrls.ingredients.view(created.id)}>{created.title}</Link></p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {busy && <p role="status" className="text-muted-foreground">Обробка…</p>}

      <form onSubmit={propose} className="space-y-3">
        <label htmlFor="ai-prompt" className="font-medium">Ваш запит</label>
        <Textarea id="ai-prompt" required maxLength={2000} disabled={busy} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Створи інгредієнт: чорний перець, спеції, є в наявності." />
        <Button type="submit" disabled={busy || !prompt.trim()}>Отримати пропозицію</Button>
      </form>
    </main>
  );
}
