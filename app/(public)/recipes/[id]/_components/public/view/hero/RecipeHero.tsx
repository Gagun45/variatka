import WishedToggleButton from "@/app/(public)/_components/wish-btn/WishedToggleButton";
import PublicRecipeCardCartButton from "@/app/(public)/recipes/_components/public/list/card/cart-btn/PublicRecipeCardCartButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useToggleWishlist } from "@/features/recipe/hooks/useToggleWishlist";
import { SpicyOptions } from "@/forms/recipe/fields/SpicyField";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistIdsSet } from "@/hooks/useWishlistIds";
import { RECIPE_CATEGORIES_DATA } from "@/lib/enumslist/recipe.constants";
import { RECIPE_SERIES_DATA } from "@/lib/enumslist/series.constants";
import { getImageUrl } from "@/lib/image.helper";
import { IPublicRecipe } from "@/lib/types";
import { frontendUrls } from "@/lib/urls";
import { ArrowLeft, Flame, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import IconBadge from "../shared/IconBadge";

interface Props {
  recipe: IPublicRecipe;
}

export default function RecipeHero({ recipe }: Props) {
  const { isAuthenticated, isAdmin } = useAuth();
  const wishlistIdsSet = useWishlistIdsSet();
  const { mutate } = useToggleWishlist();

  const { id, title, imageKey, category, series, description, spicy } = recipe;

  const imageSrc = getImageUrl(imageKey);
  const spicyOption = SpicyOptions.find((s) => s.value === spicy);
  const categoryData = RECIPE_CATEGORIES_DATA[category];
  const seriesData = RECIPE_SERIES_DATA[series];
  const CategoryIcon = categoryData.icon;
  const SeriesIcon = seriesData.icon;
  const isWished = wishlistIdsSet.has(id);

  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            href={frontendUrls.public.recipes}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="size-4" />
            Recipes
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                className={buttonVariants({ variant: "outline", size: "sm" })}
                href={frontendUrls.recipes.edit(id)}
              >
                <Pencil className="size-4" />
                Edit
              </Link>
            )}

            {isAuthenticated && (
              <WishedToggleButton
                className="border bg-background shadow-sm"
                isWished={isWished}
                onToggle={() => mutate(id)}
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-stretch">
          <div className="rounded-xl border bg-card p-3 shadow-sm">
            <div className="relative flex min-h-88 items-center justify-center overflow-hidden rounded-lg bg-muted/30 sm:min-h-128 lg:min-h-152">
              <Image
                src={imageSrc}
                alt={title}
                width={900}
                height={900}
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
                className="aspect-square max-h-[70vh] w-full object-contain p-6 sm:p-10"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-between rounded-xl border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="min-w-0 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <IconBadge
                  icon={CategoryIcon}
                  iconClassName={categoryData.iconClassName}
                  label={categoryData.label}
                />
                <IconBadge
                  icon={SeriesIcon}
                  iconClassName={seriesData.iconClassName}
                  label={seriesData.label}
                />
                {spicyOption && spicyOption.value > 0 && (
                  <Badge variant="outline" className="h-7 gap-1.5 px-2.5">
                    <Flame className="size-3.5 text-spicy" />
                    {spicyOption.tooltip}
                  </Badge>
                )}
              </div>

              <div className="min-w-0 space-y-4">
                <h1 className="max-w-full py-0 text-left text-4xl font-semibold tracking-normal text-balance wrap-break-word sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                {description && (
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 border-t pt-5">
              <div className="mb-4">
                <p className="text-sm font-medium">Add to order</p>
                <p className="text-xs text-muted-foreground">
                  Quantity controls handle stock limits.
                </p>
              </div>
              <PublicRecipeCardCartButton recipe={recipe} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
