"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import StuffTabs from "./tabs/StuffTabs";

const StuffDashboard = () => {
  const {
    data: stuff,
    isLoading: isStuffLoading,
    isError: isStuffError,
  } = useStuff();

  if (isStuffLoading) {
    return <Loader />;
  }

  if (isStuffError || !stuff) {
    return <StateScreen />;
  }

  return <StuffTabs stuff={stuff} />;
};

export default StuffDashboard;
