import { useMemo } from 'react';
import { PATIENTS_DATA } from '../data/patientsData';
 
export function usePatientFilters(searchTerm, statusFilter, pathologyFilter) {
  return useMemo(() => {
    const patientsArray = Object.values(PATIENTS_DATA);
    return patientsArray.filter((patient) => {
      const matchSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.pathologyShort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.city.toLowerCase().includes(searchTerm.toLowerCase());
 
      const matchStatus = statusFilter === 'Tous' || patient.status === statusFilter;
      const matchPathology =
        pathologyFilter === 'Toutes' || patient.pathologyShort === pathologyFilter;
 
      return matchSearch && matchStatus && matchPathology;
    });
  }, [searchTerm, statusFilter, pathologyFilter]);
}
 
