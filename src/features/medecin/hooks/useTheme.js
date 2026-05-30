// src/features/medecin/hooks/useTheme.js
import { useState, useEffect } from 'react';
 
const THEME_KEY = 'pneumoia-theme';
 
export function useTheme() {
  const [theme, setTheme] = useState('light');
 
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      applyTheme('dark');
    }
  }, []);
 
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  };
 
  return { theme, toggleTheme };
}
 
function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
 
