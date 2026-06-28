"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import StuffView from "./view/StuffView";

interface Props {
  id: number;
}

const Stuff = ({ id }: Props) => {
  const { data: stuff, isLoading, isError } = useStuff();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !stuff) {
    return <StateScreen />;
  }
  const singleStuff = stuff.find((s) => s.id === id);
  if (!singleStuff) return <StateScreen title="Stuff not found" />;
  return (
    <>
      <h1>{singleStuff.title}</h1>
      <StuffView stuff={singleStuff} />
    </>
  );
};

export default Stuff;
