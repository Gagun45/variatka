import { ImageViewAdmin } from "@/components/img-upload/ImageViewAdmin";
import { useRemoveIngredientImage } from "@/features/ingredient/hooks/useRemoveIngredientImage";
import { useUploadIngredientImage } from "@/features/ingredient/hooks/useUploadIngredientImage";
import { IIngredient } from "@/lib/prisma.args";

interface Props {
  ingredient: IIngredient;
}

const IngredientImageViewAdmin = ({ ingredient }: Props) => {
  const { id, title, imageKey, imageVersion } = ingredient;
  const { mutateAsync: uploadMutate, isPending } = useUploadIngredientImage();
  const { mutate: removeMutate } = useRemoveIngredientImage();
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

export default IngredientImageViewAdmin;
