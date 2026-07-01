import { IUser } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Props {
  user: IUser;
}

const ProfileView = ({ user }: Props) => {
  return (
    <Card className="border-muted max-w-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Account Details
        </CardTitle>
        <CardDescription>
          Manage your profile and default shipping settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 text-sm">
        {/* Basic Account Info */}
        <dl className="space-y-4">
          <InfoRow label="Email" value={user.email} />
          <Separator />
          <InfoRow label="Name" value={user.name} />
        </dl>

        {/* Checkout Defaults Section */}
        <div className="rounded-lg bg-muted/40 p-4 border border-muted/60 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Checkout Defaults
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These values pre-fill your order form and can be modified during
              checkout.
            </p>
          </div>

          <Separator className="bg-muted-foreground/10" />

          <dl className="space-y-4">
            <InfoRow
              label="Default Name"
              value={user.orderName}
              fallback="Not set"
            />
            <Separator className="bg-muted-foreground/10" />
            <InfoRow
              label="Default Phone"
              value={user.orderPhone}
              fallback="Not set"
            />
            <Separator />
          </dl>
        </div>
      </CardContent>
    </Card>
  );
};

// Clean, local helper to keep the main JSX readable
interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  fallback?: string;
}

const InfoRow = ({ label, value, fallback = "—" }: InfoRowProps) => {
  const displayValue = value?.trim() ? value : fallback;
  const isFallback = displayValue === fallback;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
      <dt className="text-xs text-muted-foreground font-medium">{label}</dt>
      <dd
        className={`font-medium ${isFallback ? "text-muted-foreground/60 italic font-normal" : "text-foreground"}`}
      >
        {displayValue}
      </dd>
    </div>
  );
};

export default ProfileView;
