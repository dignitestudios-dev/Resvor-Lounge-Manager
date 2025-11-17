import Sidebar from "@/components/global/Sidebar";
import Topbar from "@/components/global/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="w-full flex gap-4 h-screen">
      <div className="py-6 pl-6">
        <Sidebar />
      </div>
      <div className="py-6 pr-6 flex flex-col flex-1 h-full overflow-hidden">
        <Topbar />
        <div className="w-full flex-1 flex flex-col gap-5 overflow-y-auto py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
