"use client";

import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryButton = ({ title, isActive, onClick }: Props) => {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
      className="min-w-36 text-xl h-12"
    >
      {title}
    </Button>
  );
};

export default CategoryButton;
