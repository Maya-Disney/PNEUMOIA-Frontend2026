import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  X, CheckCircle, Activity, Eye, Download,
  Loader2, Tag, BookOpen, Printer, FileText,
  Calendar, BarChart3,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/* ── Conversion Markdown → HTML pour la page d'impression ──────── */
function mdToHtml(md) {
  if (!md) return '';
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .split('\n\n')
    .map(p => {
      const t = p.trim();
      if (!t) return '';
      return /^<[hbuli]/.test(t) ? t : `<p>${t}</p>`;
    })
    .join('\n');
}

/* ── Ouvrir une fenêtre d'impression avec tout le contenu ──────── */
function ouvrirImpressionPDF(detail) {
  const win = window.open('', '_blank', 'width=860,height=720');
  if (!win) return;
  const tagsHtml = Array.isArray(detail.tags) && detail.tags.length
    ? `<div class="tags">${detail.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
    : '';
  const contenuHtml = detail.contenu ? mdToHtml(detail.contenu) : '';

  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${detail.titre}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:44px 36px;color:#1e293b;line-height:1.75}
    header{border-bottom:3px solid #1d4ed8;padding-bottom:1.2rem;margin-bottom:1.5rem}
    header h1{font-size:1.65rem;color:#1e3a8a;line-height:1.25;margin-bottom:.4rem}
    header .sub{font-size:.85rem;color:#64748b}
    .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:1rem;margin-bottom:1.5rem}
    .meta-cell label{display:block;font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:.25rem}
    .meta-cell span{font-size:.9rem;font-weight:700;color:#334155}
    .tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1.5rem}
    .tag{background:#dbeafe;color:#1d4ed8;padding:3px 12px;border-radius:999px;font-size:.75rem;font-weight:700}
    section{margin-bottom:1.75rem}
    section h2{font-size:1rem;font-weight:800;color:#1e3a8a;text-transform:uppercase;letter-spacing:.06em;border-left:4px solid #3b82f6;padding-left:.6rem;margin-bottom:.75rem}
    p{margin-bottom:.6rem;font-size:.95rem}
    h1,h2,h3{color:#1e3a8a;margin:1rem 0 .5rem}
    ul,ol{margin:.5rem 0 .5rem 1.5rem}
    li{margin:.2rem 0;font-size:.95rem}
    blockquote{border-left:4px solid #3b82f6;padding:.5rem 1rem;background:#eff6ff;margin:.75rem 0;border-radius:0 8px 8px 0;font-style:italic}
    code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:.88em}
    footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:.75rem;color:#94a3b8;text-align:center}
    .btn-print{position:fixed;top:18px;right:18px;background:#1d4ed8;color:#fff;border:none;padding:9px 20px;border-radius:9px;font-size:.875rem;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(29,78,216,.35)}
    .btn-print:hover{background:#1e40af}
    @media print{.btn-print{display:none}body{padding:16px}}
  </style>
</head>
<body>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimer / Enregistrer PDF</button>
  <header>
    <div class="sub">${detail.pathologie || '—'}</div>
    <h1>${detail.titre}</h1>
  </header>
  <div class="meta">
    <div class="meta-cell"><label>Pathologie</label><span>${detail.pathologie || '—'}</span></div>
    <div class="meta-cell"><label>Niveau cible</label><span>${detail.niveau || '—'}</span></div>
    <div class="meta-cell"><label>Vues / Téléch.</label><span>${detail.nb_vues ?? 0} / ${detail.nb_telechargements ?? 0}</span></div>
  </div>
  ${tagsHtml}
  ${detail.resume ? `<section><h2>Résumé</h2><p>${detail.resume}</p></section>` : ''}
  ${contenuHtml ? `<section><h2>Contenu</h2>${contenuHtml}</section>` : ''}
  <footer>Généré par PneumoIA · ${new Date().toLocaleDateString('fr-FR')}</footer>
</body>
</html>`);
  win.document.close();
}

/* ══════════════════════════════════════════════════════════════════ */
export default function CaseDetailModal({ caseItem, onClose }) {
  const [detail, setDetail]         = useState(null);
  const [loadingDetail, setLoading] = useState(false);
  const [downloading, setDl]        = useState(false);
  const [downloaded, setDone]       = useState(false);
  const [dlError, setDlError]       = useState(null);

  /* Charger le détail complet quand le modal s'ouvre */
  useEffect(() => {
    if (!caseItem) return;
    setDetail(null);
    setLoading(true);
    fetch(`${API_URL}/ressources/${caseItem.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [caseItem?.id]);

  if (!caseItem) return null;

  /* Données consolidées (card + détail API) */
  const titre      = detail?.titre      || caseItem.title;
  const resume     = detail?.resume     || caseItem.symptoms;
  const contenu    = detail?.contenu    || '';
  const pathologie = detail?.pathologie || caseItem.badge;
  const tags       = detail?.tags       || caseItem.tags    || [];
  const niveau     = detail?.niveau     || caseItem.niveau;
  const hasPdf     = detail?.has_pdf    ?? caseItem.has_pdf  ?? false;
  const nbVues     = detail?.nb_vues    ?? caseItem.nb_vues  ?? 0;
  const nbDl       = detail?.nb_telechargements ?? caseItem.nb_telechargements ?? 0;
  const dateStr    = caseItem.patient?.date || '';

  /* Téléchargement PDF ou impression */
  const handleDownload = async () => {
    setDlError(null);
    if (!hasPdf) {
      /* Pas de PDF : ouvrir page imprimable avec tout le contenu */
      ouvrirImpressionPDF({
        titre, resume, contenu, pathologie, niveau, tags, nb_vues: nbVues, nb_telechargements: nbDl,
      });
      return;
    }
    /* PDF uploadé → téléchargement direct */
    setDl(true);
    try {
      const res = await fetch(`${API_URL}/ressources/${caseItem.id}/telecharger`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `pneumoia-${pathologie}-${caseItem.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      setDlError(e.message || 'Téléchargement échoué');
    } finally {
      setDl(false);
    }
  };

  const DlIcon = () => {
    if (downloading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (downloaded)  return <CheckCircle className="w-4 h-4 text-emerald-300" />;
    return hasPdf ? <Download className="w-4 h-4" /> : <Printer className="w-4 h-4" />;
  };
  const dlLabel = downloading ? 'Téléchargement…' : downloaded ? 'Téléchargé !' : hasPdf ? 'Télécharger PDF' : 'Imprimer / PDF';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-(--sf) rounded-2xl shadow-2xl"
        >
          {/* ── Header ── */}
          <div className="sticky top-0 z-10 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] opacity-75 uppercase tracking-wider">Ressource médicale</p>
                <h3 className="font-bold text-sm leading-tight">{pathologie}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              >
                <DlIcon />{dlLabel}
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Titre */}
            <h2 className="text-2xl font-black text-(--t1) leading-snug">{titre}</h2>

            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-(--sf2) rounded-xl text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-0.5">Pathologie</p>
                <p className="font-semibold text-(--t1)">{pathologie}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-0.5">Niveau</p>
                <p className="font-semibold text-(--t1)">{niveau || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-0.5">Vues</p>
                <p className="font-semibold text-(--t1) flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-500" />{nbVues}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-0.5">Téléchargements</p>
                <p className="font-semibold text-(--t1) flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5 text-emerald-500" />{nbDl}</p>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs font-medium px-3 py-1 bg-(--sf2) border border-(--ln) rounded-full text-(--t2)">
                    <Tag className="w-3 h-3" />{t}
                  </span>
                ))}
              </div>
            )}

            {/* Résumé */}
            {resume && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-(--t1) uppercase tracking-wider mb-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />Résumé
                </h3>
                <p className="text-(--t2) leading-relaxed text-sm bg-(--sf2) rounded-xl p-4">{resume}</p>
              </div>
            )}

            {/* Contenu complet (Markdown) */}
            {loadingDetail ? (
              <div className="flex items-center gap-2 text-sm text-(--t4) py-4">
                <Loader2 className="w-4 h-4 animate-spin" />Chargement du contenu…
              </div>
            ) : contenu ? (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-(--t1) uppercase tracking-wider mb-3">
                  <div className="w-1 h-5 bg-indigo-500 rounded-full" />Contenu
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-(--sf2) rounded-xl p-5
                  [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-(--t1) [&_h1]:mb-2 [&_h1]:mt-4
                  [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-(--t1) [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:border-b [&_h2]:border-(--ln) [&_h2]:pb-1
                  [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-(--t2) [&_h3]:mb-1 [&_h3]:mt-3
                  [&_p]:text-(--t2) [&_p]:leading-relaxed [&_p]:text-sm [&_p]:mb-2
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_ol]:space-y-1
                  [&_li]:text-sm [&_li]:text-(--t2)
                  [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-(--t3) [&_blockquote]:bg-blue-50 [&_blockquote]:dark:bg-blue-900/10 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
                  [&_code]:bg-(--sf3) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                  [&_strong]:font-bold [&_strong]:text-(--t1)
                ">
                  <ReactMarkdown>{contenu}</ReactMarkdown>
                </div>
              </div>
            ) : (
              !loadingDetail && (
                <div className="flex items-center gap-3 p-4 bg-(--sf2) rounded-xl text-sm text-(--t3)">
                  <FileText className="w-4 h-4 shrink-0" />
                  Aucun contenu détaillé renseigné pour cette ressource.
                </div>
              )
            )}

            {/* Info PDF */}
            {hasPdf && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-200">Document PDF disponible</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Ce cas clinique inclut un document PDF joint par le médecin</p>
                </div>
              </div>
            )}

            {dlError && <p className="text-xs text-red-500">{dlError}</p>}

            {/* Actions bas */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-(--ln)">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all"
              >
                <DlIcon />{dlLabel}
              </button>
              <button onClick={onClose}
                className="px-5 py-2.5 border border-(--ln) text-(--t2) rounded-xl font-medium text-sm hover:bg-(--sf2) transition-all">
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
