import { getImageUrl } from "@/lib/image.helper";
import Image from "next/image";

interface Props {
  imageKey: string | null;
  imageVersion: number;
  title: string;
}

const IngredientImagePublic = ({ imageKey, imageVersion, title }: Props) => {
  const imageSrc = getImageUrl(imageKey, imageVersion);
  return (
    <div className="relative h-96 w-full max-w-96 mx-auto overflow-hidden rounded-md border">
      <Image
        src={imageSrc}
        alt={title}
        fill
        sizes="384px"
        className="object-contain"
      />
    </div>
  );
};

export default IngredientImagePublic;
