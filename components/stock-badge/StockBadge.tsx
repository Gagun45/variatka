import { Badge } from "../ui/badge";

interface Props {
  inInStock: boolean;
  quantity?: number;
  className?: string;
}

const StockBadge = ({ inInStock, quantity, className }: Props) => {
  return (
    <Badge
      className={className}
      variant={inInStock ? "default" : "destructive"}
    >
      {inInStock
        ? `In stock ${quantity ? `(${quantity})` : ""}`
        : "Out of stock"}
    </Badge>
  );
};

export default StockBadge;
