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
export const ingredientSearchSchema = z.strictObject({
  entity: z.literal("ingredient"),
  ...common, hasImage: optionalFlag, usedInRecipes: optionalFlag,
  text,
  category: z.enum(["SPICES", "OTHER"]).nullable(),
  isInStock: flag,
  isSaved: flag,
});

export const recipeSearchSchema = z.strictObject({
  entity: z.literal("recipe"),
  ...common, hasImage: optionalFlag,
  notesText: optionalText, confirmationNotesText: optionalText,
  hasNotes: optionalFlag, hasConfirmationNotes: optionalFlag, hasIngredients: optionalFlag, hasVariants: optionalFlag,
  variantLabel: optionalText, variantInStock: optionalFlag,
  variantStockMin: quantity.default(null), variantStockMax: quantity.default(null),
  text,
  category: z.enum(["SPICES", "SAUCES", "JAMS", "SEASONEDSALT"]).nullable(),
  series: z.enum(["DEFAULT", "NOMLYGOLD"]).nullable(),
  isHidden: flag,
  isConfirmed: flag,
  isSaved: flag,
  isInStock: flag,
  readyToCook: flag,
  spicyMin: spicy,
  spicyMax: spicy,
  includeIngredients: z.array(z.string().trim().min(1).max(100)).max(8),
  excludeIngredients: z.array(z.string().trim().min(1).max(100)).max(8),
});

export const stuffSearchSchema = z.strictObject({
  entity: z.literal("stuff"),
  ...common,
  text,
  category: z.enum(["DECOR", "JARS"]).nullable(),
  isInStock: flag,
  stockMin: quantity,
  stockMax: quantity,
});

export const inventorySearchSchema = z.union([
  ingredientSearchSchema,
  recipeSearchSchema,
  stuffSearchSchema,
  z.strictObject({ entity: z.literal("all"), text, ...common }),
]);

export type InventorySearch = z.input<typeof inventorySearchSchema>;
