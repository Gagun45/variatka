import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IStuff } from "@/lib/prisma.args";

interface Props {
  stuff: IStuff;
}

const StuffCard = ({ stuff }: Props) => {
  const { title, inStock } = stuff;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h3 className="font-medium">{title}</h3>
        <Badge variant={inStock > 0 ? "default" : "destructive"}>
          {inStock > 0 ? `In Stock (${inStock})` : "Out of Stock"}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default StuffCard;
