import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";
import SidebarLink from "../link/SidebarLink";

const SavedLinks = () => {
  const { data: ingredients = [] } = useIngredients();
  const savedIngredientCount = ingredients.filter(
    (ingredient) => ingredient.isSaved,
  ).length;

  const { data: recipes = [] } = useRecipes();
  const savedRecipeCount = recipes.filter((recipe) => recipe.isSaved).length;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarLink
          href={frontendUrls.ingredients.saved}
          label="Saved ingredients"
          count={savedIngredientCount}
        />

        <SidebarLink
          href={frontendUrls.recipes.saved}
          label="Saved recipes"
          count={savedRecipeCount}
        />
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default SavedLinks;
