import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "admin_pending_notifications_count";
const UPDATE_EVENT = "admin-notifications-updated";

/**
 * Parse une valeur en nombre entier positif ou zéro
 */
function parseCount(value) {
  const num = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

/**
 * Lit la valeur depuis localStorage
 */
function readStoredCount() {
  if (typeof window === "undefined") return 0;
  return parseCount(window.localStorage.getItem(STORAGE_KEY));
}

/**
 * Écrit dans localStorage et notifie les autres onglets
 */
function writeStoredCount(nextCount) {
  if (typeof window === "undefined") return;

  const safeCount = parseCount(nextCount);
  window.localStorage.setItem(STORAGE_KEY, String(safeCount));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: safeCount }));
}

export default function useAdminNotificationCount() {
  const [count, setCount] = useState(() => readStoredCount());

  // Synchronisation entre les onglets
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      setCount(readStoredCount());
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(UPDATE_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(UPDATE_EVENT, syncFromStorage);
    };
  }, []);

  // Mise à jour améliorée (accepte valeur ou fonction)
  const updateCount = useCallback((nextCount) => {
    if (typeof nextCount === "function") {
      setCount((currentCount) => {
        const newCount = nextCount(currentCount);
        writeStoredCount(newCount);
        return newCount;
      });
    } else {
      writeStoredCount(nextCount);
      setCount(parseCount(nextCount));
    }
  }, []);

  return {
    count,
    setCount: updateCount,
  };
}