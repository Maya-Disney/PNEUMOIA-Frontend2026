import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZES = [5, 10, 20, 50];

function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
  return [1, '…', current-1, current, current+1, '…', total];
}

/**
 * Pagination bar — deux variantes de style :
 *   • admin  : passer dark={true|false}   (couleurs hex admin)
 *   • médecin: ne pas passer dark          (CSS vars --sf/--ln/--t*)
 */
export function TablePagination({ total, page, pageSize, onPageChange, onPageSizeChange, dark }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);
  const pages = getPages(page, totalPages);
  const isAdmin = dark !== undefined;

  const s = isAdmin ? {
    wrap:     `flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t ${dark ? 'border-[#21262d]' : 'border-gray-100'}`,
    text:     `text-[11px] ${dark ? 'text-[#484f58]' : 'text-gray-400'}`,
    sel:      `px-2 py-1 rounded-lg border text-[11px] font-medium focus:outline-none ${dark ? 'bg-[#0d1117] border-[#21262d] text-[#8b949e]' : 'bg-white border-gray-200 text-gray-600'}`,
    btn:      'w-7 h-7 flex items-center justify-center rounded-lg border transition-colors text-[10px] font-bold',
    active:   'border-teal-500 bg-teal-500 text-white',
    inactive: dark ? 'border-[#21262d] text-[#484f58] hover:bg-[#21262d] hover:text-white' : 'border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700',
    off:      'opacity-30 cursor-not-allowed border-transparent text-inherit',
    dot:      `w-5 text-center select-none text-[11px] ${dark ? 'text-[#484f58]' : 'text-gray-300'}`,
  } : {
    wrap:     'flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-(--ln)',
    text:     'text-xs text-(--t3)',
    sel:      'px-2 py-1 rounded-lg border border-(--ln) bg-(--sf) text-(--t2) text-xs font-medium focus:outline-none',
    btn:      'w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors',
    active:   'border-blue-500 bg-blue-600 text-white',
    inactive: 'border-(--ln) text-(--t3) hover:bg-(--sf2)',
    off:      'opacity-30 cursor-not-allowed border-transparent text-inherit',
    dot:      'w-5 text-center select-none text-xs text-(--t4)',
  };

  return (
    <div className={s.wrap}>
      {/* Lignes par page + compteur */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={s.text}>Lignes par page</span>
        <select
          value={pageSize}
          onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className={s.sel}
        >
          {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className={s.text}>{from}–{to} sur {total}</span>
      </div>

      {/* Boutons de navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${s.btn} ${page <= 1 ? s.off : s.inactive}`}
        >
          <ChevronLeft size={12} />
        </button>

        {pages.map((p, i) =>
          p === '…'
            ? <span key={`d${i}`} className={s.dot}>…</span>
            : <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`${s.btn} ${p === page ? s.active : s.inactive}`}
              >
                {p}
              </button>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${s.btn} ${page >= totalPages ? s.off : s.inactive}`}
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
