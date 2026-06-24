import { IPublicRecipe } from "@/lib/types";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

interface Props {
  recipe: IPublicRecipe;
}

const PublicRecipeCard = ({ recipe }: Props) => {
  return (
    <div className="border p-2">
      <Link href={frontendUrls.public.view(recipe.id)}> {recipe.title}</Link>
    </div>
  );
};

export default PublicRecipeCard;
