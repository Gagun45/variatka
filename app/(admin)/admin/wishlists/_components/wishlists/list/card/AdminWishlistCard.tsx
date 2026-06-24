import StockBadge from "@/components/stock-badge/StockBadge";
import { IUserWithWishlist } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

interface Props {
  user: IUserWithWishlist;
}

const AdminWishlistCard = ({ user }: Props) => {
  const { withlistItems } = user;
  return (
    <div className="flex flex-col gap-4">
      {withlistItems.map(({ recipe }) => (
        <div
          key={recipe.id}
          className="flex justify-between gap-2 items-center p-2 border rounded-md"
        >
          <Link href={frontendUrls.recipes.view(recipe.id)}>
            {recipe.title}
          </Link>
          <StockBadge isInStock={!!recipe.inStock} quantity={recipe.inStock} />
        </div>
      ))}
    </div>
  );
};

export default AdminWishlistCard;
