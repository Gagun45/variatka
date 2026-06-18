import StockBadge from "@/components/stock-badge/StockBadge";

interface Props {
  onToggle: () => void;
  isInStock: boolean;
  className?: string;
}

const StockToggleButton = ({ onToggle, isInStock, className }: Props) => {
  return (
    <StockBadge
      className={className}
      inInStock={isInStock}
      onClick={onToggle}
    />
  );
};

export default StockToggleButton;
