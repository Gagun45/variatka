import StockBadge from "@/components/stock-badge/StockBadge";
import { Button } from "@/components/ui/button";

interface Props {
  onToggle: () => void;
  isInStock: boolean;
}

const StockToggleButton = ({ onToggle, isInStock }: Props) => {
  return (
    <Button className="h-auto w-24" variant={"ghost"} onClick={onToggle}>
      <StockBadge inInStock={isInStock} />
    </Button>
  );
};

export default StockToggleButton;
