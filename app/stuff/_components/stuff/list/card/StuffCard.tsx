import StockBadge from "@/components/stock-badge/StockBadge";
import { Badge } from "@/components/ui/badge";
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
    <Link href={frontendUrls.stuff.view(id)}>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h3 className="font-medium">{title}</h3>
          <StockBadge inInStock={!!inStock} quantity={inStock} />
        </CardContent>
      </Card>
    </Link>
  );
};

export default StuffCard;
