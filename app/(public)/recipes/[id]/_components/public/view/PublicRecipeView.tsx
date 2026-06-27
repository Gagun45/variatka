"use client";

import WishedToggleButton from "@/app/(public)/_components/wish-btn/WishedToggleButton";
import RecipeSeriesBadge from "@/components/series-badge/RecipeSeriesBadge";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToggleWishlist } from "@/features/recipe/hooks/useToggleWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistIdsSet } from "@/hooks/useWishlistIds";
import { getImageUrl } from "@/lib/image.helper";
import { IPublicRecipe } from "@/lib/types";
import { BookOpen, ChefHat } from "lucide-react";
import Image from "next/image";

interface Props {
  recipe: IPublicRecipe;
}

export default function PublicRecipeView({ recipe }: Props) {
  const { isAuthenticated } = useAuth();
  const {
    title,
    id,
    imageKey,
    recipeCategory,
    series,
    ingredients,
    description,
    isInStock,
    notes,
  } = recipe;

  const wishlistIdsSet = useWishlistIdsSet();
  const isWished = wishlistIdsSet.has(id);

  const { mutate } = useToggleWishlist();

  const imageSrc = getImageUrl(imageKey);

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Image */}
        <aside className="lg:sticky lg:top-36 h-fit">
          <div className="relative overflow-hidden rounded-2xl border bg-muted">
            <Image
              src={imageSrc}
              alt={title}
              width={500}
              height={500}
              className="aspect-square w-full object-cover transition duration-300 hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/70 to-transparent" />

            <Badge className="absolute bottom-4 left-4">
              {recipeCategory.title}
            </Badge>

            {isAuthenticated && (
              <WishedToggleButton
                className="absolute right-4 top-4 bg-background/90 backdrop-blur"
                isWished={isWished}
                onToggle={() => mutate(id)}
              />
            )}
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-8">
          <section className="space-y-5">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>

            <p className="text-lg leading-7 text-muted-foreground">
              {description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <ChefHat className="mr-2 h-4 w-4" />
                {recipeCategory.title}
              </Badge>

              <Badge variant="outline" className="px-3 py-1">
                <BookOpen className="mr-2 h-4 w-4" />
                {ingredients.length} ingredients
              </Badge>

              <RecipeSeriesBadge variant={"default"} series={series} />
              <StockBadge isInStock={isInStock} />
            </div>
          </section>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Ingredients ({ingredients.length})</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 grid-cols-1 xl:grid-cols-2">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {ingredient.title[0].toUpperCase()}
                    </div>

                    <span className="font-medium">{ingredient.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {notes.trim() && (
            <Card>
              <CardHeader>
                <CardTitle>Additional notes</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
                  {notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
