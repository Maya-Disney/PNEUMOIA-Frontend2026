import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid, UserRound, Stethoscope, Share2, MessageSquare,
  Bell, Search, Settings, ShieldCheck, History, Activity,
  FileText, Pill, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, X, Download, Edit3, Trash2, Plus,
  Clock, MapPin, Phone, Calendar, FileScan, Eye,
  TrendingUp, Users, AlertCircle, FolderOpen,
  Heart, Thermometer, Wind, Scale, Droplets,
  MoreHorizontal, ChevronDown, Lock, UserCheck,
  ClipboardList, Microscope, ArrowUpRight, Zap,
  LogOut, Moon, Sun, Filter, SlidersHorizontal
} from "lucide-react";
import { motion } from 'framer-motion';

// ─── DATA ──────────────────────────────────────────────────────────────
const PATIENTS = {
  1: {
    name: "TAMO Bernard", init: "TB", age: "47 ans", sex: "Masculin",
    id: "PNEU-004821", dob: "15/03/1977", city: "Douala", tel: "+237 699 123 456",
    created: "12/01/2025", shared: false, status: "actif",
    diag: "Pneumonie bactérienne", diagSince: "Diagnostiqué le 09/03/2026", iaPct: 85,
    antecedents: ["Tabagisme sevré 2020", "Hypertension artérielle", "Chirurgie appendice 2015"],
    allergies: ["Aucune allergie connue"],
    treatments: [
      { name: "Amoxicilline", dose: "1g × 3/j — 7 jours" },
      { name: "Paracétamol", dose: "1g si fièvre > 38.5°C" },
      { name: "Amlodipine", dose: "5mg/j — HTA" }
    ],
    vitals: { spo2: 94, fr: 22, temp: 38.7, pa: "125/82", fc: 98, poids: "78 kg" },
    docs: [
      { name: "Radio thorax — 09/03/2026", date: "Auj." },
      { name: "NFS + CRP — 09/03/2026", date: "Auj." },
      { name: "Consultation 15/10/2025", date: "Oct. 25" }
    ],
    notes: "Patient coopératif. Toux productive depuis 48h. Réévaluation J+2.",
    iaDiags: [
      { date: "09/03/2026", diag: "Pneumonie bactérienne", pct: 85, conc: "Concordant" },
      { date: "15/10/2025", diag: "Bronchite aiguë", pct: 78, conc: "Concordant" },
      { date: "02/05/2025", diag: "Bilan normal", pct: 62, conc: "Concordant" }
    ],
    iaDiffs: [
      { diag: "Tuberculose", pct: 28 },
      { diag: "Pneumopathie virale", pct: 15 },
      { diag: "Epanchement pleural", pct: 8 }
    ],
    iaCriteria: [
      { label: "Fièvre > 38.5°C", ok: true }, { label: "Opacité alvéolaire radio", ok: true },
      { label: "Crépitants", ok: true }, { label: "SpO₂ < 95%", ok: true },
      { label: "Durée 1–3j", ok: true }, { label: "Hémoptysie", ok: false }
    ],
    tl: [
      { date: "09/03/2026 · Dr. Tagne", title: "Pneumonie bactérienne", note: "Amoxicilline 1g × 3/j. Suivi J+7.", ia: 85, color: "#1D6FEB", conc: "Concordant" },
      { date: "15/10/2025", title: "Bronchite aiguë", note: "Guérison J+10.", ia: 78, color: "#059669", conc: "Concordant" },
      { date: "02/05/2025", title: "Bilan normal", note: "Aucune pathologie.", ia: 62, color: "#94A3B8", conc: "Concordant" }
    ]
  },
  2: {
    name: "FOUDA Marie", init: "FM", age: "52 ans", sex: "Féminin",
    id: "PNEU-001234", dob: "12/07/1972", city: "Douala", tel: "+237 677 234 567",
    created: "03/06/2024", shared: true, status: "actif",
    diag: "BPCO stade II", diagSince: "Suivi depuis mars 2024", iaPct: 83,
    antecedents: ["Tabagisme actif 25 PA", "Asthme enfance", "Rhinite chronique"],
    allergies: ["Aspirine (urticaire)", "AINS"],
    treatments: [
      { name: "Salbutamol inh.", dose: "2 bouffées si dyspnée" },
      { name: "Tiotropium inh.", dose: "18µg/j — fond" },
      { name: "N-acétylcystéine", dose: "600mg/j" }
    ],
    vitals: { spo2: 92, fr: 24, temp: 37.1, pa: "138/86", fc: 88, poids: "63 kg" },
    docs: [
      { name: "EFR — 15/02/2026", date: "Fév. 26" },
      { name: "Scanner thorax 01/2026", date: "Jan. 26" },
      { name: "Gazéométrie Nov.25", date: "Nov. 25" }
    ],
    notes: "BPCO stable. SpO₂ légèrement basse. Sevrage tabagique recommandé.",
    iaDiags: [
      { date: "10/03/2026", diag: "BPCO stade II", pct: 83, conc: "Concordant" },
      { date: "15/12/2025", diag: "BPCO exacerbation", pct: 79, conc: "Concordant" }
    ],
    iaDiffs: [
      { diag: "Asthme sévère", pct: 22 },
      { diag: "Insuffisance cardiaque", pct: 12 },
      { diag: "Bronchite chronique", pct: 9 }
    ],
    iaCriteria: [
      { label: "VEMS/CVF < 0.70", ok: true }, { label: "Tabagisme > 20 PA", ok: true },
      { label: "Dyspnée chronique", ok: true }, { label: "Obstruction persist.", ok: true },
      { label: "SpO₂ < 94%", ok: true }, { label: "Hypercapnie", ok: false }
    ],
    tl: [
      { date: "10/03/2026", title: "BPCO bilan trim.", note: "Stable. SpO₂ 92%.", ia: 83, color: "#1D6FEB", conc: "Concordant" },
      { date: "15/12/2025", title: "BPCO exacerbation", note: "Cortico 5j.", ia: 79, color: "#D97706", conc: "Concordant" },
      { date: "03/06/2024", title: "1ère consultation", note: "Diagnostic BPCO.", ia: 77, color: "#94A3B8", conc: "Concordant" }
    ]
  },
  3: {
    name: "KAMGA Jean", init: "KJ", age: "71 ans", sex: "Masculin",
    id: "PNEU-009876", dob: "04/11/1953", city: "Yaoundé", tel: "+237 655 345 678",
    created: "15/11/2025", shared: false, status: "urgent",
    diag: "Tuberculose pulmonaire", diagSince: "Diagnostiqué le 15/11/2025", iaPct: 82,
    antecedents: ["Diabète type 2", "Immunodépression cortico", "Contact TB confirmé"],
    allergies: ["Streptomycine (ototoxicité)"],
    treatments: [
      { name: "Rifampicine", dose: "600mg/j RHZE phase intensive" },
      { name: "Isoniazide", dose: "300mg/j" },
      { name: "Pyrazinamide", dose: "2000mg/j" },
      { name: "Metformine", dose: "1000mg × 2/j" }
    ],
    vitals: { spo2: 89, fr: 26, temp: 37.8, pa: "142/91", fc: 104, poids: "61 kg" },
    docs: [
      { name: "BK crachat positif", date: "Nov. 25" },
      { name: "Radio thorax initiale", date: "Nov. 25" },
      { name: "Antibiogramme", date: "Nov. 25" }
    ],
    notes: "SUIVI DÉPASSÉ depuis 28/02/2026. Phase intensive TB. Bilan hépatique obligatoire.",
    iaDiags: [
      { date: "15/11/2025", diag: "Tuberculose pulmonaire", pct: 82, conc: "Concordant" },
      { date: "28/02/2026", diag: "TB suivi phase intensive", pct: 79, conc: "Concordant" }
    ],
    iaDiffs: [
      { diag: "Pneumonie bactérienne", pct: 18 },
      { diag: "Cancer bronchique", pct: 14 },
      { diag: "Aspergillome", pct: 7 }
    ],
    iaCriteria: [
      { label: "BK crachat positif", ok: true }, { label: "Opacités bilatérales", ok: true },
      { label: "Contact TB connu", ok: true }, { label: "Immunodépression", ok: true },
      { label: "Perte poids > 5kg", ok: true }, { label: "Culture BAAR+", ok: true }
    ],
    tl: [
      { date: "28/02/2026", title: "TB suivi J+105", note: "BK négatif. Bonne tolérance.", ia: 79, color: "#059669", conc: "Concordant" },
      { date: "15/11/2025", title: "TB diagnostic", note: "BK+ confirmé. RHZE démarré.", ia: 82, color: "#DC2626", conc: "Concordant" }
    ]
  },
  4: {
    name: "NGUEMA Paul", init: "NP", age: "63 ans", sex: "Masculin",
    id: "PNEU-002891", dob: "22/08/1961", city: "Douala", tel: "+237 699 456 789",
    created: "08/09/2023", shared: true, status: "actif",
    diag: "Asthme sévère persistant", diagSince: "Suivi depuis sept. 2023", iaPct: 91,
    antecedents: ["Asthme depuis enfance", "Rhinosinusite chronique", "Dermatite atopique", "RGO"],
    allergies: ["Acariens (allergique)", "Aspirine CI", "Bêtabloqu. CI"],
    treatments: [
      { name: "Fluticasone/Salmétérol", dose: "500/50µg × 2/j CSI+LABA" },
      { name: "Montélukast", dose: "10mg/j" },
      { name: "Salbutamol spray", dose: "1–2 bouffées si crise" }
    ],
    vitals: { spo2: 96, fr: 16, temp: 36.8, pa: "118/74", fc: 74, poids: "82 kg" },
    docs: [
      { name: "EFR 05/03/2026", date: "Mars 26" },
      { name: "Test allergie 2024", date: "2024" },
      { name: "Radio thorax contrôle", date: "Fév. 26" }
    ],
    notes: "Asthme bien contrôlé. VEMS 78%. Pas de crise. Suivi J+90.",
    iaDiags: [
      { date: "05/03/2026", diag: "Asthme sévère contrôlé", pct: 91, conc: "Concordant" },
      { date: "12/11/2025", diag: "Asthme partiel", pct: 88, conc: "Concordant" }
    ],
    iaDiffs: [
      { diag: "BPCO", pct: 12 },
      { diag: "Trachéobronchite", pct: 6 },
      { diag: "Hyperinflation", pct: 4 }
    ],
    iaCriteria: [
      { label: "Obstruction réversible", ok: true }, { label: "Variabilité VEMS > 12%", ok: true },
      { label: "Symptômes nocturnes", ok: true }, { label: "Terrain atopique", ok: true },
      { label: "Réponse cortico inh.", ok: true }, { label: "Éosinophilie", ok: false }
    ],
    tl: [
      { date: "05/03/2026", title: "Asthme contrôlé", note: "VEMS 78%. Pas de crise.", ia: 91, color: "#059669", conc: "Concordant" },
      { date: "12/11/2025", title: "Asthme partiel", note: "CSI majoré.", ia: 88, color: "#D97706", conc: "Concordant" },
      { date: "18/06/2025", title: "Exacerbation mod.", note: "Hospit. 48h. Cortico IV.", ia: 85, color: "#DC2626", conc: "Concordant" }
    ]
  },
  5: {
    name: "MBOMA Éric", init: "ME", age: "55 ans", sex: "Masculin",
    id: "PNEU-003412", dob: "30/05/1969", city: "Bafoussam", tel: "+237 677 567 890",
    created: "20/04/2025", shared: true, status: "attente",
    diag: "BPCO stade III", diagSince: "Diagnostiqué le 20/04/2025", iaPct: 81,
    antecedents: ["Tabagisme 35 PA en cours", "Silicose professionnelle", "HTA traitée"],
    allergies: ["Codéine (nausées)"],
    treatments: [
      { name: "Indacatérol/Glycopyrronium", dose: "110/50µg/j LABA+LAMA" },
      { name: "Amlodipine", dose: "10mg/j HTA" },
      { name: "N-acétylcystéine", dose: "600mg/j" }
    ],
    vitals: { spo2: 88, fr: 28, temp: 37.2, pa: "148/95", fc: 102, poids: "70 kg" },
    docs: [
      { name: "EFR VEMS 38%", date: "Avr. 25" },
      { name: "TDM thorax haute rés.", date: "Mai 25" },
      { name: "Bilan préop en attente", date: "—" }
    ],
    notes: "BPCO très sévère. SpO₂ 88%. OLT en discussion. Résultats TDM en attente.",
    iaDiags: [
      { date: "22/02/2026", diag: "BPCO stade III sévère", pct: 81, conc: "Concordant" },
      { date: "10/10/2025", diag: "BPCO exacerbation", pct: 77, conc: "Concordant" }
    ],
    iaDiffs: [
      { diag: "Silicose évoluée", pct: 31 },
      { diag: "Emphysème bulleux", pct: 22 },
      { diag: "Cancer bronchique", pct: 11 }
    ],
    iaCriteria: [
      { label: "VEMS < 50%", ok: true }, { label: "Obstruction sévère", ok: true },
      { label: "Tabagisme > 30 PA", ok: true }, { label: "SpO₂ < 90%", ok: true },
      { label: "Exposition silice", ok: true }, { label: "Polyglobulie", ok: false }
    ],
    tl: [
      { date: "22/02/2026", title: "BPCO aggravation", note: "VEMS 38%. OLT discussion.", ia: 81, color: "#DC2626", conc: "Concordant" },
      { date: "10/10/2025", title: "BPCO exacerbation", note: "Hospit. 3j.", ia: 77, color: "#D97706", conc: "Concordant" }
    ]
  }
};

const STATUS_CONFIG = {
  actif: { label: "Actif", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500", border: "border-emerald-200", ring: "bg-emerald-500", darkBg: "dark:bg-emerald-950", darkBorder: "dark:border-emerald-700" },
  urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500", border: "border-red-200", ring: "bg-red-500", darkBg: "dark:bg-red-950", darkBorder: "dark:border-red-700" },
  attente: { label: "En attente", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500", border: "border-amber-200", ring: "bg-amber-500", darkBg: "dark:bg-amber-950", darkBorder: "dark:border-amber-700" },
  cloture: { label: "Clôturé", color: "text-(--t3)", bg: "bg-(--sf2)", dot: "bg-slate-400", border: "border-(--ln)", ring: "bg-slate-400", darkBg: "", darkBorder: "" },
};

// ─── HELPERS ───────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", color = "bg-blue-600" }) {
  const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-14 h-14 text-lg" };
  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`${sizes[size]} ${color} text-white rounded-xl flex items-center justify-center font-bold shrink-0 tracking-tight shadow-sm`}
    >
      {initials}
    </motion.div>
  );
}

function Badge({ children, variant = "blue" }) {
  const variants = {
    blue: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/30",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30",
    amber: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30",
    red: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/30",
    slate: "bg-(--sf2) text-(--t2) border border-(--ln)",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${variants[variant]}`}>{children}</span>;
}

function PillTag({ label, variant = "slate", onRemove }) {
  const variants = {
    slate: "bg-(--sf2) text-(--t2)",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium ${variants[variant]}`}>
      {label}
      {onRemove && <button onClick={onRemove} className="ml-0.5 opacity-50 hover:opacity-100"><X size={12} /></button>}
    </span>
  );
}

function ProgressBar({ value, color = "bg-blue-600" }) {
  return (
    <div className="h-2 bg-(--sf2) rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function IARing({ pct, size = 80 }) {
  const [displayed, setDisplayed] = useState(0);
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (circumference * pct) / 100;
  const color = pct >= 80 ? "#10b981" : pct >= 70 ? "#3b82f6" : "#f59e0b";

  useEffect(() => {
    setDisplayed(0);
    const iv = setInterval(() => {
      setDisplayed(prev => { if (prev >= pct) { clearInterval(iv); return pct; } return prev + 2; });
    }, 16);
    return () => clearInterval(iv);
  }, [pct]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 72 72" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r="30" fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * displayed) / 100}
          style={{ transition: "stroke-dashoffset 0.05s" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black text-(--t1)">{displayed}%</span>
      </div>
    </motion.div>
  );
}

function VitalCard({ label, value, unit, warn }) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`rounded-xl p-3 border transition-all ${warn ? "bg-red-50 border-red-200 shadow-sm shadow-red-100 dark:bg-red-500/10 dark:border-red-500/20" : "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"}`}
    >
      <div className="text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1.5">{label}</div>
      <div className={`text-base font-black leading-none tracking-tight ${warn ? "text-red-600" : "text-emerald-700"}`}>
        {value}<span className="text-[11px] font-semibold ml-1 opacity-70">{unit}</span>
      </div>
    </motion.div>
  );
}

function TreatmentRow({ name, dose }) {
  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-start gap-3 p-3 bg-linear-to-r from-blue-50 to-transparent border border-blue-200 rounded-xl mb-2 hover:shadow-md transition-shadow dark:from-blue-500/10 dark:to-transparent dark:border-blue-500/20"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
      <div className="flex-1">
        <div className="text-sm font-bold text-(--t1)">{name}</div>
        <div className="text-xs text-(--t3) mt-0.5">{dose}</div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-(--t3) mb-3 mt-4 first:mt-0"
    >
      <Icon size={13} strokeWidth={2.5} className="text-blue-500" />
      {label}
    </motion.div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-(--ln) last:border-0 hover:bg-(--sf2) px-1 rounded transition-colors">
      <span className="text-sm font-medium text-(--t3)">{label}</span>
      <span className={`text-sm font-bold text-(--t1) text-right ${mono ? "font-mono text-xs text-(--t3)" : ""}`}>{value}</span>
    </div>
  );
}

function PatientRow({ patient, selected, onClick }) {
  const st = STATUS_CONFIG[patient.status] || STATUS_CONFIG.actif;
  const avatarColors = { actif: "bg-blue-600", urgent: "bg-red-500", attente: "bg-amber-500", cloture: "bg-slate-400" };
  const iaBadge = patient.iaPct >= 80 ? "green" : patient.iaPct >= 70 ? "blue" : "amber";

  return (
    <motion.tr
      onClick={onClick}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
      className={`border-b border-(--ln) cursor-pointer transition-all hover:bg-(--sf2)
        ${selected ? "bg-blue-50 border-blue-200 dark:bg-blue-950" : ""}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar initials={patient.init} size="sm" color={avatarColors[patient.status]} />
          <div>
            <div className="font-bold text-(--t1) text-sm">{patient.name}</div>
            <div className="text-xs text-(--t4) mt-0.5">{patient.age} · {patient.city}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-(--t2)">{patient.diag}</td>
      <td className="px-4 py-3">
        <Badge variant={iaBadge}>IA {patient.iaPct}%</Badge>
      </td>
      <td className="px-4 py-3">
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}
        >
          <span className={`w-2 h-2 rounded-full ${st.dot}`} />
          {st.label}
        </motion.span>
      </td>
      <td className="px-4 py-3 text-xs text-(--t3)">
        {patient.shared && <span className="inline-flex items-center gap-1 text-blue-600 font-semibold"><Share2 size={12} />Partagé</span>}
      </td>
      <td className="px-4 py-3">
        <motion.div whileHover={{ x: 4 }}>
          <ChevronRight size={16} className={`transition-colors ${selected ? "text-blue-500" : "text-(--t4)"}`} />
        </motion.div>
      </td>
    </motion.tr>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "dossier", label: "Dossier", icon: FolderOpen },
  { id: "ia", label: "IA & Diag.", icon: Zap },
  { id: "history", label: "Historique", icon: History },
  { id: "status", label: "Statut", icon: Activity },
  { id: "access", label: "Accès", icon: Lock },
];

// ─── TAB COMPONENTS ───────────────────────────────────────────────────

function DossierTab({ p }) {
  const vitals = [
    { label: "SpO₂", value: p.vitals.spo2, unit: "%", warn: p.vitals.spo2 < 93 },
    { label: "Fréq. resp.", value: p.vitals.fr, unit: "c/min", warn: p.vitals.fr > 25 },
    { label: "Temp.", value: p.vitals.temp, unit: "°C", warn: p.vitals.temp > 38 },
    { label: "Pression art.", value: p.vitals.pa, unit: "", warn: false },
    { label: "Fréq. card.", value: p.vitals.fc, unit: "bpm", warn: p.vitals.fc > 100 },
    { label: "Poids", value: p.vitals.poids, unit: "", warn: false },
  ];

  return (
    <div className="p-5 space-y-1 text-(--t1)">
      {/* Identité */}
      <SectionHeader icon={UserRound} label="Identité" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden mb-4 shadow-sm"
      >
        <InfoRow label="ID dossier" value={p.id} mono />
        <InfoRow label="Date de naissance" value={p.dob} />
        <InfoRow label="Âge" value={p.age} />
        <InfoRow label="Sexe" value={p.sex} />
        <InfoRow label="Téléphone" value={p.tel} />
        <InfoRow label="Ville" value={p.city} />
        <InfoRow label="Médecin référent" value="Dr. Tagne" />
        <InfoRow label="Créé le" value={p.created} />
      </motion.div>

      {/* Pathologie */}
      <SectionHeader icon={Stethoscope} label="Pathologie principale" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-4 mb-4 shadow-sm dark:from-blue-500/10 dark:to-blue-500/5 dark:border-blue-500/20"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-black text-(--t1)">{p.diag}</div>
            <div className="text-xs text-(--t3) mt-1.5">{p.diagSince}</div>
          </div>
          <Badge variant={p.iaPct >= 80 ? "green" : "blue"}>IA {p.iaPct}%</Badge>
        </div>
      </motion.div>

      {/* Antécédents */}
      <SectionHeader icon={ClipboardList} label="Antécédents médicaux" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {p.antecedents.map((a, i) => (
          <motion.div key={i} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <PillTag label={a} variant="slate" />
          </motion.div>
        ))}
      </motion.div>

      {/* Allergies */}
      <SectionHeader icon={AlertTriangle} label="Allergies connues" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {p.allergies.map((a, i) => (
          <motion.div key={i} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <PillTag label={a} variant={a.toLowerCase().includes("aucune") ? "green" : "red"} />
          </motion.div>
        ))}
      </motion.div>

      {/* Traitements */}
      <SectionHeader icon={Pill} label="Traitements en cours" />
      <motion.div className="mb-4">
        {p.treatments.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <TreatmentRow {...t} />
          </motion.div>
        ))}
      </motion.div>

      {/* Vitaux */}
      <SectionHeader icon={Heart} label="Paramètres vitaux" />
      <motion.div className="grid grid-cols-2 gap-2 mb-4">
        {vitals.map((v, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
            <VitalCard {...v} />
          </motion.div>
        ))}
      </motion.div>

      {/* Documents */}
      <SectionHeader icon={FileText} label="Documents & imagerie" />
      <motion.div className="space-y-2 mb-4">
        {p.docs.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 p-3 bg-(--sf2) border border-(--ln) rounded-xl hover:bg-(--sf3) hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-(--sf) border border-(--ln) flex items-center justify-center shrink-0 group-hover:border-blue-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
              <FileScan size={14} className="text-(--t3) group-hover:text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-(--t1) truncate">{d.name}</div>
            </div>
            <span className="text-xs text-(--t4) shrink-0">{d.date}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-(--t4) hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <Download size={13} />
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Notes */}
      <SectionHeader icon={MessageSquare} label="Notes cliniques" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-sm text-(--t2) leading-relaxed shadow-sm"
      >
        {p.notes}
      </motion.div>
    </div>
  );
}

function IATab({ p }) {
  const confLabel = p.iaPct >= 85 ? "Haute confiance" : p.iaPct >= 75 ? "Confiance moyenne" : "Confiance faible";
  const confVariant = p.iaPct >= 85 ? "green" : p.iaPct >= 75 ? "blue" : "amber";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      {/* Global score */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-linear-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-5 flex items-center gap-5 mb-6 shadow-sm dark:from-blue-500/10 dark:to-blue-500/5 dark:border-blue-500/20"
      >
        <IARing pct={p.iaPct} size={80} />
        <div className="flex-1">
          <div className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1">Concordance IA globale</div>
          <div className="text-lg font-black text-(--t1) leading-tight">{p.diag}</div>
          <div className="text-xs text-(--t3) mb-2.5 mt-1">{p.iaDiags.length} analyses · {p.tl.length} consultations</div>
          <Badge variant={confVariant}>{confLabel}</Badge>
        </div>
      </motion.div>

      {/* Diag history */}
      <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Tous les diagnostics IA</p>
      <motion.div className="space-y-2 mb-6">
        {p.iaDiags.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3.5 rounded-xl border ${i === 0 ? "bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-500/10 dark:border-blue-500/20" : "bg-(--sf) border-(--ln) hover:bg-(--sf2) hover:shadow-md transition-shadow"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-(--t1)">{d.diag}</span>
              <Badge variant={d.pct >= 80 ? "green" : d.pct >= 70 ? "blue" : "amber"}>{d.pct}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-(--t4)">{d.date}</span>
              <Badge variant="slate">{d.conc}</Badge>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Differentials */}
      <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Différentiels (dernière analyse)</p>
      <motion.div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden mb-6 shadow-sm">
        {p.iaDiffs.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 border-b border-(--ln) last:border-0 hover:bg-(--sf2) transition-colors"
          >
            <span className="text-sm font-medium text-(--t1) flex-1">{d.diag}</span>
            <ProgressBar value={d.pct} color={d.pct > 25 ? "bg-amber-400" : "bg-(--ln)"} />
            <span className="text-sm font-bold text-(--t2) w-8 text-right">{d.pct}%</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Criteria */}
      <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Critères retenus</p>
      <motion.div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
        {p.iaCriteria.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between px-4 py-3 border-b border-(--ln) last:border-0 hover:bg-(--sf2) transition-colors"
          >
            <span className="text-sm text-(--t1)">{c.label}</span>
            <motion.div whileHover={{ scale: 1.05 }}>
              {c.ok
                ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"><CheckCircle2 size={13} />Présent</span>
                : <span className="flex items-center gap-1 text-xs font-bold text-(--t3) bg-(--sf2) px-2.5 py-1 rounded-lg border border-(--ln)"><XCircle size={13} />Absent</span>}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function HistoryTab({ p }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      {p.tl.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 pb-6 last:pb-0"
        >
          <div className="flex flex-col items-center w-6 shrink-0 pt-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 rounded-full shrink-0 shadow-md"
              style={{ background: t.color }}
            />
            {i < p.tl.length - 1 && <div className="w-px h-16 bg-linear-to-b from-slate-300 to-slate-100 mt-1" />}
          </div>
          <motion.div whileHover={{ x: 4 }} className="flex-1 pb-1 cursor-pointer">
            <div className="text-xs text-(--t4) mb-1.5">{t.date}</div>
            <div className="text-sm font-bold text-(--t1) mb-1">{t.title}</div>
            <div className="text-xs text-(--t3) leading-relaxed mb-2.5">{t.note}</div>
            <div className="flex gap-2">
              <Badge variant={t.ia >= 80 ? "green" : t.ia >= 70 ? "blue" : "amber"}>IA {t.ia}%</Badge>
              <Badge variant="slate">{t.conc}</Badge>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function StatusTab({ p, onStatusChange }) {
  const st = STATUS_CONFIG[p.status];
  const allStatuses = ["actif", "urgent", "attente", "cloture"];
  const statusLabels = { actif: "Actif", urgent: "Suivi urgent", attente: "En attente", cloture: "Clôturé" };
  const statusDesc = {
    actif: "Suivi médical en cours",
    urgent: "Consultation requise immédiatement",
    attente: "Examens complémentaires en cours",
    cloture: "Dossier fermé"
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      {/* Current status */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`${st.bg} ${st.border} ${st.color} border rounded-2xl p-4 mb-5 shadow-sm `}
      >
        <div className="flex items-center gap-2 mb-2">
          <motion.span className={`w-3 h-3 rounded-full ${st.dot}`} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className={`text-base font-bold ${st.color}`}>{st.label}</span>
        </div>
        <p className="text-sm text-(--t2)">{statusDesc[p.status]}</p>
      </motion.div>

      {/* Change status */}
      <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Changer le statut</p>
      <motion.div className="space-y-2 mb-6">
        {allStatuses.map((s, i) => {
          const cfg = STATUS_CONFIG[s];
          const active = s === p.status;
          return (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onStatusChange(s)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all
                ${active ? `${cfg.bg} ${cfg.border} ${cfg.color} ${cfg.darkBg || ''} ${cfg.darkBorder || ''} shadow-md` : "bg-(--sf) border-(--ln) text-(--t2) hover:border-(--ln2) hover:bg-(--sf2)"}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <div className="text-left flex-1">
                <div className="text-sm font-bold">{statusLabels[s]}</div>
                <div className={`text-xs mt-0.5 ${active ? "opacity-70" : "text-(--t4)"}`}>{statusDesc[s]}</div>
              </div>
              {active && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><CheckCircle2 size={18} /></motion.div>}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Next visit */}
      <div className="border-t border-(--ln) pt-4">
        <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Prochain suivi</p>
        <div className="flex gap-2">
          <input type="date" defaultValue="2026-03-26"
            className="flex-1 px-3 py-2.5 text-sm bg-(--sf) border border-(--ln) rounded-xl text-(--t1) font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Confirmer
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function AccessTab() {
  const [martinVisible, setMartinVisible] = useState(true);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Médecins ayant accès</p>
      {/* Owner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl mb-2 shadow-sm dark:bg-blue-500/10 dark:border-blue-500/20">
        <Avatar initials="JD" size="sm" color="bg-blue-600" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-(--t1)">Dr. Jean Tagne (vous)</div>
          <div className="text-xs text-(--t3)">Propriétaire · Pneumologue, Douala</div>
        </div>
        <Badge variant="blue">Propriétaire</Badge>
      </motion.div>
      {/* Martin */}
      {martinVisible && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-3 p-3.5 bg-(--sf2) border border-(--ln) rounded-xl mb-2">
          <Avatar initials="DM" size="sm" color="bg-slate-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-(--t1)">Dr. Martin</div>
            <div className="text-xs text-(--t3)">Accès depuis le 07/03/2026</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setMartinVisible(false)}
            className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all"
          >
            Révoquer
          </motion.button>
        </motion.div>
      )}
      {/* Add */}
      <div className="border-t border-(--ln) mt-4 pt-4">
        <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Ajouter un accès</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-(--sf) border-2 border-dashed border-(--ln2) rounded-xl text-sm font-bold text-(--t3) hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
        >
          <Plus size={16} />Envoyer une demande de partage
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── DETAIL PANEL ──────────────────────────────────────────────────────

function DetailPanel({ patient, onClose, onStatusChange }) {
  const [tab, setTab] = useState("dossier");

  useEffect(() => { setTab("dossier"); }, [patient?.id]);

  if (!patient) return null;

  const st = STATUS_CONFIG[patient.status];

  return (
    <motion.div
      initial={{ x: 450, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 450, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[480px] shrink-0 bg-(--sf) border-l border-(--ln) flex flex-col h-full overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-4 border-b border-(--ln) flex items-center gap-3.5 shrink-0 bg-(--sf2)"
      >
        <div className="relative shrink-0">
          <Avatar initials={patient.init} size="lg" color={patient.status === "urgent" ? "bg-red-500" : patient.status === "attente" ? "bg-amber-500" : "bg-blue-600"} />
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${st.ring}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-(--t1) leading-tight">{patient.name}</div>
          <div className="text-xs text-(--t3) mt-0.5">{patient.age} · {patient.sex} · {patient.city}</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-(--t4) hover:text-(--t1) hover:bg-(--sf3) transition-colors"
        >
          <X size={16} />
        </motion.button>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-5 py-3 border-b border-(--ln) flex items-center gap-2 shrink-0 bg-blue-50/50 dark:bg-blue-500/10"
      >
        <motion.a whileHover={{ scale: 1.05 }} href="#" className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Stethoscope size={13} />Consulter
        </motion.a>
        <motion.button whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3 py-2 bg-(--sf) border border-(--ln) text-(--t2) text-xs font-bold rounded-lg hover:bg-(--sf2) transition-colors">
          <Edit3 size={13} />Modifier
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3 py-2 bg-(--sf) border border-(--ln) text-(--t2) text-xs font-bold rounded-lg hover:bg-(--sf2) transition-colors">
          <Download size={13} />Télécharger
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 border border-(--ln) hover:border-red-200 transition-colors dark:hover:bg-red-500/10 dark:hover:text-red-300">
          <Trash2 size={14} />
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex border-b border-(--ln) px-2 shrink-0 overflow-x-auto bg-(--sf2)"
      >
        {TABS.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all
                ${tab === t.id ? "border-blue-600 text-blue-700 bg-(--sf) dark:text-blue-200" : "border-transparent text-(--t3) hover:text-(--t1)"}`}
            >
              <Icon size={14} strokeWidth={2} />
              {t.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab body */}
      <motion.div
        key={tab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-y-auto"
      >
        {tab === "dossier" && <DossierTab p={patient} />}
        {tab === "ia" && <IATab p={patient} />}
        {tab === "history" && <HistoryTab p={patient} />}
        {tab === "status" && <StatusTab p={patient} onStatusChange={onStatusChange} />}
        {tab === "access" && <AccessTab />}
      </motion.div>
    </motion.div>
  );
}

// ─── TOAST ─────────────────────────────────────────────────────────────

function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="pointer-events-auto bg-(--sf) border border-(--ln) rounded-xl shadow-xl px-4 py-3 flex items-start gap-3 min-w-[240px] max-w-[300px]"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${t.type === "success" ? "bg-emerald-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`}
          />
          <div className="flex-1">
            <div className="text-sm font-bold text-(--t1)">{t.title}</div>
            {t.msg && <div className="text-xs text-(--t3) mt-0.5">{t.msg}</div>}
          </div>
          <motion.button whileHover={{ scale: 1.2 }} onClick={() => remove(t.id)} className="text-(--t4) hover:text-(--t1) mt-0.5"><X size={14} /></motion.button>
        </motion.div>
      ))}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [patients,  setPatients]  = useState({});
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [toasts,    setToasts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  let toastId = useRef(0);

  const addToast = (type, title, msg) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  };

  // ── Charger les patients depuis la BDD ──────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token    = localStorage.getItem('token') || localStorage.getItem('access_token');
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res      = await fetch(`${BASE_URL}/patients/mes-patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Impossible de charger les patients');
        const data = await res.json();

        const obj = {};
        data.forEach(p => {
          obj[p.id] = {
            name:        `${p.nom} ${p.prenom}`,
            init:        `${p.prenom?.[0] || ''}${p.nom?.[0] || ''}`,
            age:         _calculerAge(p.date_naissance),
            sex:         p.sexe === 'M' ? 'Masculin' : p.sexe === 'F' ? 'Féminin' : 'Non renseigné',
            id:          p.id,
            dob:         p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-FR') : 'N/A',
            city:        p.adresse || 'Non renseignée',
            tel:         p.telephone || 'Non renseigné',
            created:     new Date(p.created_at || Date.now()).toLocaleDateString('fr-FR'),
            shared:      false,
            status:      'actif',
            religion:    p.religion || null,
            groupe_sanguin: p.groupe_sanguin || null,
            allergies:   Array.isArray(p.allergies) ? p.allergies : ['Aucune allergie connue'],
            antecedents: _formaterAntecedents(p.antecedents || {}),
            diag:        'Chargement...',
            diagSince:   '',
            iaPct:       0,
            vitals:      {},
            treatments:  [],
            docs:        [],
            notes:       '',
            iaDiags:     [],
            iaDiffs:     [],
            iaCriteria:  [],
            tl:          [],
          };
        });
        setPatients(obj);
      } catch (err) {
        setError(err.message);
        addToast('error', 'Erreur', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Charger les consultations quand un patient est sélectionné ──
  useEffect(() => {
    if (!selected) return;
    const patient = patients[selected];
    if (!patient || patient.diag !== 'Chargement...') return;

    const loadConsultations = async () => {
      try {
        const token    = localStorage.getItem('token') || localStorage.getItem('access_token');
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res      = await fetch(`${BASE_URL}/patients/${selected}/consultations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const consultations = await res.json();

        if (!consultations.length) {
          setPatients(prev => ({
            ...prev,
            [selected]: { ...prev[selected], diag: 'Aucune consultation', iaPct: 0 },
          }));
          return;
        }

        const derniere = consultations[0];
        setPatients(prev => ({
          ...prev,
          [selected]: {
            ...prev[selected],
            diag:      derniere.diagnostic?.maladies?.[0]?.nom    || 'Pas de diagnostic',
            diagSince: `Consulté le ${new Date(derniere.created_at).toLocaleDateString('fr-FR')}`,
            iaPct:     derniere.diagnostic?.maladies?.[0]?.pct    || 0,
            notes:     derniere.observations                       || '',
            tl: consultations.map(c => ({
              date:  new Date(c.created_at).toLocaleDateString('fr-FR'),
              title: c.diagnostic?.maladies?.[0]?.nom || 'Consultation',
              note:  c.observations || c.recommandations || '',
              ia:    c.diagnostic?.maladies?.[0]?.pct || 0,
              color: c.statut === 'terminee' ? '#1D6FEB' : '#D97706',
              conc:  'En attente',
            })),
            iaDiags: consultations
              .filter(c => c.diagnostic)
              .map(c => ({
                date: new Date(c.created_at).toLocaleDateString('fr-FR'),
                diag: c.diagnostic.maladies?.[0]?.nom || '—',
                pct:  c.diagnostic.maladies?.[0]?.pct || 0,
                conc: 'Concordant',
              })),
          },
        }));
      } catch (err) {
        console.error('Erreur chargement consultations:', err);
      }
    };
    loadConsultations();
  }, [selected]);

  const handleStatusChange = (newStatus) => {
    if (!selected) return;
    setPatients(prev => ({ ...prev, [selected]: { ...prev[selected], status: newStatus } }));
    addToast("success", "Statut mis à jour", STATUS_CONFIG[newStatus]?.label);
  };

  const filteredPatients = Object.entries(patients).filter(([, p]) => {
    const matchSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || (p.diag || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all"
      || (filter === "urgent" && p.status === "urgent")
      || (filter === "shared" && p.shared);
    return matchSearch && matchFilter;
  });

  const currentPatient = selected ? patients[selected] : null;

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-(--t3)">Chargement des patients...</p>
      </div>
    </div>
  );

  if (error && Object.keys(patients).length === 0) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
        <p className="text-sm font-medium text-red-800">Impossible de charger les patients</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <button onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[var(--bg)] text-(--t1)" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Toast toasts={toasts} remove={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* List pane */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-w-0 overflow-y-auto p-6"
          >
            {/* Filters + actions */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6 flex-wrap gap-3"
            >
              <div className="flex items-center gap-1.5 bg-(--sf) border border-(--ln) rounded-xl p-1.5 shadow-sm">
                {[
                  { id: "all", label: "Tous", count: 134 },
                  { id: "urgent", label: "Urgents", count: 3 },
                  { id: "shared", label: "Partagés" },
                ].map(f => (
                  <motion.button
                    key={f.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                      ${filter === f.id ? "bg-blue-600 text-white shadow-md" : "text-(--t2) hover:text-(--t1) hover:bg-(--sf2)"}`}
                  >
                    {f.label}
                    {f.count && <span className={`ml-1.5 text-xs font-semibold ${filter === f.id ? "text-blue-200" : "text-(--t4)"}`}>{f.count}</span>}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-(--t2) bg-(--sf) border border-(--ln) rounded-lg hover:bg-(--sf2) transition-all shadow-sm">
                  <Download size={14} />Exporter CSV
                </motion.button>
                <motion.a whileHover={{ scale: 1.05 }} href="#" className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 border border-blue-700 rounded-lg hover:bg-blue-700 transition-all shadow-md">
                  <Plus size={14} />Nouveau patient
                </motion.a>
              </div>
            </motion.div>

            {/* Searchbar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative mb-6"
            >
              <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-(--t4)" />
              <input
                type="text"
                placeholder="Rechercher par nom, pathologie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-(--sf) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
              />
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm"
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-(--sf2) border-b border-(--ln)">
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Patient</th>
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Pathologie</th>
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Concordance</th>
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Partage</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(([id, p], i) => (
                    <PatientRow key={id} patient={p} selected={selected === id}
                      onClick={() => setSelected(selected === id ? null : id)} />
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-(--t4) text-sm">Aucun patient trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </motion.div>

          {/* Detail panel */}
          {currentPatient && (
            <DetailPanel
              patient={currentPatient}
              onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
function _calculerAge(dateNaissance) {
  if (!dateNaissance) return 'N/A';
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} ans`;
}

function _formaterAntecedents(antecedents) {
  if (!antecedents || typeof antecedents !== 'object') return ['Aucun antécédent renseigné'];
  const labels = {
    diabete: 'Diabète', hypertension: 'Hypertension', asthme: 'Asthme',
    bpco: 'BPCO', tuberculose: 'Tuberculose', vih: 'VIH/SIDA',
    cancerPoumon: 'Cancer du poumon', hepatiteB: 'Hépatite B',
  };
  const result = [];
  if (antecedents.tabagisme === 'fumeur')
    result.push(`Tabagisme actif${antecedents.cigarettesParJour ? ` (${antecedents.cigarettesParJour} cig/j)` : ''}`);
  if (antecedents.tabagisme === 'ancien')
    result.push('Ancien fumeur');
  Object.entries(labels).forEach(([key, label]) => {
    if (antecedents[key]) result.push(label);
  });
  if (antecedents.allergieMedicaments)
    result.push(`Allergie : ${antecedents.allergieMedicaments}`);
  return result.length ? result : ['Aucun antécédent renseigné'];
}
