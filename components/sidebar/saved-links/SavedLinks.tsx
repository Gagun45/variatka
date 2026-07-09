import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";
import SidebarLink from "../link/SidebarLink";

const SavedLinks = () => {
  const { data: ingredients = [] } = useIngredients();
  const savedIngredientsLength = ingredients.filter((i) => i.isSaved).length;

  const { data: recipes = [] } = useRecipes();
  const savedRecipesLength = recipes.filter((r) => r.isSaved).length;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarLink
          href={frontendUrls.ingredients.saved}
          label={`Saved ingredients${savedIngredientsLength > 0 ? ` (${savedIngredientsLength})` : ""}`}
        />

        <SidebarLink
          href={frontendUrls.recipes.saved}
          label={`Saved recipes${savedRecipesLength > 0 ? ` (${savedRecipesLength})` : ""}`}
        />
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default SavedLinks;
