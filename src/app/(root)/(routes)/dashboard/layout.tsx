const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen bg-[#0F0F13] dark">
      {children}
    </div>
  );
};

export default DashboardLayout;
