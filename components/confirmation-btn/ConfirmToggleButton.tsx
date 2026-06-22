import { CheckCircle, Circle } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  onToggle: () => void;
  isConfirmed: boolean;
  className?: string;
}

const ConfirmToggleButton = ({ onToggle, isConfirmed, className }: Props) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${className} group shrink-0 rounded-full hover:bg-green-50`}
      onClick={onToggle}
    >
      {isConfirmed ? (
        <CheckCircle className="size-5 transition-all duration-200 text-green-500 group-hover:scale-110" />
      ) : (
        <Circle className="size-5 transition-all duration-200 text-muted-foreground group-hover:text-green-500 group-hover:scale-110" />
      )}
    </Button>
  );
};

export default ConfirmToggleButton;
