import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { Bookmark } from "lucide-react";

interface Props {
  onToggle: () => void;
  isWished: boolean;
  className?: string;
}

const WishedToggleButton = ({ onToggle, isWished, className }: Props) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`${className} group shrink-0 rounded-full hover:bg-red-50`}
    >
      <Bookmark
        className={clsx(
          "size-5 transition-all duration-200 group-hover:scale-110",
          isWished
            ? "fill-yellow-400 text-yellow-500"
            : "text-muted-foreground group-hover:text-yellow-500",
        )}
      />
    </Button>
  );
};

export default WishedToggleButton;
