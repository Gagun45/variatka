import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useMe } from "@/features/user/hooks/useMe";
import React from "react";

const Profile = () => {
  const { data: me, isLoading, isError } = useMe();
  if (isLoading) return <Loader />;
  if (!me || isError) return <StateScreen />;
  return <div>Profile - {me.name}</div>;
};

export default Profile;
