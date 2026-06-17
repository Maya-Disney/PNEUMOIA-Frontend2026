// src/features/administrateur/pages/PatientsSupprimesAdmin.jsx
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Trash2, RotateCcw, AlertTriangle, X, Loader2, Clock,
  CheckCircle2, Info, User,
} from 'lucide-react';
import { brand, status, getSurface, getText } from '../theme';
import {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell,
  MutedText, SubtleText, TableActionButton,
  PaginationBar, PaginationSelect, PaginationButton,
} from '../Table';
import { getPatientsSupprimesAdmin, restaurerPatientSupprime } from '../api/adminApi';

// ── Mocks (remplacés dès que l'API renvoie des données) ──────────────────────
const MOCKS = [
  {
    id: "MOCK001",
    civilite: "M.",
    prenom: "Jean-Baptiste",
    nom: "MBALLA",
    deleted_at: new Date(Date.now() - 32 * 86400000).toISOString(),
    jours_ecoules: 32,
    jours_restants: 8,
    medecin: "Dr. Sophie KAMGA",
    medecin_id: "MED001",
  },
  {
    id: "MOCK002",
    civilite: "Mme",
    prenom: "Aïcha",
    nom: "FOUDA BELINGA",
    deleted_at: new Date(Date.now() - 37 * 86400000).toISOString(),
    jours_ecoules: 37,
    jours_restants: 3,
    medecin: "Dr. Paul NKOLO",
    medecin_id: "MED002",
  },
  {
    id: "MOCK003",
    civilite: "M.",
    prenom: "Hervé",
    nom: "TCHANGANI",
    deleted_at: new Date(Date.now() - 31 * 86400000).toISOString(),
    jours_ecoules: 31,
    jours_restants: 9,
    medecin: "Dr. Marie ESSOMBA",
    medecin_id: "MED003",
  },
];

const pad = n => String(n).padStart(2, '0');
function fmt(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

function couleurDelai(j) {
  if (j <= 3) return { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
  if (j <= 6) return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
  return             { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
}

const selCls = "text-[13px] px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors";

export default function PatientsSupprimesAdmin() {
  const { dark } = useOutletContext() || {};
  const surface  = getSurface(dark);
  const txt      = getText(dark);

  const [rows,         setRows]         = useState(MOCKS);
  const [loading,      setLoading]      = useState(false);
  const [restoreModal, setRestoreModal] = useState(null);
  const [actionLoad,   setActionLoad]   = useState(null);
  const [toast,        setToast]        = useState(null);
  const [page,         setPage]         = useState(1);
  const [perPage,      setPerPage]      = useState(10);
  const [filtreMed,    setFiltreMed]    = useState('');

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setLoading(true);
    getPatientsSupprimesAdmin()
      .then(data => { if (Array.isArray(data) && data.length > 0) setRows(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [filtreMed]);

  const medecins = [...new Set(rows.map(r => r.medecin).filter(Boolean))];

  const filtered = rows.filter(r =>
    !filtreMed || r.medecin === filtreMed
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, filtered.length);

  const urgences = rows.filter(r => r.jours_restants <= 3);

  const handleRestore = async (item) => {
    setActionLoad(item.id);
    try {
      await restaurerPatientSupprime(item.id);
      setRows(prev => prev.filter(r => r.id !== item.id));
      setRestoreModal(null);
      showToast('Dossier patient restauré avec succès');
    } catch (e) {
      showToast(e.message || 'Échec de la restauration', false);
    } finally {
      setActionLoad(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: status.danger.bg }}>
            <Trash2 size={19} color="#dc2626" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: txt.primary }}>
              Patients supprimés
            </h1>
            <p className="text-[15px] mt-0.5" style={{ color: txt.muted }}>
              {rows.length} dossier{rows.length > 1 ? 's' : ''} en phase administrative · suppression définitive à J40
            </p>
          </div>
        </div>
      </div>

      {/* ── Bandeau urgence ── */}
      {urgences.length > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border"
          style={{ borderColor: status.danger.border, background: status.danger.bg }}>
          <AlertTriangle size={17} className="shrink-0 mt-0.5" style={{ color: status.danger.text }} />
          <div>
            <p className="text-[15px] font-bold" style={{ color: status.danger.text }}>
              {urgences.length} dossier{urgences.length > 1 ? 's' : ''} expire{urgences.length > 1 ? 'nt' : ''} dans moins de 3 jours
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: status.danger.text }}>
              Restaurez-les avant la suppression définitive.
            </p>
          </div>
        </div>
      )}

      {/* ── Bandeau info ── */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border"
        style={{
          borderColor: dark ? 'rgba(59,130,246,0.25)' : '#bfdbfe',
          background:  dark ? 'rgba(59,130,246,0.07)' : '#eff6ff',
        }}>
        <Info size={15} className="shrink-0 mt-0.5" style={{ color: dark ? '#93c5fd' : '#2563eb' }} />
        <ul className="text-[13px] space-y-0.5" style={{ color: dark ? '#93c5fd' : '#1e40af' }}>
          <li><strong>J30 – J40 :</strong> Dossier sous garde administrative — restauration possible sur demande du médecin.</li>
          <li><strong>Après J40 :</strong> Suppression définitive et irrécupérable de la base de données.</li>
        </ul>
      </div>

      {/* ── Tableau ── */}
      <TableCard dark={dark}>

        {/* Filtres */}
        <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b" style={{ borderColor: surface.border }}>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium" style={{ color: txt.subtle }}>Médecin :</span>
            <select
              value={filtreMed}
              onChange={e => setFiltreMed(e.target.value)}
              className={selCls}
              style={{ background: surface.card, borderColor: surface.border, color: txt.secondary }}
            >
              <option value="">Tous les médecins</option>
              {medecins.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {filtreMed && (
            <button
              onClick={() => setFiltreMed('')}
              className="text-[13px] font-medium px-3 py-1.5 rounded-xl border transition-colors"
              style={{ borderColor: surface.border, color: txt.subtle }}>
              Réinitialiser
            </button>
          )}
          <span className="ml-auto text-[13px]" style={{ color: txt.subtle }}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <TableContainer dark={dark}>
          <thead>
            <tr>
              <Th dark={dark}>#</Th>
              <Th dark={dark}>Patient</Th>
              <Th dark={dark}>Médecin responsable</Th>
              <Th dark={dark}>Supprimé le</Th>
              <Th dark={dark}>Avancement</Th>
              <Th dark={dark}>Délai restant</Th>
              <Th dark={dark} style={{ width: 110 }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Loader2 size={22} className="animate-spin mx-auto" style={{ color: brand.DEFAULT }} />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <EmptyCell dark={dark} colSpan={7}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: surface.bg }}>
                    <Trash2 size={22} style={{ color: surface.border }} />
                  </div>
                  <p>Aucun dossier patient en phase administrative</p>
                </div>
              </EmptyCell>
            ) : paginated.map((r, i) => {
              const clr   = couleurDelai(r.jours_restants);
              const pct   = Math.min(((r.jours_ecoules - 30) / 10) * 100, 100);
              const rank  = (page - 1) * perPage + i + 1;

              return (
                <Tr key={r.id} dark={dark}>

                  {/* # */}
                  <Td dark={dark}>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: txt.muted }}>
                      {rank}
                    </span>
                  </Td>

                  {/* Patient anonymisé */}
                  <Td dark={dark}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: dark ? 'rgba(100,116,139,0.18)' : '#f1f5f9', border: `1px solid ${surface.border}` }}>
                        <User size={15} style={{ color: txt.muted }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: txt.primary }}>Patient</p>
                        <p className="text-[12px] mt-0.5 font-mono" style={{ color: txt.subtle }}>#{r.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </Td>

                  {/* Médecin */}
                  <Td dark={dark}>
                    <MutedText dark={dark}>{r.medecin || '—'}</MutedText>
                  </Td>

                  {/* Date suppression */}
                  <Td dark={dark}>
                    <SubtleText dark={dark}>{fmt(r.deleted_at)}</SubtleText>
                  </Td>

                  {/* Avancement J30→J40 */}
                  <Td dark={dark}>
                    <div className="flex flex-col gap-1.5 min-w-[100px]">
                      <div className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: clr.color }} />
                      </div>
                      <span className="text-[11px]" style={{ color: txt.subtle }}>
                        Jour {r.jours_ecoules} / 40
                      </span>
                    </div>
                  </Td>

                  {/* Délai restant */}
                  <Td dark={dark}>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} style={{ color: clr.color, flexShrink: 0 }} />
                      <span className="inline-block px-2.5 py-1 rounded-full text-[12px] font-bold"
                        style={{ background: clr.bg, color: clr.color, border: `1px solid ${clr.border}` }}>
                        {r.jours_restants === 0 ? "Expire aujourd'hui" : `${r.jours_restants}j restant${r.jours_restants > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </Td>

                  {/* Action */}
                  <Td dark={dark}>
                    <TableActionButton dark={dark} variant="brand" onClick={() => setRestoreModal(r)}>
                      <RotateCcw size={13} />Restaurer
                    </TableActionButton>
                  </Td>

                </Tr>
              );
            })}
          </tbody>
        </TableContainer>

        {/* Pagination */}
        {filtered.length > 0 && (
          <PaginationBar dark={dark}>
            <div className="flex items-center gap-2">
              <span>Lignes par page :</span>
              <PaginationSelect dark={dark} value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} />
            </div>
            <span>{from}–{to} sur {filtered.length}</span>
            <div className="flex items-center gap-1">
              <PaginationButton dark={dark} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</PaginationButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === '…'
                  ? <span key={`e${i}`} className="px-1" style={{ color: txt.subtle }}>…</span>
                  : <PaginationButton key={p} dark={dark} active={p === page} onClick={() => setPage(p)}>{p}</PaginationButton>
                )}
              <PaginationButton dark={dark} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</PaginationButton>
            </div>
          </PaginationBar>
        )}
      </TableCard>

      {/* ── Modal restauration ── */}
      {restoreModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl border"
            style={{ background: surface.card, borderColor: surface.border }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
                  <RotateCcw size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px]" style={{ color: txt.primary }}>Restaurer le dossier</h3>
                  <p className="text-[12px] mt-0.5" style={{ color: txt.subtle }}>Le patient redeviendra accessible au médecin</p>
                </div>
              </div>
              <button onClick={() => setRestoreModal(null)} style={{ color: txt.muted }}>
                <X size={16} />
              </button>
            </div>

            <p className="text-[14px] mb-1" style={{ color: txt.secondary }}>
              Vous êtes sur le point de restaurer le dossier{' '}
              <strong style={{ color: txt.primary }}>Patient #{restoreModal.id.slice(0, 8)}</strong>.
            </p>
            {restoreModal.medecin && (
              <p className="text-[13px] mb-5" style={{ color: txt.subtle }}>
                Médecin responsable : {restoreModal.medecin}
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setRestoreModal(null)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium transition-colors"
                style={{ border: `1px solid ${surface.border}`, color: txt.secondary, background: surface.bg }}>
                Annuler
              </button>
              <button
                onClick={() => handleRestore(restoreModal)}
                disabled={actionLoad === restoreModal.id}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                style={{ background: '#059669', color: '#fff' }}>
                {actionLoad === restoreModal.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />}
                Restaurer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-[13px] font-semibold flex items-center gap-2"
          style={{ background: toast.ok ? '#059669' : '#dc2626', color: '#fff' }}>
          {toast.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
