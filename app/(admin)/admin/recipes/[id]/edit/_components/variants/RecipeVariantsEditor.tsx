"use client";

import type { FormEvent } from "react";
import type { RecipeVariant } from "@prisma/client";
import { Package, Plus, Save } from "lucide-react";

import DeleteDialog from "@/components/delete-dialog/DeleteDialog";
import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCreateRecipeVariant } from "@/features/recipe-variant/hooks/useCreateRecipeVariant";
import { useDeleteRecipeVariant } from "@/features/recipe-variant/hooks/useDeleteRecipeVariant";
import { useUpdateRecipeVariantStock } from "@/features/recipe-variant/hooks/useUpdateRecipeVariantStock";

interface Props {
  recipeId: number;
  variants: RecipeVariant[];
}

const RecipeVariantsEditor = ({ recipeId, variants }: Props) => {
  const createVariant = useCreateRecipeVariant();
  const deleteVariant = useDeleteRecipeVariant();
  const updateStock = useUpdateRecipeVariantStock();
  const totalStock = variants.reduce(
    (total, variant) => total + variant.inStock,
    0,
  );
  const nextSortOrder =
    variants.reduce(
      (highest, variant) => Math.max(highest, variant.sortOrder),
      -1,
    ) + 1;

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    createVariant.mutate(
      {
        recipeId,
        dto: {
          label: String(formData.get("label") ?? ""),
          inStock: Number(formData.get("inStock")),
          sortOrder: nextSortOrder,
        },
      },
      {
        onSuccess: () => form.reset(),
      },
    );
  };

  const handleStockUpdate = (
    event: FormEvent<HTMLFormElement>,
    variantId: number,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    updateStock.mutate({
      recipeId,
      variantId,
      inStock: Number(formData.get("inStock")),
    });
  };

  return (
    <Card className="gap-0">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              Recipe variants
            </CardTitle>
            <CardDescription>
              Manage package sizes and stock for this recipe.
            </CardDescription>
          </div>
          <Badge variant="secondary">Total stock: {totalStock}</Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-5 p-4 sm:p-6">
        <form
          className="grid gap-3 rounded-xl border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
          onSubmit={handleCreate}
        >
          <label className="grid gap-1.5 text-sm font-medium">
            Variant label
            <Input
              name="label"
              placeholder="e.g. 50g"
              maxLength={100}
              required
              disabled={createVariant.isPending}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Initial stock
            <Input
              name="inStock"
              type="number"
              min={0}
              step={1}
              defaultValue={0}
              required
              disabled={createVariant.isPending}
            />
          </label>
          <LoadingButton
            type="submit"
            isPending={createVariant.isPending}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add variant
          </LoadingButton>
        </form>

        {variants.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center">
            <p className="font-medium">No variants yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the first package size to make this recipe available.
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-xl border">
            {variants.map((variant) => {
              const isUpdating =
                updateStock.isPending &&
                updateStock.variables?.variantId === variant.id;
              const isDeleting =
                deleteVariant.isPending &&
                deleteVariant.variables?.variantId === variant.id;

              return (
                <div
                  className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)_auto] sm:items-center"
                  key={`${variant.id}-${variant.inStock}`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{variant.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Position {variant.sortOrder + 1}
                    </p>
                  </div>

                  <form
                    className="flex items-center gap-2"
                    onSubmit={(event) =>
                      handleStockUpdate(event, variant.id)
                    }
                  >
                    <Input
                      aria-label={`Stock for ${variant.label}`}
                      name="inStock"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={variant.inStock}
                      required
                      disabled={isUpdating || isDeleting}
                    />
                    <LoadingButton
                      type="submit"
                      variant="outline"
                      size="icon"
                      isPending={isUpdating}
                      disabled={isDeleting}
                      aria-label={`Save stock for ${variant.label}`}
                      title="Save stock"
                    >
                      <Save className="size-4" />
                    </LoadingButton>
                  </form>

                  <DeleteDialog
                    alertTitle={`Delete ${variant.label}?`}
                    alertDescription="This variant will be permanently removed. Variants used in orders cannot be deleted."
                    onDelete={() =>
                      deleteVariant.mutate({
                        recipeId,
                        variantId: variant.id,
                      })
                    }
                    isPending={isDeleting}
                    isDisabled={isUpdating || deleteVariant.isPending}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeVariantsEditor;
