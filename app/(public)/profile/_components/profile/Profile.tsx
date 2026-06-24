import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useMe } from "@/features/user/hooks/useMe";

const Profile = () => {
  const { data: me, isLoading, isError } = useMe();
  if (isLoading) return <Loader />;
  if (!me || isError) return <StateScreen />;
  return (
    <div className="flex flex-col gap-4">
      <p>Email - {me.email}</p>
      <p>Name - {me.name}</p>
    </div>
  );
};

export default Profile;
