import { useState, useEffect } from "react";

export function useAdminTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("pneumo_theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("pneumo_theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, setDark };
}