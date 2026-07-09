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
    </IconButton>
  );
};

export default SaveToggleButton;
