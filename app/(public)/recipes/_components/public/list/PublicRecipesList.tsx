import { useWishlistIdsSet } from "@/hooks/useWishlistIds";
import { IPublicRecipe } from "@/lib/types";
import PublicRecipeCard from "./card/PublicRecipeCard";
import { useToggleWishlist } from "@/features/recipe/hooks/useToggleWishlist";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  recipes: IPublicRecipe[];
}

const PublicRecipesList = ({ recipes }: Props) => {
  const wishlistIdsSet = useWishlistIdsSet();
  const { mutate } = useToggleWishlist();
  const { isAuthenticated } = useAuth();
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((r) => {
        const onToggleWished = () => {
          mutate(r.id);
        };
        return (
          <PublicRecipeCard
            isAuthenticated={isAuthenticated}
            onToggleWished={onToggleWished}
            wishlistIdsSet={wishlistIdsSet}
            recipe={r}
            key={r.id}
          />
        );
      })}
    </div>
  );
};

export default PublicRecipesList;
