"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/image.helper";
import { useUploadIngredientImage } from "@/features/ingredient/hooks/useUploadIngredientImage";
import { IIngredient } from "@/lib/prisma.args";
import { useRemoveIngredientImage } from "@/features/ingredient/hooks/useRemoveIngredientImage";
import { toast } from "sonner";

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
    removeMutation.mutate(ingredient.id, {
      onSuccess: () => {
        toast.success("Image removed!");
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    });
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
          toast.success("Upload success!");
          setFile(null);
        },
        onError: () => {
          toast.error("Something went wrong");
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
      <div className="relative h-96 w-full border">
        <Image src={imageSrc} alt={title} fill className="object-contain" />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 justify-center">
        {/* always available */}
        <Button variant="outline" onClick={openFilePicker} disabled={isPending}>
          Change image
        </Button>

        {/* remove only when image exists and NOT editing */}
        {imageKey && !file && (
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            Remove image
          </Button>
        )}

        {/* editing state */}
        {file && (
          <>
            <Button onClick={handleSave} disabled={isPending}>
              Save
            </Button>

            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
