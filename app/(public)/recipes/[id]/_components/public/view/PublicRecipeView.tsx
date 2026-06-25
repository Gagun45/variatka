import WishedToggleButton from "@/app/(public)/_components/wish-btn/WishedToggleButton";
import { Badge } from "@/components/ui/badge";
import { useToggleWishlist } from "@/features/recipe/hooks/useToggleWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistIdsSet } from "@/hooks/useWishlistIds";
import { getImageUrl } from "@/lib/image.helper";
import { IPublicRecipe } from "@/lib/types";
import Image from "next/image";

interface Props {
  recipe: IPublicRecipe;
}

export default function PublicRecipeView({ recipe }: Props) {
  const {
    imageKey,
    title,
    recipeCategory,
    ingredients,
    id,
    notes,
    description,
  } = recipe;
  const { isAuthenticated } = useAuth();
  const imageSrc = getImageUrl(imageKey);
  const wishlistIdsSet = useWishlistIdsSet();
  const isWished = wishlistIdsSet.has(id);
  const { mutate } = useToggleWishlist();
  const onToggleWished = () => {
    mutate(id);
  };
  return (
    <div className="mx-auto pt-6 space-y-6">
      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
        <div className="relative">
          <Image
            src={imageSrc}
            alt={title}
            width={350}
            height={350}
            className="aspect-square w-full rounded-lg border object-cover"
          />
          {isAuthenticated && (
            <WishedToggleButton
              className="absolute right-3 top-3 bg-background/80 backdrop-blur"
              isWished={isWished}
              onToggle={onToggleWished}
            />
          )}
        </div>

        <section className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{recipeCategory.title}</Badge>
            </div>
          </div>
          <div>
            <h2 className="mb-2 font-medium">
              Ingredients ({ingredients.length})
            </h2>

            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <Badge key={ingredient.id}>{ingredient.title}</Badge>
              ))}
            </div>
          </div>

          <p className="whitespace-pre-wrap text-muted-foreground">
            {description}
          </p>
          <p className="whitespace-pre-wrap text-muted-foreground">{notes}</p>
        </section>
      </div>
    </div>
  );
}
