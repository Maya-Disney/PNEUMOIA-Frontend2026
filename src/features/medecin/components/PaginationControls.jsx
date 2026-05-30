// src/features/medecin/components/PaginationControls.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
 
export function PaginationControls({
  currentPage,
  totalPages,
  startIndex,
  itemsPerPage,
  totalItems,
  onPageChange,
}) {
  if (totalPages <= 1) return null;
 
  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
      <p className="text-sm text-gray-500">
        {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} sur{' '}
        {totalItems} patients
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
 
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} / {totalPages}
        </span>
 
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}