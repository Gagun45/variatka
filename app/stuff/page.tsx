import StuffDashboard from "./_components/stuff/StuffDashboard";

const StuffPage = () => {
  return (
    <main>
      <div className="flex items-center justify-center">
        <h1 className="text-4xl tracking-widest font-bold">Stuff</h1>
      </div>
      <StuffDashboard />
    </main>
  );
};

export default StuffPage;
