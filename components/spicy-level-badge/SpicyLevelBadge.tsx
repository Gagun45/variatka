import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaPepperHot } from "react-icons/fa";

type Props = {
  level: number;
  showLabel?: boolean;
};

const SPICY_LEVELS = {
  1: { label: "Не гостре", peppers: 1 },
  2: { label: "Легко гостре", peppers: 1 },
  3: { label: "Середньо гостре", peppers: 2 },
  4: { label: "Гостре", peppers: 3 },
} as const;

const SpicyLevelBadge = ({ level, showLabel = false }: Props) => {
  const spicyLevel = SPICY_LEVELS[level as keyof typeof SPICY_LEVELS];
  if (!spicyLevel) return null;

  const isNotSpicy = level === 1;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="h-7 cursor-default gap-1.5 bg-background/90 px-2.5 shadow-sm backdrop-blur"
          aria-label={`Рівень гостроти: ${spicyLevel.label}`}
        >
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {Array.from({ length: spicyLevel.peppers }).map((_, index) => (
              <FaPepperHot
                key={index}
                size={12}
                className={
                  isNotSpicy
                    ? "text-muted-foreground opacity-40"
                    : "text-spicy"
                }
              />
            ))}
          </span>
          {showLabel && <span>{spicyLevel.label}</span>}
        </Badge>
      </TooltipTrigger>

      <TooltipContent>
        <p>{spicyLevel.label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SpicyLevelBadge;
