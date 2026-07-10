import clsx from "clsx";
import { Bookmark } from "lucide-react";
import IconButton from "../icon-button/IconButton";

interface Props {
  onToggle: () => void;
  isSaved: boolean;
  className?: string;
}

const SaveToggleButton = ({ onToggle, isSaved, className }: Props) => {
  return (
    <IconButton
      onClick={onToggle}
      variant="ghost"
      size="icon"
      label={isSaved ? "Unsave" : "Save"}
      className={`group shrink-0 rounded-full hover:bg-favorite/10 ${className}`}
    >
      <Bookmark
        className={clsx(
          "size-5 transition-all duration-200 group-hover:scale-110",
          isSaved
            ? "fill-favorite text-favorite"
            : "text-muted-foreground group-hover:text-favorite",
        )}
      />
    </IconButton>
  );
};

export default SaveToggleButton;
