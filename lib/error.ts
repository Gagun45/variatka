import type { ActionErrorCode } from "./action-error";

export class AppError extends Error {
  constructor(message: string, public readonly code: ActionErrorCode = "VALIDATION_ERROR") {
    super(message);
    this.name = "AppError";
  }
}

export class NoChangesError extends AppError {}
