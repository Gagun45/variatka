interface Props {
  amount: number;
  searchQuery: string;
}

const ResultsFoundText = ({ amount, searchQuery }: Props) => {
  return (
    <p className="text-sm text-muted-foreground">
      {amount} results found
      {searchQuery.trim() && <span> including &quot;{searchQuery}&quot;</span>}
    </p>
  );
};

export default ResultsFoundText;
