import { ClipLoader } from "react-spinners";
const Loader = () => {
  return (
    <div className="p-2 flex justify-center">
      <ClipLoader size={40} color="#333" />
    </div>
  );
};

export default Loader;
