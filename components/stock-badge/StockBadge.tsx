import { Badge } from "../ui/badge";

interface Props {
  inInStock: boolean;
  quantity?: number;
}

const StockBadge = ({ inInStock, quantity }: Props) => {
  return (
    <Badge variant={inInStock ? "default" : "destructive"}>
      {inInStock ? `In stock ${quantity && `(${quantity})`}` : "Out of stock"}
    </Badge>
  );
};

export default StockBadge;
