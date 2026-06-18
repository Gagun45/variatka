import React from "react";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import clsx from "clsx";

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
      className={`group shrink-0 rounded-full hover:bg-red-50 ${className}`}
    >
      <Heart
        className={clsx(
          "size-5 transition-all duration-200 group-hover:scale-110",
          isSaved
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground group-hover:text-red-500",
        )}
      />
    </Button>
  );
};

export default SaveToggleButton;
