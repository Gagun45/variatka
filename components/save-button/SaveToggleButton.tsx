import clsx from "clsx";
import { Bookmark } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  onToggle: () => void;
  isSaved: boolean;
  className?: string;
}

const SaveToggleButton = ({ onToggle, isSaved, className }: Props) => {
  return (
    <Button
      onClick={onToggle}
      variant="ghost"
      size="icon"
      className={`group shrink-0 rounded-full hover:bg-yellow-50 ${className}`}
    >
      <Bookmark
        className={clsx(
          "size-5 transition-all duration-200 group-hover:scale-110",
          isSaved
            ? "fill-yellow-400 text-yellow-500"
            : "text-muted-foreground group-hover:text-yellow-500",
        )}
      />
    </Button>
  );
};

export default SaveToggleButton;
