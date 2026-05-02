import Sidebar from "@/components/layout/SideBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-row">
      <Sidebar />

      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  );
}
