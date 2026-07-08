import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ICartItem } from "@/zustand/cart.store";
import { ClipboardList, PackageCheck, ShoppingBasket } from "lucide-react";
import CheckoutItemCard from "./card/CheckoutItemCard";

interface Props {
  items: ICartItem[];
}

const CheckoutItemsList = ({ items }: Props) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="flex flex-col gap-4">
      <Card className="gap-3" size="sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4 text-muted-foreground" />
                Order review
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Check quantities before placing the order.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <ShoppingBasket className="size-3" />
                {items.length} products
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <PackageCheck className="size-3" />
                {totalQuantity} items
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <CheckoutItemCard item={item} key={item.recipeId} />
        ))}
      </div>
    </section>
  );
};

export default CheckoutItemsList;
