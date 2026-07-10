import { CheckCircle, Circle } from "lucide-react";
import IconButton from "../icon-button/IconButton";

interface Props {
  onToggle: () => void;
  isConfirmed: boolean;
  className?: string;
}

const ConfirmToggleButton = ({ onToggle, isConfirmed, className }: Props) => {
  return (
    <IconButton
      variant="ghost"
      size="icon"
      className={`${className} group shrink-0 rounded-full hover:bg-success/10`}
      onClick={onToggle}
      label={isConfirmed ? "Mark unconfirmed" : "Mark confirmed"}
    >
      {isConfirmed ? (
        <CheckCircle className="size-5 text-success transition-all duration-200 group-hover:scale-110" />
      ) : (
        <Circle className="size-5 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-success" />
      )}
    </IconButton>
  );
};

export default ConfirmToggleButton;
