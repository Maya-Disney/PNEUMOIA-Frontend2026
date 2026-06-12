import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Stethoscope, Loader2, User, Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const RED = '#DC2626';

function hdrs() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)    return 'à l\'instant';
  if (s < 3600)  return `il y a ${Math.floor(s/60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s/3600)}h`;
  return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
}

const DEMO_MESSAGES = [
  {
    id: 1,
    from: 'medecin',
    nom: 'Dr. Référent',
    text: 'Bonjour, bienvenue sur PneumoIA. N\'hésitez pas à me contacter pour toute question concernant les patients.',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    from: 'medecin',
    nom: 'Dr. Référent',
    text: 'J\'ai mis à jour vos permissions. Vous pouvez désormais créer et modifier des dossiers patients.',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function AideCommentaires() {
  const [messages, setMessages] = useState([]);
  const [publics,  setPublics]  = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [tab,      setTab]      = useState('medecin');
  const bottomRef = useRef(null);

  const aideId  = localStorage.getItem('aide_id')  || '';
  const aideNom = localStorage.getItem('aide_nom')  || 'Aide soignant';
  const medecinNom = localStorage.getItem('aide_medecin_nom') || 'Dr. Référent';

  useEffect(() => {
    // Charger messages sauvegardés ou démos
    const saved = JSON.parse(localStorage.getItem(`aide_messages_${aideId}`) || 'null');
    setMessages(saved ?? DEMO_MESSAGES);
    if (!saved) localStorage.setItem(`aide_messages_${aideId}`, JSON.stringify(DEMO_MESSAGES));

    // Charger commentaires publics
    fetch(`${API_URL}/commentaires`, { headers: hdrs() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setPublics(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [aideId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tab]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    const msg = {
      id:   Date.now(),
      text: text.trim(),
      from: 'aide',
      nom:  aideNom,
      date: new Date().toISOString(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem(`aide_messages_${aideId}`, JSON.stringify(updated));
    setText('');

    try {
      await fetch(`${API_URL}/commentaires`, {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({ contenu: msg.text, type: 'medecin' }),
      });
    } catch {}
    setSending(false);
  };

  const TABS = [
    { key: 'medecin', label: 'Mon médecin', icon: Stethoscope },
    { key: 'public',  label: 'Plateforme',  icon: MessageSquare },
  ];

  const initials = (nom) => nom.split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto" style={{ height:'calc(100vh - 96px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="flex-none pb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-(--t3) flex items-center gap-1.5 mb-0.5">
          <MessageSquare className="w-3 h-3" style={{color:RED}} /> Messagerie
        </p>
        <h1 className="text-xl font-black text-(--t1)">Commentaires & messagerie</h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex-none flex items-center gap-1 bg-(--sf2) rounded-xl p-1 border border-(--ln) mb-3">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t3) hover:text-(--t2)'
              }`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Onglet Médecin ── */}
      {tab === 'medecin' && (
        <div className="flex flex-col flex-1 bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">

          {/* En-tête médecin */}
          <div className="flex-none flex items-center gap-3 px-4 py-3 border-b border-(--ln) bg-(--sf2)">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-(--t1)">{medecinNom}</p>
              <p className="text-[10px] text-(--t4)">Médecin référent · En ligne</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className={`flex gap-2 ${msg.from === 'aide' ? 'justify-end' : 'justify-start'}`}>

                {msg.from !== 'aide' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center shrink-0 mt-1">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                )}

                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.from === 'aide'
                    ? 'text-white rounded-tr-sm'
                    : 'bg-(--sf2) border border-(--ln) text-(--t1) rounded-tl-sm'
                }`} style={msg.from === 'aide' ? { backgroundColor: RED } : {}}>
                  {msg.from !== 'aide' && (
                    <p className="text-[10px] font-bold text-blue-600 mb-0.5">{msg.nom}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === 'aide' ? 'text-white/60' : 'text-(--t4)'}`}>
                    {timeAgo(msg.date)}
                  </p>
                </div>

                {msg.from === 'aide' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 text-white text-[10px] font-bold"
                    style={{ backgroundColor: RED }}>
                    {initials(aideNom)}
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-none border-t border-(--ln) p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                placeholder="Message à votre médecin référent… (Entrée pour envoyer)"
                rows={2}
                className="flex-1 px-3 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              <button onClick={sendMessage} disabled={!text.trim() || sending}
                className="p-3 text-white rounded-xl disabled:opacity-40 transition-all shrink-0"
                style={{ backgroundColor: RED }}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-(--t4) mt-1.5">
              Maj+Entrée pour aller à la ligne. Les messages sont transmis à votre médecin référent.
            </p>
          </div>
        </div>
      )}

      {/* ── Onglet Plateforme ── */}
      {tab === 'public' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color:RED }} />
            </div>
          ) : publics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-(--sf) border border-(--ln) rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
                <Info className="w-6 h-6 text-blue-500" />
              </div>
              <p className="font-bold text-(--t2) text-sm">Aucune annonce</p>
              <p className="text-xs text-(--t4) mt-1 max-w-xs">Les annonces et actualités de la plateforme apparaîtront ici.</p>
            </div>
          ) : publics.map((c, i) => (
            <motion.div key={c.id || i}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration: 0.2 }}
              className="bg-(--sf) border border-(--ln) rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-(--t1)">{c.auteur || c.nom || 'PneumoIA'}</span>
                <span className="text-[10px] text-(--t4) ml-auto">{c.date ? timeAgo(c.date) : ''}</span>
              </div>
              <p className="text-sm text-(--t2)">{c.contenu || c.texte || c.message}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
