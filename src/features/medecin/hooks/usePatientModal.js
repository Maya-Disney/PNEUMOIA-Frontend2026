// src/features/medecin/hooks/usePatientModal.js
import { useCallback } from 'react';
 
export function usePatientModal(dispatch) {
  const openModal = useCallback(
    (patient) => dispatch({ type: 'OPEN_MODAL', payload: patient }),
    [dispatch]
  );
 
  const closeModal = useCallback(
    () => dispatch({ type: 'CLOSE_MODAL' }),
    [dispatch]
  );
 
  const setEditMode = useCallback(
    () => dispatch({ type: 'SET_EDIT_MODE' }),
    [dispatch]
  );
 
  return { openModal, closeModal, setEditMode };
}
 