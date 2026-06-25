import { INextUser } from "@/lib/types";

interface Props {
  user: INextUser;
}

const Profile = ({ user }: Props) => {
  const { email, name } = user;
  return (
    <div className="flex flex-col gap-4">
      <p>Email - {email}</p>
      <p>Name - {name}</p>
    </div>
  );
};

export default Profile;
