import z from "zod";

export const aiPromptSchema = z.string().trim().min(1).max(12000);
