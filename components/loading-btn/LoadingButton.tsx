import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";

type LoadingButtonProps = {
  isPending: boolean;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>;

export const LoadingButton = ({
  isPending,
  children,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button disabled={isPending} {...props}>
      {isPending ? <BarLoader /> : children}
    </Button>
  );
};
