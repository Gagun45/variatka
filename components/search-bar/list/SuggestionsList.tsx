import { buttonVariants } from "@/components/ui/button";
import { getSearchItemHref } from "@/lib/urls";
import { ISearchBarItem } from "@/zustand/search.store";
import Link from "next/link";

interface Props {
  title: string;
  items: ISearchBarItem[];
  onSelect: (item: ISearchBarItem) => void;
}

const SuggestionsList = ({ items, title, onSelect }: Props) => {
  if (!items.length) return null;
  return (
    <div className="overflow-hidden">
      <p className="mb-2 text-xs text-muted-foreground">{title}</p>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={getSearchItemHref(item)}
            className={buttonVariants({
              variant: "ghost",
              className: "break-all",
            })}
            onClick={() => onSelect(item)}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsList;
