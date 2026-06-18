"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useStuffCategories } from "@/features/stuff/hooks/useGetCategories";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import StuffView from "./view/StuffView";

interface Props {
  id: number;
}

const Stuff = ({ id }: Props) => {
  const { data: categories } = useStuffCategories();
  const { data: stuff, isLoading, isError } = useStuff();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !stuff || !categories) {
    return (
      <StateScreen
        title="Couldn't load this stuff"
        description="Please try again in a moment."
      />
    );
  }
  const singleStuff = stuff.find((s) => s.id === id);
  if (!singleStuff) return <StateScreen title="Stuff not found" />;
  return (
    <>
      <StuffView stuff={singleStuff} />
    </>
  );
};

export default Stuff;
