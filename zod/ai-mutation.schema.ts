import z from "zod";
import { compositionChangeSchema, namedRecipeIngredientSchema, recipePatchSchema, recipeSnapshotSchema, recipeWriteSchema } from "./ai-recipe.schema";

export const inventoryIdSchema = z.number().int().positive().max(2_147_483_647);
export const inventoryVersionSchema = z.iso.datetime();
export const inventoryTitleInputSchema = z.string().trim().min(1).max(200);
const title = inventoryTitleInputSchema;
// Snapshots must not normalize existing titles during an unrelated field edit.
const storedTitle = z.string().min(1).max(200).regex(/\S/);
const description = z.string().max(10000).nullable();
const stock = z.number().int().min(0).max(2_147_483_647);
const ingredientCategory = z.enum(["SPICES", "OTHER"]);
const stuffCategory = z.enum(["DECOR", "JARS"]);

export const ingredientWriteSchema = z.strictObject({
  title: storedTitle, description, category: ingredientCategory, isInStock: z.boolean(), isSaved: z.boolean(),
});
export const stuffWriteSchema = z.strictObject({ title: storedTitle, description, category: stuffCategory, inStock: stock });

// Null in a patch means preserve the current value. An empty description clears it.
export const ingredientPatchSchema = z.strictObject({
  title: title.nullable(), description, category: ingredientCategory.nullable(),
  isInStock: z.boolean().nullable(), isSaved: z.boolean().nullable(),
});
export const stuffPatchSchema = z.strictObject({
  title: title.nullable(), description, category: stuffCategory.nullable(),
  stock: z.strictObject({
    mode: z.enum(["set", "adjust"]),
    value: z.number().int().min(-2_147_483_647).max(2_147_483_647),
  }).nullable(),
});

const targetName = title.nullable();
export const inventoryMutationIntentSchema = z.union([
  z.strictObject({ kind: z.literal("createRecipe"), data: recipeWriteSchema.extend({ title }), ingredients: z.array(namedRecipeIngredientSchema).max(50) }),
  z.strictObject({ kind: z.literal("updateRecipe"), targetName, patch: recipePatchSchema, composition: compositionChangeSchema.nullable() }),
  z.strictObject({ kind: z.literal("deleteRecipe"), targetName }),
  z.strictObject({ kind: z.literal("createIngredient"), data: ingredientWriteSchema.extend({ title }) }),
  z.strictObject({ kind: z.literal("createStuff"), data: stuffWriteSchema.extend({ title }) }),
  z.strictObject({ kind: z.literal("updateIngredient"), targetName, patch: ingredientPatchSchema }),
  z.strictObject({ kind: z.literal("updateStuff"), targetName, patch: stuffPatchSchema }),
  z.strictObject({ kind: z.literal("deleteIngredient"), targetName }),
  z.strictObject({ kind: z.literal("deleteStuff"), targetName }),
]);

const target = z.strictObject({ id: inventoryIdSchema, title: storedTitle, updatedAt: inventoryVersionSchema });
export const inventoryMutationPreviewSchema = z.union([
  z.strictObject({ kind: z.literal("createRecipe"), after: recipeSnapshotSchema }),
  z.strictObject({ kind: z.literal("updateRecipe"), target, before: recipeSnapshotSchema, after: recipeSnapshotSchema }),
  z.strictObject({ kind: z.literal("deleteRecipe"), target, before: recipeSnapshotSchema }),
  z.strictObject({ kind: z.literal("createIngredient"), after: ingredientWriteSchema }),
  z.strictObject({ kind: z.literal("createStuff"), after: stuffWriteSchema }),
  z.strictObject({ kind: z.literal("updateIngredient"), target, before: ingredientWriteSchema, after: ingredientWriteSchema }),
  z.strictObject({ kind: z.literal("updateStuff"), target, before: stuffWriteSchema, after: stuffWriteSchema }),
  z.strictObject({ kind: z.literal("deleteIngredient"), target, before: ingredientWriteSchema }),
  z.strictObject({ kind: z.literal("deleteStuff"), target, before: stuffWriteSchema }),
]);

export type IngredientWrite = z.infer<typeof ingredientWriteSchema>;
export type StuffWrite = z.infer<typeof stuffWriteSchema>;
export type InventoryMutationIntent = z.infer<typeof inventoryMutationIntentSchema>;
export type InventoryMutationPreview = z.infer<typeof inventoryMutationPreviewSchema>;
