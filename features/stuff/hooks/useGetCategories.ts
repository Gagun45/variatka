import { useQuery } from "@tanstack/react-query";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useStuffCategories = () => {
  return useQuery({
    queryKey: stuffKeys.categories,
    queryFn: stuffService.getCategories,
  });
};
