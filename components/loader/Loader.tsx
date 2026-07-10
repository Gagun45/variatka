import { ClipLoader } from "react-spinners";
const Loader = () => {
  return (
    <div className="p-2 flex justify-center">
      <ClipLoader size={40} color="var(--foreground)" />
    </div>
  );
};

export default Loader;
