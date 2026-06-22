interface Props {
  categoryTitle: string;
}

const ViewItemCategory = ({ categoryTitle }: Props) => {
  return (
    <div className="text-sm text-muted-foreground">
      Category:{" "}
      <span className="text-foreground font-medium">{categoryTitle}</span>
    </div>
  );
};

export default ViewItemCategory;
