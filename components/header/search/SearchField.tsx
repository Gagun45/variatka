import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { ComponentProps } from "react";

type SearchFieldProps = ComponentProps<typeof InputGroupInput> & {
  submitButton?: boolean;
};

const SearchField = ({ submitButton = false, ...props }: SearchFieldProps) => {
  return (
    <InputGroup className="h-9 border-accent bg-background/80 shadow-surface">
      <InputGroupInput type="search" aria-label="Пошук" {...props} />
      <InputGroupAddon align="inline-end">
        {submitButton ? (
          <InputGroupButton
            type="submit"
            size="icon-xs"
            aria-label="Виконати пошук"
          >
            <Search />
          </InputGroupButton>
        ) : (
          <Search aria-hidden="true" />
        )}
      </InputGroupAddon>
    </InputGroup>
  );
};

export default SearchField;
