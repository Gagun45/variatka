import { Separator } from "@/components/ui/separator";
import { IUser } from "@/lib/types";
import { Mail, UserRound } from "lucide-react";
import InfoRow from "../shared/InfoRow";
import SectionHeader from "../shared/SectionHeader";

interface Props {
  user: IUser;
}

export default function AccountDetailsSection({ user }: Props) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Account details"
        description="Your sign-in email and public display name."
      />

      <dl className="overflow-hidden rounded-lg border border-border/70">
        <InfoRow icon={Mail} label="Email address" value={user.email} />
        <Separator />
        <InfoRow icon={UserRound} label="Display name" value={user.name} />
      </dl>
    </section>
  );
}
