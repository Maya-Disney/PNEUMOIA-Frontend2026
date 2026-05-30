// src/features/medecin/hooks/usePatientsStats.js
import { useMemo } from 'react';
import { PATIENTS_DATA } from '../data/patientsData';
 
export function usePatientsStats() {
  return useMemo(() => {
    const patientsArray = Object.values(PATIENTS_DATA);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
 
    return {
      total: patientsArray.length,
      consultationsMonth: patientsArray.filter((p) => {
        const lastVisit = new Date(p.lastVisit);
        return lastVisit >= thirtyDaysAgo;
      }).length,
      urgent: patientsArray.filter((p) => p.status === 'Urgent').length,
      shared: patientsArray.filter((p) => p.shareAccess?.length > 0).length,
    };
  }, []);
}