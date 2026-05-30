import { Outlet } from "react-router-dom";
import { useAdminTheme } from "../context/Useadmintheme";
import Topbar from "../componentAdmin/Topbar";
import Sidebar from "../componentAdmin/Sidebar";

export default function AdminLayout() {
  const { dark, setDark } = useAdminTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f7] dark:bg-[#0d1117]">
      <Sidebar dark={dark} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar dark={dark} setDark={setDark} />
        <main className="flex-1 overflow-y-auto p-5 bg-[#eef2f7] dark:bg-[#0d1117]">
          <Outlet context={{ dark }} />
        </main>
      </div>
    </div>
  );
}