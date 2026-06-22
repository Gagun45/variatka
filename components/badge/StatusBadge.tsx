import { Badge } from "../ui/badge";

interface Props {
  isPositive: boolean;
  positiveLabel: string;
  negativeLabel: string;
  className?: string;
  onClick?: () => void;
}

const StatusBadge = ({
  isPositive,
  negativeLabel,
  positiveLabel,
  className,
  onClick,
}: Props) => {
  const content = (
    <Badge
      className={className}
      variant={isPositive ? "default" : "destructive"}
    >
      {isPositive ? `${positiveLabel}` : `${negativeLabel}`}
    </Badge>
  );
  if (!onClick) return content;
  return (
    <button type="button" onClick={onClick} className="cursor-pointer">
      {content}
    </button>
  );
};

export default StatusBadge;
