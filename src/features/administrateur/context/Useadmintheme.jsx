import { createContext, useContext, useState } from "react";

const AdminThemeCtx = createContext({ dark: false, setDark: () => {} });

export function AdminThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  return <AdminThemeCtx.Provider value={{ dark, setDark }}>{children}</AdminThemeCtx.Provider>;
}

export function useAdminTheme() {
  return useContext(AdminThemeCtx);
}
