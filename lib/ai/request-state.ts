import type { ActionErrorCode } from "../action-error";

export const requestPhaseLabels = {
  idle: "", planning: "Аналізую запит і готую результат…", preparing: "Готую перегляд…",
  loading: "Завантажую дані…", saving: "Зберігаю зміни…", refreshing: "Зміни збережено. Оновлюю дані…",
};
export type RequestPhase = keyof typeof requestPhaseLabels;
export type AssistantErrorCode = ActionErrorCode | "SAVE_UNCERTAIN" | "REFRESH_FAILED";

export function confirmationFailure(code?: ActionErrorCode): AssistantErrorCode {
  // Unknown failures may have occurred after commit. Never offer a blind write retry.
  return !code || code === "INTERNAL_ERROR" ? "SAVE_UNCERTAIN" : code;
}
export function recoveryFor(code: AssistantErrorCode) {
  if (code === "SAVE_UNCERTAIN") return { hint: "Результат збереження невідомий. Перевірте записи перед новою зміною. Повторне підтвердження вимкнено.", action: "inspect" as const };
  if (code === "REFRESH_FAILED") return { hint: "Зміни вже збережено. Оновіть лише дані; повторювати збереження не потрібно.", action: "refresh" as const };
  if (code === "STALE_PREVIEW") return { hint: "Старий перегляд скасовано. Підготуйте новий за актуальними даними й перевірте значення ще раз.", action: "prepare" as const };
  if (code === "CONFLICT") return { hint: "Перевірте назви та зв’язки записів і змініть запит.", action: "edit" as const };
  if (code === "PROVIDER_CONFIGURATION") return { hint: "Перевірте налаштування AI на сервері. Ваш запит збережено для редагування.", action: "edit" as const };
  if (code === "PROVIDER_LIMIT") return { hint: "Перевірте баланс або повторіть запит пізніше. Нічого не збережено.", action: "edit" as const };
  if (code === "UNAUTHORIZED") return { hint: "Увійдіть з обліковим записом адміністратора.", action: "none" as const };
  return { hint: "Відредагуйте запит і надішліть його ще раз. Автоматичного повтору немає.", action: "edit" as const };
}
