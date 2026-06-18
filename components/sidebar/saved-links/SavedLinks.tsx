import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";
import SidebarLink from "../link/SidebarLink";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";

const SavedLinks = () => {
  const { data: ingredients = [] } = useIngredients();
  const savedIngredientsLength = ingredients.filter((i) => i.isSaved).length;

  const { data: recipes = [] } = useRecipes();
  const savedRecipesLength = recipes.filter((r) => r.isSaved).length;

  return (
    <SidebarGroup className="mt-8">
      <SidebarMenu className="space-y-2">
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <SidebarLink
              href={frontendUrls.ingredients.saved}
              label={`Saved ingredients${savedIngredientsLength > 0 ? ` (${savedIngredientsLength})` : ""}`}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <SidebarLink
              href={frontendUrls.recipes.saved}
              label={`Saved recipes${savedRecipesLength > 0 ? ` (${savedRecipesLength})` : ""}`}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default SavedLinks;
