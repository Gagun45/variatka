import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "../category.keys";
import { categoryService } from "../category.api";

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.categories,
    queryFn: categoryService.get,
  });
};
