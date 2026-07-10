import StockBadge from "@/components/stock-badge/StockBadge";
import { Card, CardContent } from "@/components/ui/card";
import { IStuff } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

interface Props {
  stuff: IStuff;
}

const StuffCard = ({ stuff }: Props) => {
  const { title, inStock, id } = stuff;

  return (
    <Link href={frontendUrls.stuff.edit(id)}>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h3 className="font-medium">{title}</h3>
          <StockBadge isInStock={!!inStock} quantity={inStock} />
        </CardContent>
      </Card>
    </Link>
  );
};

export default StuffCard;
