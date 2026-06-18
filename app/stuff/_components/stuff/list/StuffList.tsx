import { IStuff } from "@/lib/prisma.args";
import StuffCard from "./card/StuffCard";

interface Props {
  stuff: IStuff[];
}

const StuffList = ({ stuff }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stuff.map((st) => (
        <StuffCard key={st.id} stuff={st} />
      ))}
    </div>
  );
};

export default StuffList;
