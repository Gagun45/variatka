import StatusBadge from "../badge/StatusBadge";

interface Props {
  isInStock: boolean;
  quantity?: number;
  className?: string;
  onClick?: () => void;
}

const StockBadge = ({ isInStock, quantity, className, onClick }: Props) => {
  const positiveLabel = `In stock ${quantity ? `(${quantity})` : ""}`;
  const negateiLabel = "Out of stock";
  return (
    <StatusBadge
      onClick={onClick}
      className={`${className} w-24`}
      isPositive={isInStock}
      negativeLabel={negateiLabel}
      positiveLabel={positiveLabel}
    />
  );
};

export default StockBadge;
