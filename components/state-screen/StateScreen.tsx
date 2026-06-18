interface Props {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const StateScreen = ({ title, description, action }: Props) => {
  return (
    <div className="py-12 text-center space-y-3">
      <h2 className="font-medium">{title ?? "Something went wrong"}</h2>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default StateScreen;
