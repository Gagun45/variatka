import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";

interface Props {
  id: number;
}

const RecipeActions = ({ id }: Props) => {
  return (
    <div className="flex justify-end">
      <Link
        className={buttonVariants({
          className: "px-8 text-base",
        })}
        href={frontendUrls.recipes.edit(id)}
      >
        Edit
      </Link>
    </div>
  );
};

export default RecipeActions;
