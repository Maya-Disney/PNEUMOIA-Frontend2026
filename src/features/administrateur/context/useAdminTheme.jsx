import { createContext, useContext, useState } from "react";

const AdminThemeCtx = createContext({ dark: false, setDark: () => {}, searchQuery: "", setSearchQuery: () => {} });

export function AdminThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  return <AdminThemeCtx.Provider value={{ dark, setDark, searchQuery, setSearchQuery }}>{children}</AdminThemeCtx.Provider>;
}

export function useAdminTheme() {
  return useContext(AdminThemeCtx);
}
