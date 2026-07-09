"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { IUser } from "@/lib/types";
import { useState } from "react";
import ProfileView from "./view/ProfileView";
import UserProfileForm from "@/forms/user/profile/UserProfileForm";
import { useUpdateProfile } from "@/features/user/hooks/useUpdateProfile";
import { IUpdateUserProfileDto } from "@/zod/user.schema";
import { Pencil, X } from "lucide-react";

interface Props {
  user: IUser;
}

const Profile = ({ user }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdateProfile();
  const onUpdate = (dto: IUpdateUserProfileDto) => {
    mutate(dto, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="mx-auto w-full max-w-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="gap-4 border-b bg-muted/20 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary ring-1 ring-primary/15">
            {initials || user.email[0]?.toUpperCase()}
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Account profile
            </p>
            <h2 className="truncate text-xl font-semibold leading-tight">
              {user.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <CardAction className="static col-auto row-auto self-center justify-self-start sm:justify-self-end">
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing((v) => !v)}
            disabled={isPending}
          >
            {isEditing ? <X /> : <Pencil />}
            {isEditing ? "Cancel" : "Edit profile"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        {!isEditing ? (
          <ProfileView user={user} />
        ) : (
          <UserProfileForm
            isPending={isPending}
            onSubmit={onUpdate}
            user={user}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Profile;
