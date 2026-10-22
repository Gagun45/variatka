import z from "zod";

const title = z.string().trim().min(1).max(200);
const text = z.string().max(10000);
export const recipeWriteSchema = z.strictObject({
  title: z.string().min(1).max(200).regex(/\S/), description: text, notes: text, confirmationNotes: text.nullable(),
  category: z.enum(["SPICES", "SAUCES", "JAMS", "SEASONEDSALT"]),
  series: z.enum(["DEFAULT", "NOMLYGOLD"]), spicy: z.number().int().min(0).max(4),
  isHidden: z.boolean(), isConfirmed: z.boolean(), isSaved: z.boolean(),
});
export const recipePatchSchema = z.strictObject({
  title: title.nullable(), description: text.nullable(), notes: text.nullable(), confirmationNotes: text.nullable(),
  category: recipeWriteSchema.shape.category.nullable(), series: recipeWriteSchema.shape.series.nullable(),
  spicy: recipeWriteSchema.shape.spicy.nullable(), isHidden: z.boolean().nullable(),
  isConfirmed: z.boolean().nullable(), isSaved: z.boolean().nullable(),
});
export const namedRecipeIngredientSchema = z.strictObject({
  title, amount: z.string().trim().min(1).max(200), category: z.enum(["SPICES", "OTHER"]).nullable(),
});
export const compositionChangeSchema = z.strictObject({
  mode: z.enum(["patch", "replace"]),
  items: z.array(z.strictObject({
    action: z.enum(["add", "setAmount", "remove"]), title,
    amount: z.string().trim().min(1).max(200).nullable(), category: z.enum(["SPICES", "OTHER"]).nullable(),
  })).max(50),
});
export const recipeIngredientReferenceSchema = namedRecipeIngredientSchema.extend({
  category: z.enum(["SPICES", "OTHER"]),
  id: z.number().int().positive().nullable(), updatedAt: z.iso.datetime().nullable(),
});
export const recipeSnapshotSchema = z.strictObject({
  fields: recipeWriteSchema, ingredients: z.array(recipeIngredientReferenceSchema).max(50),
});
export type RecipeWrite = z.infer<typeof recipeWriteSchema>;
export type RecipeSnapshot = z.infer<typeof recipeSnapshotSchema>;
