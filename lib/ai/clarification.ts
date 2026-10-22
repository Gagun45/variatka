import { MAX_CLARIFICATION_TURNS, type AssistantRequest, type Clarification } from "@/zod/ai-search.schema";
import { AppError } from "../error";

export function validateClarificationSelection(request: AssistantRequest) {
  const context = request.clarification;
  if (!context) return;
  if (context.selected?.entity !== request.selected?.entity || context.selected?.id !== request.selected?.id) {
    throw new AppError("Вибір запису змінився. Скасуйте уточнення та надішліть новий запит.");
  }
}

export function prepareClarification(request: AssistantRequest, question: string, continuesPrevious: boolean): Clarification {
  const previous = continuesPrevious ? request.clarification : null;
  if (continuesPrevious && !previous) throw new AppError("Немає попереднього уточнення. Надішліть повний запит.");
  if (previous && previous.turns.length >= MAX_CLARIFICATION_TURNS) {
    throw new AppError("Досягнуто ліміт уточнень. Скасуйте уточнення та надішліть повний запит з усіма деталями.");
  }
  return {
    originalPrompt: previous?.originalPrompt ?? request.prompt,
    turns: previous ? [...previous.turns, { question: previous.question, answer: request.prompt }] : [],
    question,
    selected: previous?.selected ?? request.selected,
    previousSearch: previous ? previous.previousSearch : request.previousSearch,
  };
}
