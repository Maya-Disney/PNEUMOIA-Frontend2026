import React, { useState } from "react";
import useAdminTheme from "../hooks/useAdminTheme";
import useAdminStats from "../hooks/useAdminStats";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WelcomeBanner from "../components/WelcomeBanner";
import StatsCards from "../components/StatsCards";
import InscriptionsUrgentes from "../components/InscriptionsUrgentes";
import ActivityChart from "../components/ActivityChart";
import GeographicMap from "../components/GeographicMap";

export default function AdminDashboard() {
  const { darkMode, setDarkMode } = useAdminTheme();
  const { stats, loading: statsLoading } = useAdminStats();
  const [activeKey, setActiveKey] = useState("dashboard");
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`h-screen flex admin-theme ${
      darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <Sidebar
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        darkMode={darkMode}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar darkMode={darkMode} setDarkMode={setDarkMode} setMobileOpen={setMobileOpen} />

        <div className="flex-1 overflow-y-auto">
        <div className="px-3 sm:px-4 pt-3">
          <WelcomeBanner darkMode={darkMode} />
        </div>

        <main className="flex-1 px-3 sm:px-4 py-3">
          <div className="mb-3">
            <StatsCards darkMode={darkMode} stats={stats} loading={statsLoading} />
          </div>

          <div className="mt-3">
            <ActivityChart darkMode={darkMode} />
          </div>

          <div className="mt-3">
            <GeographicMap darkMode={darkMode} compact />
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
