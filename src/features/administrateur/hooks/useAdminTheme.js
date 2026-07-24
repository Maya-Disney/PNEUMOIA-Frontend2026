import { useEffect, useState } from "react";

const ADMIN_THEME_KEY = "pneumoia-admin-theme";

export default function useAdminTheme(defaultValue = false) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    const storedTheme = window.localStorage.getItem(ADMIN_THEME_KEY);
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_THEME_KEY, darkMode ?"dark" : "light");
  }, [darkMode]);

  return { darkMode, setDarkMode };
}
