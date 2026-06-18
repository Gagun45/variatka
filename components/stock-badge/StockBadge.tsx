import { Badge } from "../ui/badge";

interface Props {
  inInStock: boolean;
  quantity?: number;
  className?: string;
  onClick?: () => void;
}

const StockBadge = ({ inInStock, quantity, className, onClick }: Props) => {
  return (
    <Badge
      onClick={onClick}
      className={`${className} w-24`}
      variant={inInStock ? "default" : "destructive"}
    >
      {inInStock
        ? `In stock ${quantity ? `(${quantity})` : ""}`
        : "Out of stock"}
    </Badge>
  );
};

export default StockBadge;
