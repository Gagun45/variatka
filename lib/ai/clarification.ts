import { MAX_CLARIFICATION_TURNS, type AssistantRequest, type Clarification, type RecordSelection } from "@/zod/ai-search.schema";
import { AppError } from "../error";

export function sameSelection(a: RecordSelection | null | undefined, b: RecordSelection | null | undefined) {
  return a?.entity === b?.entity && a?.id === b?.id;
}

export function validateClarificationSelection(request: AssistantRequest, missingBoundSelection: RecordSelection | null = null) {
  const context = request.clarification;
  if (!context) return;
  // Automatic expiry clearing is allowed only after the server verified absence.
  if (!request.selected && missingBoundSelection && sameSelection(context.selected, missingBoundSelection)) return;
  if (!sameSelection(context.selected, request.selected)) {
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
    selected: previous ? previous.selected : request.selected,
    previousSearch: previous ? previous.previousSearch : request.previousSearch,
  };
}
