import { useToggleWishlist } from "@/features/recipe/hooks/useToggleWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistIdSet } from "@/features/recipe/hooks/useWishlistIds";
import { IPublicRecipe } from "@/lib/types";
import PublicRecipeCard from "./card/PublicRecipeCard";

interface Props {
  recipes: IPublicRecipe[];
}

const PublicRecipesList = ({ recipes }: Props) => {
  const wishlistIdSet = useWishlistIdSet();
  const { mutate } = useToggleWishlist();
  const { isAuthenticated } = useAuth();
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((r) => {
        const onToggleWished = () => {
          mutate(r.id);
        };
        return (
          <PublicRecipeCard
            isAuthenticated={isAuthenticated}
            onToggleWished={onToggleWished}
            wishlistIdSet={wishlistIdSet}
            recipe={r}
            key={r.id}
          />
        );
      })}
    </div>
  );
};

export default PublicRecipesList;
