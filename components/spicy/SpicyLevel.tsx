import { FaPepperHot } from "react-icons/fa";

type Props = {
  level: number; // 0–4
};

const SpicyLevel = ({ level }: Props) => {
  if (level === 0) return null;

  // level 1 => 1 dim pepper
  const count = level === 1 ? 1 : level - 1;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <FaPepperHot
          key={i}
          className={
            level === 1 ? "text-muted-foreground opacity-40" : "text-red-500"
          }
          size={12}
        />
      ))}
    </div>
  );
};

export default SpicyLevel;
