import { useState, useEffect } from "react";

export function useAdminTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("pneumo_theme");
    // Si rien en localStorage → light par défaut
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("pneumo_theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Applique aussi au premier rendu
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  return { dark, setDark };
}