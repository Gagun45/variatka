interface Props {
  description: string | null;
}

const ViewItemDescription = ({ description }: Props) => {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {description ? (
        description
      ) : (
        <span className="italic">No description yet</span>
      )}
    </p>
  );
};

export default ViewItemDescription;
