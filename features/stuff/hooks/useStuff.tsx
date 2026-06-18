import { useQuery } from "@tanstack/react-query";
import { stuffKeys } from "../stuff.keys";
import { stuffService } from "../stuff.api";

export const useStuff = () => {
  return useQuery({
    queryKey: stuffKeys.stuff,
    queryFn: stuffService.get,
  });
};
