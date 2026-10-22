import { inventoryCategoryLabels, inventoryEntityLabels, inventorySeriesLabels } from "./inventory-labels";

// Shared with UI labels; aliases guide interpretation, never rewrite record titles.
const entities = {
  ingredient: ["інгредієнт", "інгредієнти", "інгредієнтів", "складник", "складники", "складників"],
  recipe: ["рецепт", "рецепти", "рецептів"],
  stuff: ["матеріал", "матеріали", "матеріалів", "матеріалами", "пакування", "упаковка", "тара"],
};
const categories = {
  SPICES: ["спеції", "спецій", "прянощі"], OTHER: ["інше", "інші"],
  SAUCES: ["соус", "соуси", "соусів"], JAMS: ["повидло", "джем", "джеми", "варення"],
  SEASONEDSALT: ["пряна сіль", "пряні солі", "пряних солей"],
  DECOR: ["декор", "етикетки", "наліпки", "пакування та декор"],
  JARS: ["слоїчки", "слоїчків", "банки", "банок", "баночки", "баночок"],
};

export const inventoryVocabularyInstructions = `Ukrainian inventory vocabulary (also recognize grammatical forms):
Entities: ${JSON.stringify(Object.entries(entities).map(([value, aliases]) => ({ value, label: inventoryEntityLabels[value as keyof typeof inventoryEntityLabels], aliases })))}
Categories: ${JSON.stringify(Object.entries(categories).map(([value, aliases]) => ({ value, label: inventoryCategoryLabels[value as keyof typeof inventoryCategoryLabels], aliases })))}
Series: ${JSON.stringify(inventorySeriesLabels)}. Стандарт/стандартна серія = DEFAULT; Nomly Gold = NOMLYGOLD.
Fields: наявний/є в наявності = availability true; відсутній/немає в наявності = availability false; залишок/кількість на складі = numeric stuff stock; збережений = isSaved; прихований = isHidden; підтверджений = isConfirmed; гострота = spicy.
Матеріали is the entire stuff ENTITY, never a category. Generic матеріали/тара/пакування alone must not impose JARS or DECOR. Category words only filter within the appropriate entity. Do not ask what матеріалів means. Do not treat vocabulary words as text filters unless explicitly part of a record title. Preserve quoted record titles; aliases are not ingredient-name substitutions.
Examples:
- Покажи всі матеріали / список матеріалів => search stuff, no category or text filter.
- Покажи матеріали категорії слоїчки / залишки слоїчків => search stuff, category JARS.
- Знайди матеріали із залишком менше 10 => search stuff, stockMax 9, no category/text.
- Видали всі матеріали категорії декор => batch/filter, stuff category DECOR, deleteStuff; preview required.
- Встанови залишок усіх матеріалів на 5 => batch/filter, stuff without category/text, updateStuff stock set 5.
- Покажи наявні складники => search ingredient, isInStock true.
- Покажи рецепти повидла => search recipe, category JAMS.
Known terminology alone never requires clarification. Still ask for genuinely missing quantities, ambiguous targets or creation-versus-restocking intent: додай банки is ambiguous; покажи матеріали is not.`;
