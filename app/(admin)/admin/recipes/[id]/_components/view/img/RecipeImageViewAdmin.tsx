import { ImageViewAdmin } from "@/components/img-upload/ImageViewAdmin";
import { useRemoveRecipeImage } from "@/features/recipe/hooks/useRemoveRecipeImage";
import { useUploadRecipeImage } from "@/features/recipe/hooks/useUploadRecipeImage";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeImageViewAdmin = ({ recipe }: Props) => {
  const { id, title, imageKey, imageVersion } = recipe;
  const { mutateAsync: uploadMutate, isPending } = useUploadRecipeImage();
  const { mutate: removeMutate } = useRemoveRecipeImage();
  const onUpload = async (file: File) => {
    await uploadMutate({
      file,
      ingredientId: id,
    });
  };
  const onRemove = () => {
    removeMutate(id);
  };
  return (
    <ImageViewAdmin
      onUpload={onUpload}
      imageKey={imageKey}
      imageVersion={imageVersion}
      title={title}
      isPending={isPending}
      onRemove={onRemove}
    />
  );
};

export default RecipeImageViewAdmin;
