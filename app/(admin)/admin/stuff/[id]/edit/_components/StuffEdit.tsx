"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEditStuff } from "@/features/stuff/hooks/useEditStuff";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import StuffForm from "@/forms/stuff/StuffForm";
import { frontendUrls } from "@/lib/urls";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteStuff from "../../_components/delete/DeleteStuff";

interface Props {
  id: number;
}

const StuffEdit = ({ id }: Props) => {
  const router = useRouter();

  const {
    data: stuff,
    isLoading: isStuffLoading,
    isError: isStuffError,
  } = useStuff();
  const { mutate, isPending } = useEditStuff();
  if (isStuffLoading) return <Loader />;
  if (isStuffError || !stuff)
    return (
      <StateScreen
        title="We couldn't load this item"
        description="Please refresh the page and try again."
      />
    );
  const singleStuff = stuff.find((s) => s.id === id);
  if (!singleStuff)
    return (
      <StateScreen
        title="Item not found"
        description="It may have been removed or the link is incorrect."
        icon={<SearchX />}
      />
    );
  const onSubmit = (dto: ICreateStuffDto) => {
    mutate(
      {
        dto,
        id,
      },
      {
        onSuccess: () => {
          router.push(frontendUrls.stuff.index);
        },
      },
    );
  };

  return (
    <div className="space-y-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Basic information</CardTitle>
        </CardHeader>
        <Separator />

        <CardContent>
          <StuffForm
            isPending={isPending}
            onClick={onSubmit}
            stuff={singleStuff}
          />
        </CardContent>
      </Card>

      <DeleteStuff id={id} />
    </div>
  );
};

export default StuffEdit;
