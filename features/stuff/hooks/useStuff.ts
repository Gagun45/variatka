import { useQuery } from "@tanstack/react-query";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useStuff = () =>
  useQuery({
    queryKey: stuffKeys.stuff,
    queryFn: stuffService.get,
  });
