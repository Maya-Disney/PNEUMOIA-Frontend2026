import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../componentAdmin/Sidebar";
import Topbar  from "../componentAdmin/Topbar";
import { useAdminTheme } from "../context/Useadmintheme";

export default function AdminLayout() {
  const { dark, setDark } = useAdminTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? "dark" : ""}`}>
      <Sidebar dark={dark} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Topbar dark={dark} setDark={setDark} setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-y-auto p-5 bg-gray-50 dark:bg-gray-900">
          <Outlet context={{ dark }} />
        </main>
      </div>
    </div>
  );
}
