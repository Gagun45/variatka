import z from "zod";

const text = z.string().trim().min(1).max(200).nullable();
const flag = z.boolean().nullable();
const quantity = z.number().int().min(0).max(2_147_483_647).nullable();
const spicy = z.number().int().min(0).max(4).nullable();

// New filters accept older clients that omit them; output schemas still require
// explicit nulls. Provider schema generation removes the Zod default metadata.
const optionalText = text.default(null);
const optionalFlag = flag.default(null);
const date = z.iso.date().nullable().default(null);
const common = {
  titleText: optionalText, descriptionText: optionalText, hasDescription: optionalFlag,
  createdFrom: date, createdBefore: date, updatedFrom: date, updatedBefore: date,
};

// Required nullable fields keep the generated JSON Schema compatible with strict output.
export const ingredientSearchLeafSchema = z.strictObject({
  entity: z.literal("ingredient"),
  ...common, hasImage: optionalFlag, usedInRecipes: optionalFlag,
  text,
  category: z.enum(["SPICES", "OTHER"]).nullable(),
  categories: z.array(z.enum(["SPICES", "OTHER"])).max(2).default([]),
  excludeCategories: z.array(z.enum(["SPICES", "OTHER"])).max(2).default([]),
  isInStock: flag,
  isSaved: flag,
});

export const recipeSearchLeafSchema = z.strictObject({
  entity: z.literal("recipe"),
  ...common, hasImage: optionalFlag,
  notesText: optionalText, confirmationNotesText: optionalText,
  hasNotes: optionalFlag, hasConfirmationNotes: optionalFlag, hasIngredients: optionalFlag, hasVariants: optionalFlag,
  variantLabel: optionalText, variantInStock: optionalFlag,
  variantStockMin: quantity.default(null), variantStockMax: quantity.default(null),
  text,
  category: z.enum(["SPICES", "SAUCES", "JAMS", "SEASONEDSALT"]).nullable(),
  categories: z.array(z.enum(["SPICES", "SAUCES", "JAMS", "SEASONEDSALT"])).max(4).default([]),
  excludeCategories: z.array(z.enum(["SPICES", "SAUCES", "JAMS", "SEASONEDSALT"])).max(4).default([]),
  series: z.enum(["DEFAULT", "NOMLYGOLD"]).nullable(),
  isHidden: flag,
  isConfirmed: flag,
  isSaved: flag,
  isInStock: flag,
  readyToCook: flag,
  spicyMin: spicy,
  spicyMax: spicy,
  includeIngredients: z.array(z.string().trim().min(1).max(100)).max(8),
  anyIngredients: z.array(z.string().trim().min(1).max(100)).max(8).default([]),
  excludeIngredients: z.array(z.string().trim().min(1).max(100)).max(8),
});

export const stuffSearchLeafSchema = z.strictObject({
  entity: z.literal("stuff"),
  ...common,
  text,
  category: z.enum(["DECOR", "JARS"]).nullable(),
  categories: z.array(z.enum(["DECOR", "JARS"])).max(2).default([]),
  excludeCategories: z.array(z.enum(["DECOR", "JARS"])).max(2).default([]),
  isInStock: flag,
  stockMin: quantity,
  stockMax: quantity,
});

const allSearchLeafSchema = z.strictObject({ entity: z.literal("all"), text, ...common });
export const inventorySearchLeafSchema = z.union([
  ingredientSearchLeafSchema, recipeSearchLeafSchema, stuffSearchLeafSchema, allSearchLeafSchema,
]);
// One explicit level of bounded groups. Branches are flat typed filters, never
// arbitrary Prisma objects or recursive model-authored expressions.
const combinations = {
  anyOf: z.array(inventorySearchLeafSchema).max(4).default([]),
  noneOf: z.array(inventorySearchLeafSchema).max(4).default([]),
};
export const ingredientSearchSchema = ingredientSearchLeafSchema.extend(combinations);
export const recipeSearchSchema = recipeSearchLeafSchema.extend(combinations);
export const stuffSearchSchema = stuffSearchLeafSchema.extend(combinations);
export const inventorySearchSchema = z.union([
  ingredientSearchSchema, recipeSearchSchema, stuffSearchSchema, allSearchLeafSchema.extend(combinations),
]);
export type InventorySearchLeaf = z.input<typeof inventorySearchLeafSchema>;
export type InventorySearch = z.input<typeof inventorySearchSchema>;
