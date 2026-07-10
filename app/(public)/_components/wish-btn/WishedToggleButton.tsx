import IconButton from "@/components/icon-button/IconButton";
import clsx from "clsx";
import { Bookmark } from "lucide-react";

interface Props {
  onToggle: () => void;
  isWished: boolean;
  className?: string;
}

const WishedToggleButton = ({ onToggle, isWished, className }: Props) => {
  return (
    <IconButton
      variant="ghost"
      size="icon"
      onClick={onToggle}
      label={isWished ? "Remove from wishlist" : "Add to wishlist"}
      className={`${className} group shrink-0 rounded-full hover:bg-favorite/10`}
    >
      <Bookmark
        className={clsx(
          "size-5 transition-all duration-200 group-hover:scale-110",
          isWished
            ? "fill-favorite text-favorite"
            : "text-muted-foreground group-hover:text-favorite",
        )}
      />
    </IconButton>
  );
};

export default WishedToggleButton;
