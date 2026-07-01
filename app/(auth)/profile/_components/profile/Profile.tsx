"use client";

import { Button } from "@/components/ui/button";
import { IUser } from "@/lib/types";
import { useState } from "react";
import ProfileView from "./view/ProfileView";
import UserProfileForm from "@/forms/user/profile/UserProfileForm";

interface Props {
  user: IUser;
}

const Profile = ({ user }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Profile</h2>

        <Button
          variant={isEditing ? "outline" : "default"}
          size="sm"
          onClick={() => setIsEditing((v) => !v)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {/* BODY */}
      {!isEditing ? (
        <ProfileView user={user} />
      ) : (
        <UserProfileForm
          isPending={false}
          onCreate={() => {
            console.log();
          }}
          user={user}
        />
      )}
    </div>
  );
};

export default Profile;
