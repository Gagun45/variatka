import { CircleAlert } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const StateScreen = ({
  title,
  description,
  action,
  icon = <CircleAlert />,
}: Props) => {
  return (
    <div className="flex min-h-64 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border bg-card/50 px-6 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>

        <h2 className="text-lg font-semibold tracking-tight">
          {title ?? "Something went wrong"}
        </h2>

        {description && (
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
};

export default StateScreen;
