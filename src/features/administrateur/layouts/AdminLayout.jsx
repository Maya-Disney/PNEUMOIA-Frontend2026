import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import '../admin.css';
import { AdminThemeProvider, useAdminTheme } from "../context/useAdminTheme";
import Sidebar from "../componentAdmin/Sidebar";
import Topbar from "../componentAdmin/Topbar";
import { getSurface } from "../theme";

function AdminLayoutInner() {
  const { dark, setDark } = useAdminTheme();
  const surface = getSurface(dark);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    html.classList.remove('dark');
    return () => { if (wasDark) html.classList.add('dark'); };
  }, []);

  return (
    <div className="admin-theme min-h-screen" style={{ background: surface.bg }}>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — drawer mobile / fixe desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
        style={{ width: 260 }}
      >
        <Sidebar dark={dark} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-65 flex flex-col min-h-screen">
        <Topbar
          dark={dark}
          setDark={setDark}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ background: surface.bg }}
        >
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
