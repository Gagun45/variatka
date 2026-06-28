import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SpicyOptions } from "@/forms/recipe/fields/SpicyField";
import { FaPepperHot } from "react-icons/fa";

type Props = {
  level: number;
};

const SpicyLevelTooltip = ({ level }: Props) => {
  if (level === 0) return null;

  const option = SpicyOptions.find((o) => o.value === level);
  if (!option) return null;

  const peppers = Math.max(level - 1, 1);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-0.5 cursor-default">
          {Array.from({ length: peppers }).map((_, i) => (
            <FaPepperHot
              key={i}
              size={12}
              className={
                level === 1
                  ? "text-muted-foreground opacity-40"
                  : "text-red-500"
              }
            />
          ))}
        </div>
      </TooltipTrigger>

      <TooltipContent>
        <p>{option.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SpicyLevelTooltip;
