import { IUser } from "@/lib/types";
import AccountDetailsSection from "./sections/AccountDetailsSection";
import CheckoutDefaultsSection from "./sections/CheckoutDefaultsSection";

interface Props {
  user: IUser;
}

const ProfileView = ({ user }: Props) => {
  return (
    <div className="space-y-6 text-sm">
      <AccountDetailsSection user={user} />
      <CheckoutDefaultsSection user={user} />
    </div>
  );
};

export default ProfileView;
