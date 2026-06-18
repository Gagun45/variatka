"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useRemoveIngredientImage } from "@/features/ingredient/hooks/useRemoveIngredientImage";
import { useUploadIngredientImage } from "@/features/ingredient/hooks/useUploadIngredientImage";
import { getImageUrl } from "@/lib/image.helper";
import { IIngredient } from "@/lib/prisma.args";
import { Check, Pencil, Trash2, X } from "lucide-react";

type Props = {
  ingredient: IIngredient;
};

export function IngredientImageAdmin({ ingredient }: Props) {
  const { imageKey, title, id, imageVersion } = ingredient;

  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { mutate: uploadMutate, isPending } = useUploadIngredientImage();
  const removeMutation = useRemoveIngredientImage();

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const imageSrc = previewUrl ?? getImageUrl(imageKey, imageVersion);

  const openFilePicker = () => {
    inputRef.current?.click();
  };
  const handleRemove = () => {
    removeMutation.mutate(ingredient.id);
  };

  const handleCancel = () => {
    setFile(null);
  };

  const handleSave = () => {
    if (!file) return;

    uploadMutate(
      {
        ingredientId: id,
        file,
      },
      {
        onSuccess: () => {
          setFile(null);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (!selected) return;

          setFile(selected);

          // allow re-selecting same file again
          e.target.value = "";
        }}
      />

      {/* IMAGE PREVIEW */}
      <div className="relative h-96 w-full overflow-hidden rounded-md border">
        <Image src={imageSrc} alt={title} fill className="object-contain" />

        <div className="absolute top-2 right-2 flex gap-2">
          {file ? (
            <>
              <Button
                size="icon"
                variant="destructive"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X />
              </Button>
              <Button size="icon" onClick={handleSave} disabled={isPending}>
                <Check />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="secondary"
                onClick={openFilePicker}
                disabled={isPending}
              >
                <Pencil />
              </Button>

              {imageKey && (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isPending}
                >
                  <Trash2 />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
