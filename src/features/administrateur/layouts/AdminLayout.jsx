import { Outlet } from "react-router-dom";
import '../admin.css';
import { AdminThemeProvider, useAdminTheme } from "../context/useAdminTheme";
import Sidebar from "../componentAdmin/Sidebar";
import Topbar from "../componentAdmin/Topbar";

function AdminLayoutInner() {
  const { dark, setDark } = useAdminTheme();

  return (
    <div className={`admin-theme flex h-screen overflow-hidden ${dark ? "bg-[#0d1117]" : "bg-[#f5f7f6]"}`} style={{ minWidth: 0 }}>
      <Sidebar dark={dark} />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ minWidth: 0 }}>
        <Topbar dark={dark} setDark={setDark} />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${dark ? "bg-[#0d1117]" : "bg-[#f5f7f6]"}`}>
          <Outlet context={{ dark }} />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  );
}