import { useState, useEffect, useRef } from "react";
import { TablePagination } from '../../../components/ui/TablePagination';
import { useNavigate } from "react-router-dom";
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
  LogOut, Moon, Sun, Filter, SlidersHorizontal,
  Home, Brain, Hospital, Info
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
  actif:   { label: "Actif",      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", dot: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-500/30", ring: "bg-emerald-500", darkBg: "dark:bg-emerald-950", darkBorder: "dark:border-emerald-700" },
  urgent:  { label: "Urgent",     color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-500/10",         dot: "bg-red-500",     border: "border-red-200 dark:border-red-500/30",         ring: "bg-red-500",     darkBg: "dark:bg-red-950",     darkBorder: "dark:border-red-700" },
  attente: { label: "En attente", color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",     dot: "bg-amber-500",   border: "border-amber-200 dark:border-amber-500/30",     ring: "bg-amber-500",   darkBg: "dark:bg-amber-950",   darkBorder: "dark:border-amber-700" },
  cloture: { label: "Clôturé",    color: "text-(--t3)",                            bg: "bg-(--sf2)",                           dot: "bg-slate-400",   border: "border-(--ln)",                                 ring: "bg-slate-400",   darkBg: "",                    darkBorder: "" },
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
      <td className="px-4 py-3">
        <div className="text-sm text-(--t2) font-medium">{patient.diag}</div>
        {patient.diagSince && (
          <div className="text-[10px] text-(--t4) mt-0.5">{patient.diagSince}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="text-xs text-(--t2) font-medium">{patient.created}</div>
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
      <td className="px-4 py-3">
        {/* Badge IA + concordance du dernier diagnostic */}
        <Badge variant={iaBadge} className="mb-1">IA {patient.iaPct}%</Badge>
        {patient.iaDiags?.[0]?.concordance === true && (
          <div className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <CheckCircle2 size={11} />Concordant
          </div>
        )}
        {patient.iaDiags?.[0]?.concordance === false && (
          <div>
            <div className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
              <AlertTriangle size={11} />Divergent
            </div>
            {patient.iaDiags[0].diagnosticFinal && (
              <div className="text-[10px] text-(--t4)">→ {patient.iaDiags[0].diagnosticFinal}</div>
            )}
          </div>
        )}
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
  const v = p.vitals || {};
  const vitals = [
    { label: "SpO₂",         value: v.spo2,  unit: "%",     warn: v.spo2  != null && v.spo2  < 93  },
    { label: "Fréq. resp.",  value: v.fr,    unit: "c/min", warn: v.fr    != null && v.fr    > 25  },
    { label: "Temp.",        value: v.temp,  unit: "°C",    warn: v.temp  != null && v.temp  > 38  },
    { label: "Pression art.",value: v.pa,    unit: "",      warn: false },
    { label: "Fréq. card.",  value: v.fc,    unit: "bpm",   warn: v.fc    != null && v.fc    > 100 },
    { label: "Poids",        value: v.poids, unit: "",      warn: false },
  ].filter(item => item.value != null);

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
        <InfoRow label="Médecin référent" value={p.medecin_referent || 'Non renseigné'} />
        {p.personne_a_contacter && <InfoRow label="Contact urgence" value={p.personne_a_contacter} />}
        {p.telephone_urgence && <InfoRow label="Tél. urgence" value={p.telephone_urgence} />}
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

      {/* Religion */}
      {p.religion && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-500/15 dark:border-amber-500/30">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            {p.religion === 'temoin_jehovah' ? 'Témoin de Jéhovah' :
             p.religion === 'musulman'       ? 'Patient Musulman'  :
             `Religion : ${p.religion}`}
          </p>
          {p.religion === 'temoin_jehovah' && (
            <p className="text-xs text-amber-700 dark:text-amber-300">Refus transfusion sanguine — alternatives non sanguines obligatoires</p>
          )}
          {p.religion === 'musulman' && (
            <p className="text-xs text-amber-700 dark:text-amber-300">Vérifier composition médicaments (halal) — adapter pendant Ramadan</p>
          )}
        </motion.div>
      )}

      {/* Groupe sanguin */}
      {p.groupe_sanguin && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-500/15 dark:border-blue-500/30">
          <p className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
            <Droplets size={12} />
            Groupe sanguin : {p.groupe_sanguin}
            {p.groupe_sanguin === 'O-'  && ' — Donneur universel (sang rare)'}
            {p.groupe_sanguin === 'AB+' && ' — Receveur universel'}
          </p>
        </motion.div>
      )}

      {/* Traitements */}
      <SectionHeader icon={Pill} label="Traitements en cours" />
      <motion.div className="mb-4">
        {(p.treatments || []).length > 0 ? (
          p.treatments.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <TreatmentRow {...t} />
            </motion.div>
          ))
        ) : p.prescriptions?.medicaments ? (
          <div className="p-3 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t2) whitespace-pre-wrap">
            {p.prescriptions.medicaments}
          </div>
        ) : (
          <p className="text-xs text-(--t4) italic px-1">Aucun traitement renseigné</p>
        )}
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

      {/* Notes */}
      <SectionHeader icon={MessageSquare} label="Notes cliniques" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="space-y-2">
        {/* Note / avis médecin */}
        {p.notes ? (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-sm text-(--t2) leading-relaxed shadow-sm">
            {p.notes}
          </div>
        ) : null}
        {/* Prescriptions de la dernière consultation */}
        {p.prescriptions?.medicaments && (
          <div className="bg-(--sf2) border border-(--ln) rounded-xl p-3">
            <p className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-(--t4) mb-1.5"><Pill size={10} />Dernière prescription</p>
            <p className="text-sm text-(--t2) whitespace-pre-wrap">{p.prescriptions.medicaments}</p>
          </div>
        )}
        {p.prescriptions?.conseils_maison && (
          <div className="bg-(--sf2) border border-(--ln) rounded-xl p-3">
            <p className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-(--t4) mb-1.5"><Home size={10} />Conseils à domicile</p>
            <p className="text-sm text-(--t2)">{p.prescriptions.conseils_maison}</p>
          </div>
        )}
        {p.prescriptions?.suivi && p.prescriptions.suivi !== '7 jours' && (
          <div className="bg-(--sf2) border border-(--ln) rounded-xl p-3 flex items-center gap-2">
            <p className="flex items-center gap-1 text-xs text-(--t3)"><Calendar size={10} />Suivi prévu dans : <span className="font-semibold text-(--t1)">{p.prescriptions.suivi}</span></p>
          </div>
        )}
        {!p.notes && !p.prescriptions?.medicaments && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-sm text-(--t4) italic leading-relaxed shadow-sm">
            Aucune note clinique — le médecin n'a pas encore renseigné d'observations.
          </div>
        )}
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
        className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-700/40 rounded-2xl p-5 flex items-center gap-5 mb-6 shadow-sm"
      >
        <IARing pct={p.iaPct} size={80} />
        <div className="flex-1">
          <div className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Concordance IA globale</div>
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
            className={`p-3.5 rounded-xl border ${i === 0 ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-700/40 shadow-sm" : "bg-(--sf) border-(--ln) hover:bg-(--sf2) hover:shadow-md transition-shadow"}`}
          >
            {/* Diagnostic IA */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-(--t1)">{d.diag}</span>
              <Badge variant={d.pct >= 80 ? "green" : d.pct >= 70 ? "blue" : "amber"}>{d.pct}%</Badge>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-(--t4)">{d.date} {d.heure && `· ${d.heure}`}</span>
              <Badge variant={d.version_modele === 'equipe' ? 'green' : 'slate'}>
                {d.version_modele === 'equipe' ? 'Modèle équipé 96.8%' : 'Modèle base 53.2%'}
              </Badge>
            </div>
            {/* Avis médecin */}
            {d.concordance !== null && d.concordance !== undefined ? (
              <div className={`mt-2 pt-2 border-t border-(--ln) rounded-lg px-2 py-1.5 ${d.concordance ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700/30' : 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/30'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-(--t4)">Avis médecin</span>
                  <span className={`text-[10px] font-semibold inline-flex items-center gap-1 ${d.concordance ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {d.concordance ? <><CheckCircle2 size={10} />Concordant</> : <><AlertTriangle size={10} />Divergent</>}
                  </span>
                </div>
                {d.diagnosticFinal && d.diagnosticFinal !== d.diag && (
                  <p className="text-xs text-(--t2)">Diagnostic retenu : <strong>{d.diagnosticFinal}</strong></p>
                )}
                {d.commentaire && (
                  <p className="text-xs text-(--t3) mt-0.5 italic">"{d.commentaire}"</p>
                )}
              </div>
            ) : d.statut === 'en_attente' ? (
              <div className="mt-2 pt-2 border-t border-(--ln)">
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium"><Clock size={11} />En attente de l'avis médecin</span>
              </div>
            ) : null}
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
      <motion.div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm mb-6">
        {p.iaCriteria.length > 0 ? p.iaCriteria.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between px-4 py-3 border-b border-(--ln) last:border-0 hover:bg-(--sf2) transition-colors">
            <span className="text-sm text-(--t1)">{c.label}</span>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
              <CheckCircle2 size={13} />Présent
            </span>
          </motion.div>
        )) : (
          <p className="px-4 py-3 text-sm text-(--t4) italic">Aucun critère disponible pour cette consultation</p>
        )}
      </motion.div>

      {/* Recommandations IA */}
      {(p.recommendations || []).length > 0 && (
        <>
          <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Recommandations IA</p>
          <div className="space-y-1.5 mb-6">
            {p.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-xs">
                <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-(--t2)">{rec}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Examens recommandés */}
      {(p.examens || []).length > 0 && (
        <>
          <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Examens recommandés</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {p.examens.map((e, i) => (
              <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-xs border border-blue-200 dark:border-blue-500/20 font-medium">
                {e}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Alertes cliniques (religion, groupe sanguin) */}
      {(p.alertes || []).length > 0 && (
        <>
          <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Alertes cliniques</p>
          <div className="space-y-2 mb-6">
            {p.alertes.map((alerte, i) => (
              <div key={i} className={`p-3 rounded-xl border ${
                alerte.type === 'religious'      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' :
                alerte.type === 'groupe_sanguin' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' :
                'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
              }`}>
                <p className={`text-xs font-bold mb-1.5 ${
                  alerte.type === 'religious'      ? 'text-amber-800 dark:text-amber-200' :
                  alerte.type === 'groupe_sanguin' ? 'text-blue-800 dark:text-blue-200' :
                  'text-red-800 dark:text-red-200'
                }`}>{alerte.titre}</p>
                {(alerte.restrictions || []).map((r, j) => (
                  <p key={j} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5 mb-0.5">
                    <XCircle size={11} className="mt-0.5 shrink-0" />{r}
                  </p>
                ))}
                {(alerte.recommandations_speciales || []).map((r, j) => (
                  <p key={j} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 mb-0.5">
                    <CheckCircle2 size={11} className="mt-0.5 shrink-0" />{r}
                  </p>
                ))}
                {(alerte.infos || []).map((r, j) => (
                  <p key={j} className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5 mb-0.5">
                    <Info size={11} className="mt-0.5 shrink-0" />{r}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Prescriptions médecin (concordance + diagnostic retenu) */}
      {p.iaDiags?.[0]?.concordance !== null && p.iaDiags?.[0]?.concordance !== undefined && (
        <>
          <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Avis médecin — Dernière consultation</p>
          <div className={`p-3 rounded-xl border mb-6 ${p.iaDiags[0].concordance ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-700/30' : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-700/30'}`}>
            <p className={`flex items-center gap-1.5 text-sm font-bold ${p.iaDiags[0].concordance ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {p.iaDiags[0].concordance ? <><CheckCircle2 size={14} />Concordant avec le diagnostic IA</> : <><AlertTriangle size={14} />Divergent du diagnostic IA</>}
            </p>
            {!p.iaDiags[0].concordance && p.iaDiags[0].diagnosticFinal && (
              <p className="text-xs font-semibold text-(--t1) mt-1">Diagnostic retenu : {p.iaDiags[0].diagnosticFinal}</p>
            )}
            {p.iaDiags[0].commentaire && (
              <p className="text-xs text-(--t3) mt-1 italic">"{p.iaDiags[0].commentaire}"</p>
            )}
          </div>
        </>
      )}

      {/* Prescriptions */}
      {(p.prescriptions?.medicaments || p.prescriptions?.conseils_maison || p.prescriptions?.recommandations) && (
        <>
          <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Prescriptions médecin</p>
          <div className="space-y-2 mb-6">
            {p.prescriptions.medicaments && (
              <div className="p-3 bg-(--sf2) border border-(--ln) rounded-xl">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1"><Pill size={10} />Médicaments</p>
                <p className="text-sm text-(--t2) whitespace-pre-wrap">{p.prescriptions.medicaments}</p>
              </div>
            )}
            {p.prescriptions.conseils_maison && (
              <div className="p-3 bg-(--sf2) border border-(--ln) rounded-xl">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1"><Home size={10} />Conseils</p>
                <p className="text-sm text-(--t2)">{p.prescriptions.conseils_maison}</p>
              </div>
            )}
            {p.prescriptions.recommandations && (
              <div className="p-3 bg-(--sf2) border border-(--ln) rounded-xl">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1"><ClipboardList size={10} />Recommandations</p>
                <p className="text-sm text-(--t2)">{p.prescriptions.recommandations}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {p.prescriptions.arret_travail && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                  <Home size={10} />Arrêt de travail {p.prescriptions.duree_arret ? `— ${p.prescriptions.duree_arret}j` : ''}
                </span>
              )}
              {p.prescriptions.hospitalisation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                  <Hospital size={10} />Hospitalisation
                </span>
              )}
              {p.prescriptions.suivi && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-(--sf2) border border-(--ln) text-(--t2) rounded-full text-xs font-semibold">
                  <Calendar size={10} />Suivi : {p.prescriptions.suivi}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function HistoryTab({ p, onAvisSaved }) {
  const [avisModal,   setAvisModal]   = useState(null);
  const [avisData,    setAvisData]    = useState({
    concordanceIA: null, diagnosticFinal: '', diagnosticAutre: '',
    medicaments: '', conseilsMaison: '', recommandations: '',
    arretTravail: false, dureeArret: '7', hospitalisation: false,
    motifHospitalisation: '', suivi: '7 jours', observations: '',
  });
  const [savingAvis,  setSavingAvis]  = useState(false);
  const [expanded,    setExpanded]    = useState({});
  const [avisSuccess, setAvisSuccess] = useState(false);

  const handleSaveAvis = async () => {
    if (!avisModal) return;
    setSavingAvis(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const diagRetenu = avisData.diagnosticFinal === 'autre'
        ? avisData.diagnosticAutre
        : avisData.diagnosticFinal;

      // 1. Sauvegarder l'opinion
      if (avisModal.consultation_id) {
        const res = await fetch(`${BASE}/consultations/${avisModal.consultation_id}/opinion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            medicaments:           avisData.medicaments           || null,
            conseils_maison:       avisData.conseilsMaison        || null,
            recommandations:       avisData.recommandations       || null,
            arret_travail:         avisData.arretTravail          || false,
            duree_arret:           avisData.arretTravail ? parseInt(avisData.dureeArret) : null,
            hospitalisation:       avisData.hospitalisation       || false,
            motif_hospitalisation: avisData.motifHospitalisation  || null,
            suivi:                 avisData.suivi                 || '7 jours',
            observations:          avisData.observations          || null,
            partage: { actif: false, anonymiser: true, type: null, destinataire_id: null, envoyer_mail_patient: false },
          }),
        });
        if (!res.ok) throw new Error(`Erreur opinion: ${res.status}`);
      }

      // 2. Sauvegarder le feedback IA
      if (avisModal.diagnostic_id && avisData.concordanceIA !== null) {
        await fetch(`${BASE}/diagnostic/${avisModal.diagnostic_id}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            concordance:      avisData.concordanceIA,
            diagnostic_final: diagRetenu,
            commentaire:      avisData.observations,
          }),
        });
      }

      // 3. Mettre a jour le state local immediatement
      onAvisSaved?.(avisModal.consultation_id, {
        concordanceIA: avisData.concordanceIA,
        diagRetenu,
        observations:  avisData.observations,
        prescriptions: {
          medicaments:     avisData.medicaments,
          conseils_maison: avisData.conseilsMaison,
          suivi:           avisData.suivi,
          arret_travail:   avisData.arretTravail,
          duree_arret:     avisData.dureeArret,
          hospitalisation: avisData.hospitalisation,
        },
      });

      // 4. Toast confirmation
      setAvisSuccess(true);
      setTimeout(() => setAvisSuccess(false), 4000);
      setAvisModal(null);

    } catch (err) {
      console.error('Erreur saveAvis:', err);
      alert(`Erreur : ${err.message}`);
    } finally {
      setSavingAvis(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      {/* Toast confirmation avis enregistré */}
      {avisSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Avis enregistré avec succès</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">La consultation a été mise à jour avec votre avis médical.</p>
          </div>
        </motion.div>
      )}
      {(!p.tl || p.tl.length === 0) && (
        <p className="text-sm text-(--t4) text-center py-8">Aucune consultation enregistrée</p>
      )}
      {(p.tl || []).map((t, i) => {
        const isOpen = expanded[i];
        const symp   = t.symptomes || {};
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }} className="flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center w-5 shrink-0 pt-1.5">
              <div className="w-3 h-3 rounded-full shrink-0 shadow-md border-2 border-white dark:border-slate-800"
                style={{ background: t.color }} />
              {i < p.tl.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-slate-300 to-slate-100 dark:from-slate-600 dark:to-slate-800 mt-1 min-h-[40px]" />}
            </div>
            <div className="flex-1 bg-(--sf) border border-(--ln) rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button onClick={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))}
                className="w-full text-left p-3 flex items-start justify-between gap-2 hover:bg-(--sf2) transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-(--t1)">{t.title}</span>
                    <Badge variant={t.ia >= 80 ? "green" : t.ia >= 70 ? "blue" : "amber"}>IA {t.ia}%</Badge>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${t.statut === "terminee" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"}`}>
                      {t.statut === "terminee" ? <><CheckCircle2 size={9} />Terminée</> : <><Clock size={9} />En cours</>}
                    </span>
                  </div>
                  <div className="text-xs text-(--t4)">{t.date}{t.heure ? ` · ${t.heure}` : ""}</div>
                </div>
                <ChevronDown size={14} className={`text-(--t4) shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-(--ln) p-3 space-y-3">
                  <div>
                    <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1.5"><Brain size={10} />Diagnostic IA</p>
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-3 py-2">
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t.title}</span>
                      <Badge variant="blue">{t.ia}%</Badge>
                    </div>
                  </div>
                  {(symp.saturation_o2 != null || symp.temperature != null || symp.frequence_respiratoire != null || symp.frequence_cardiaque != null || symp.fvc != null) && (
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1.5"><ClipboardList size={10} />Paramètres cliniques</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {symp.saturation_o2 != null && <div className={`px-2 py-1.5 rounded-lg text-xs border ${symp.saturation_o2 < 94 ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300" : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"}`}><span className="font-bold">SpO₂</span> {symp.saturation_o2}%</div>}
                        {symp.temperature != null && <div className={`px-2 py-1.5 rounded-lg text-xs border ${symp.temperature > 38 ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300" : "bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20 text-(--t2)"}`}><span className="font-bold">Temp.</span> {symp.temperature}°C</div>}
                        {symp.frequence_respiratoire != null && <div className="px-2 py-1.5 rounded-lg text-xs border bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20 text-(--t2)"><span className="font-bold">FR</span> {symp.frequence_respiratoire} c/min</div>}
                        {symp.frequence_cardiaque != null && <div className="px-2 py-1.5 rounded-lg text-xs border bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20 text-(--t2)"><span className="font-bold">FC</span> {symp.frequence_cardiaque} bpm</div>}
                        {symp.fvc != null && <div className="px-2 py-1.5 rounded-lg text-xs border bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300"><span className="font-bold">FVC</span> {symp.fvc} L</div>}
                        {symp.fec1 != null && <div className="px-2 py-1.5 rounded-lg text-xs border bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300"><span className="font-bold">FEV1</span> {symp.fec1} L</div>}
                      </div>
                    </div>
                  )}
                  {(t.recommandations_ia || []).length > 0 && (
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1.5"><CheckCircle2 size={10} />Recommandations IA</p>
                      {t.recommandations_ia.map((rec, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-xs text-(--t2) mb-1">
                          <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" /><span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {t.prescriptions?.medicaments && (
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1.5"><Pill size={10} />Prescriptions</p>
                      <div className="p-2 bg-(--sf2) rounded-lg text-xs text-(--t2) whitespace-pre-wrap">{t.prescriptions.medicaments}</div>
                    </div>
                  )}
                  {(t.examens || []).length > 0 && (
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1.5"><Microscope size={10} />Examens recommandés</p>
                      <div className="flex flex-wrap gap-1">{t.examens.map((e, j) => <span key={j} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-[10px] border border-blue-200 dark:border-blue-500/20">{e}</span>)}</div>
                    </div>
                  )}
                  {t.note && (
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1.5"><FileText size={10} />Note du médecin</p>
                      <div className="p-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-200 italic">"{t.note}"</div>
                    </div>
                  )}
                  {t.concordance !== null && t.concordance !== undefined ? (
                    <div className={`p-2.5 rounded-lg border ${t.concordance ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"}`}>
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1"><Stethoscope size={10} />Avis médecin</p>
                      <p className={`inline-flex items-center gap-1 text-xs font-semibold ${t.concordance ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                        {t.concordance ? <><CheckCircle2 size={11} />Concordant avec l'IA</> : <><AlertTriangle size={11} />Divergent</>}
                      </p>
                      {!t.concordance && t.diagnosticFinal && <p className="text-xs font-bold text-(--t1) mt-0.5">→ {t.diagnosticFinal}</p>}
                      {t.commentaireMedecin && <p className="text-xs text-(--t3) mt-1 italic">"{t.commentaireMedecin}"</p>}
                    </div>
                  ) : (
                    <button onClick={() => {
                        setAvisModal(t);
                        setAvisData({
                          concordanceIA: null,
                          diagnosticFinal: t.title || '',
                          diagnosticAutre: '',
                          medicaments: '', conseilsMaison: '', recommandations: '',
                          arretTravail: false, dureeArret: '7',
                          hospitalisation: false, motifHospitalisation: '',
                          suivi: '7 jours', observations: '',
                        });
                      }}
                      className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1.5">
                      <Edit3 size={11} />Donner mon avis sur cette consultation
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      {avisModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-(--sf) rounded-2xl w-full max-w-xl shadow-2xl border border-(--ln) my-4">

            {/* En-tete */}
            <div className="flex items-center justify-between p-5 border-b border-(--ln)">
              <div>
                <h2 className="font-bold text-base text-(--t1)">Avis médical — {avisModal.date}</h2>
                <p className="text-xs text-(--t4) mt-0.5">Remplissez votre avis clinique complet</p>
              </div>
              <button onClick={() => setAvisModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-(--t4) hover:text-(--t1) hover:bg-(--sf2)"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">

              {/* Rappel diagnostic IA */}
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                <p className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-300 font-semibold mb-0.5"><Brain size={11} />Diagnostic IA suggéré</p>
                <p className="text-sm font-bold text-(--t1)">{avisModal.title} — {avisModal.ia}%</p>
                {(avisModal.differentiels || []).length > 0 && (
                  <p className="text-xs text-(--t4) mt-1">Différentiels : {avisModal.differentiels.map(d => `${d.nom} (${d.pct}%)`).join(', ')}</p>
                )}
              </div>

              {/* Diagnostic retenu */}
              <div>
                <p className="text-xs font-bold text-(--t2) mb-2">Diagnostic retenu cliniquement *</p>
                <div className="border border-(--ln) dark:border-slate-600 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                  {[avisModal.title, ...(avisModal.differentiels || []).map(d => d.nom)].filter(Boolean).map((diag, i) => (
                    <label key={i} className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors border-b border-(--ln) dark:border-slate-700 last:border-0 ${avisData.diagnosticFinal === diag ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-(--sf2)'}`}>
                      <input type="radio" name="diagFinal" value={diag}
                        checked={avisData.diagnosticFinal === diag}
                        onChange={() => setAvisData(prev => ({ ...prev, diagnosticFinal: diag }))}
                        className="w-3.5 h-3.5 accent-blue-600" />
                      <span className="text-sm text-(--t1) flex-1">{diag}</span>
                      {i === 0 && <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full font-semibold">IA</span>}
                    </label>
                  ))}
                  {['Allergic Rhinitis','Asthma','Bronchitis','COPD','COVID-19','Common Cold','Cystic Fibrosis','Influenza','Lung Cancer','Pneumonia','Pneumothorax','Sinusitis','Sleep Apnea','Tuberculosis']
                    .filter(d => ![avisModal.title, ...(avisModal.differentiels||[]).map(x=>x.nom)].includes(d))
                    .map((diag, i) => (
                      <label key={`oth-${i}`} className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors border-b border-(--ln) dark:border-slate-700 last:border-0 ${avisData.diagnosticFinal === diag ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-(--sf2)'}`}>
                        <input type="radio" name="diagFinal" value={diag}
                          checked={avisData.diagnosticFinal === diag}
                          onChange={() => setAvisData(prev => ({ ...prev, diagnosticFinal: diag }))}
                          className="w-3.5 h-3.5 accent-blue-600" />
                        <span className="text-sm text-(--t1)">{diag}</span>
                      </label>
                    ))}
                  <label className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${avisData.diagnosticFinal === 'autre' ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-(--sf2)'}`}>
                    <input type="radio" name="diagFinal" value="autre"
                      checked={avisData.diagnosticFinal === 'autre'}
                      onChange={() => setAvisData(prev => ({ ...prev, diagnosticFinal: 'autre' }))}
                      className="w-3.5 h-3.5 accent-blue-600" />
                    <span className="text-sm text-(--t1)">Autre diagnostic...</span>
                  </label>
                </div>
                {avisData.diagnosticFinal === 'autre' && (
                  <input value={avisData.diagnosticAutre}
                    onChange={e => setAvisData(prev => ({ ...prev, diagnosticAutre: e.target.value }))}
                    placeholder="Précisez le diagnostic retenu..."
                    className="w-full mt-2 border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                )}
              </div>

              {/* Concordance IA - OBLIGATOIRE */}
              <div>
                <p className="text-xs font-bold text-(--t2) mb-2">Concordance avec le diagnostic IA *</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setAvisData(prev => ({ ...prev, concordanceIA: true }))}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${avisData.concordanceIA === true ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-(--sf) text-(--t2) border-(--ln) dark:border-slate-600 hover:border-emerald-400'}`}>
                    <CheckCircle2 size={14} />Je confirme l'IA
                  </button>
                  <button onClick={() => setAvisData(prev => ({ ...prev, concordanceIA: false }))}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${avisData.concordanceIA === false ? 'bg-amber-500 text-white border-amber-500' : 'bg-(--sf) text-(--t2) border-(--ln) dark:border-slate-600 hover:border-amber-400'}`}>
                    <XCircle size={14} />Je diverge
                  </button>
                </div>
                {avisData.concordanceIA === null && (
                  <p className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1.5"><AlertTriangle size={11} />Sélectionnez votre position sur le diagnostic IA pour valider l'avis.</p>
                )}
              </div>

              {/* Prescription */}
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-(--t2) mb-1.5"><Pill size={11} />Prescription médicale</p>
                <textarea value={avisData.medicaments}
                  onChange={e => setAvisData(prev => ({ ...prev, medicaments: e.target.value }))}
                  placeholder="Amoxicilline 1g × 3/j pendant 7 jours..."
                  rows={3} className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="flex items-center gap-1 text-xs font-bold text-(--t2) mb-1.5"><Home size={11} />Conseils à domicile</p>
                  <textarea value={avisData.conseilsMaison}
                    onChange={e => setAvisData(prev => ({ ...prev, conseilsMaison: e.target.value }))}
                    placeholder="Hydratation, repos..." rows={2}
                    className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs font-bold text-(--t2) mb-1.5"><ClipboardList size={11} />Recommandations</p>
                  <textarea value={avisData.recommandations}
                    onChange={e => setAvisData(prev => ({ ...prev, recommandations: e.target.value }))}
                    placeholder="Consultation de contrôle..." rows={2}
                    className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>

              {/* Arret travail + Hospitalisation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-(--sf2) rounded-xl border border-(--ln) dark:border-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={avisData.arretTravail}
                      onChange={e => setAvisData(prev => ({ ...prev, arretTravail: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-xs font-semibold text-(--t2)">Arrêt de travail</span>
                  </label>
                  {avisData.arretTravail && (
                    <input type="number" value={avisData.dureeArret}
                      onChange={e => setAvisData(prev => ({ ...prev, dureeArret: e.target.value }))}
                      placeholder="Durée (jours)"
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  )}
                </div>
                <div className="p-3 bg-(--sf2) rounded-xl border border-(--ln) dark:border-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={avisData.hospitalisation}
                      onChange={e => setAvisData(prev => ({ ...prev, hospitalisation: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-xs font-semibold text-(--t2)">Hospitalisation</span>
                  </label>
                  {avisData.hospitalisation && (
                    <input value={avisData.motifHospitalisation}
                      onChange={e => setAvisData(prev => ({ ...prev, motifHospitalisation: e.target.value }))}
                      placeholder="Motif..."
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  )}
                </div>
              </div>

              {/* Suivi */}
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-(--t2) mb-1.5"><Calendar size={11} />Suivi prévu</p>
                <select value={avisData.suivi}
                  onChange={e => setAvisData(prev => ({ ...prev, suivi: e.target.value }))}
                  className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="7 jours">7 jours</option>
                  <option value="15 jours">15 jours</option>
                  <option value="1 mois">1 mois</option>
                  <option value="3 mois">3 mois</option>
                  <option value="6 mois">6 mois</option>
                </select>
              </div>

              {/* Observations */}
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-(--t2) mb-1.5"><FileText size={11} />Observations cliniques</p>
                <textarea value={avisData.observations}
                  onChange={e => setAvisData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Notes complémentaires, contexte particulier, évolution attendue..."
                  rows={3} className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-5 border-t border-(--ln)">
              <button onClick={() => setAvisModal(null)}
                className="flex-1 py-2.5 border border-(--ln) dark:border-slate-600 rounded-xl text-sm font-semibold text-(--t2) hover:bg-(--sf2) transition-colors">
                Annuler
              </button>
              <button onClick={handleSaveAvis}
                disabled={savingAvis || avisData.concordanceIA === null}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
                {savingAvis
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enregistrement...</>
                  : <><CheckCircle2 size={14} />Enregistrer l'avis</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const CLINIQUE_CONFIG = {
  stable:    { label: "Stable",     dot: "bg-emerald-500", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-700/40", desc: "Patient stable — suivi de routine" },
  surveille: { label: "Surveillé",  dot: "bg-amber-500",   color: "text-amber-700 dark:text-amber-300",    bg: "bg-amber-50 dark:bg-amber-900/20",    border: "border-amber-200 dark:border-amber-700/40",   desc: "Surveillance rapprochée recommandée" },
  urgent:    { label: "Urgent",     dot: "bg-orange-500",  color: "text-orange-700 dark:text-orange-300",  bg: "bg-orange-50 dark:bg-orange-900/20",  border: "border-orange-200 dark:border-orange-700/40", desc: "Consultation requise rapidement" },
  critique:  { label: "Critique",   dot: "bg-red-500",     color: "text-red-700 dark:text-red-300",        bg: "bg-red-50 dark:bg-red-900/20",        border: "border-red-200 dark:border-red-700/40",       desc: "État critique — intervention immédiate" },
};

function StatusTab({ p, onStatusChange, onStatutCliniqueChange }) {
  const avis      = p.statut_avis     || (p.status === 'actif' ? 'terminee' : 'en_attente');
  const clinique  = p.statut_clinique || null;
  const cliniqueOptions = ["stable", "surveille", "urgent", "critique"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-5">

      {/* ── Section 1 : Statut avis médecin (lecture seule) ── */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Statut avis médecin</p>
        <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
          avis === 'terminee'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40'
        }`}>
          <motion.span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${avis === 'terminee' ? 'bg-emerald-500' : 'bg-amber-500'}`}
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="flex-1">
            <p className={`text-sm font-bold ${avis === 'terminee' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {avis === 'terminee' ? 'Avis donné' : 'En attente d\'avis'}
            </p>
            <p className="text-xs text-(--t4) mt-0.5">
              {avis === 'terminee' ? 'Consultation terminée — prescription enregistrée' : 'Le médecin n\'a pas encore validé cette consultation'}
            </p>
          </div>
          <CheckCircle2 size={16} className={avis === 'terminee' ? 'text-emerald-500' : 'text-amber-400 opacity-40'} />
        </div>
      </div>

      {/* ── Section 2 : État clinique IA (modifiable) ── */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">État clinique</p>
        {clinique && (
          <motion.div
            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className={`${CLINIQUE_CONFIG[clinique].bg} ${CLINIQUE_CONFIG[clinique].border} border rounded-2xl p-3.5 mb-3 shadow-sm`}
          >
            <div className="flex items-center gap-2 mb-1">
              <motion.span className={`w-3 h-3 rounded-full ${CLINIQUE_CONFIG[clinique].dot}`} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className={`text-sm font-bold ${CLINIQUE_CONFIG[clinique].color}`}>{CLINIQUE_CONFIG[clinique].label}</span>
              <span className="ml-auto text-[10px] text-(--t4) uppercase tracking-wider">État actuel</span>
            </div>
            <p className="text-xs text-(--t3)">{CLINIQUE_CONFIG[clinique].desc}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {cliniqueOptions.map((s, i) => {
            const cfg    = CLINIQUE_CONFIG[s];
            const active = s === clinique;
            return (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onStatutCliniqueChange?.(s)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left
                  ${active ? `${cfg.bg} ${cfg.border} ${cfg.color} shadow-md` : "bg-(--sf) border-(--ln) text-(--t2) hover:bg-(--sf2)"}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <span className="text-xs font-bold">{cfg.label}</span>
                {active && <CheckCircle2 size={14} className="ml-auto" />}
              </motion.button>
            );
          })}
        </div>
        {!clinique && (
          <p className="text-xs text-(--t4) text-center mt-2 italic">Aucun diagnostic IA disponible</p>
        )}
      </div>

      {/* ── Prochain suivi ── */}
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

function AccessTab({ p }) {
  const [acces,     setAcces]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [revoking,  setRevoking]  = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token  = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('pneumoia_token');
        const BASE   = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res    = await fetch(`${BASE}/patients/${p.id}/acces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAcces(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erreur chargement accès:', err);
      } finally {
        setLoading(false);
      }
    };
    if (p?.id) load();
  }, [p?.id]);

  const handleRevoquer = async (medecinId) => {
    setRevoking(medecinId);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('pneumoia_token');
      const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const res   = await fetch(`${BASE}/patients/${p.id}/acces/${medecinId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAcces(prev => prev.filter(a => a.medecin_id !== medecinId));
      }
    } catch (err) {
      console.error('Erreur révocation:', err);
    } finally {
      setRevoking(null);
    }
  };

  // Propriétaire = premier médecin avec role 'proprietaire', ou créateur de la consultation
  const proprietaire = acces.find(a => a.role === 'proprietaire' || a.est_proprietaire);
  const autresAcces  = acces.filter(a => a !== proprietaire);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Médecins ayant accès</p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Propriétaire */}
          {proprietaire ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl mb-2 shadow-sm dark:bg-blue-500/10 dark:border-blue-500/20">
              <Avatar
                initials={`${proprietaire.prenom?.[0] || ''}${proprietaire.nom?.[0] || ''}`}
                size="sm" color="bg-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-(--t1)">
                  Dr. {proprietaire.prenom} {proprietaire.nom}
                  {proprietaire.est_moi && <span className="text-(--t3) font-normal ml-1">(vous)</span>}
                </div>
                <div className="text-xs text-(--t3)">
                  Propriétaire{proprietaire.specialite ? ` · ${proprietaire.specialite}` : ''}
                  {proprietaire.ville ? `, ${proprietaire.ville}` : ''}
                </div>
              </div>
              <Badge variant="blue">Propriétaire</Badge>
            </motion.div>
          ) : (
            /* Fallback si l'API ne retourne pas les accès — afficher le médecin depuis la consultation */
            p.medecin_referent && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl mb-2 shadow-sm dark:bg-blue-500/10 dark:border-blue-500/20">
                <Avatar
                  initials={p.medecin_referent.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  size="sm" color="bg-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-(--t1)">{p.medecin_referent}</div>
                  <div className="text-xs text-(--t3)">Propriétaire · Médecin traitant</div>
                </div>
                <Badge variant="blue">Propriétaire</Badge>
              </motion.div>
            )
          )}

          {/* Autres médecins avec accès */}
          {autresAcces.map((a, i) => (
            <motion.div key={a.medecin_id || i}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-3.5 bg-(--sf2) border border-(--ln) rounded-xl mb-2">
              <Avatar
                initials={`${a.prenom?.[0] || ''}${a.nom?.[0] || ''}`}
                size="sm" color="bg-slate-400"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-(--t1)">Dr. {a.prenom} {a.nom}</div>
                <div className="text-xs text-(--t3)">
                  Accès depuis le {a.depuis ? new Date(a.depuis).toLocaleDateString('fr-FR') : '—'}
                  {a.specialite ? ` · ${a.specialite}` : ''}
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={() => handleRevoquer(a.medecin_id)}
                disabled={revoking === a.medecin_id}
                className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50">
                {revoking === a.medecin_id ? '...' : 'Révoquer'}
              </motion.button>
            </motion.div>
          ))}

          {!proprietaire && autresAcces.length === 0 && (
            <p className="text-xs text-(--t4) italic text-center py-4">Aucun accès enregistré</p>
          )}
        </>
      )}

      {/* Ajouter un accès */}
      <div className="border-t border-(--ln) mt-4 pt-4">
        <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Ajouter un accès</p>
        <motion.button whileHover={{ scale: 1.02 }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-(--sf) border-2 border-dashed border-(--ln2) rounded-xl text-sm font-bold text-(--t3) hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">
          <Plus size={16} />Envoyer une demande de partage
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── DETAIL PANEL ──────────────────────────────────────────────────────

function DetailPanel({ patient, onClose, onStatusChange, onStatutCliniqueChange, onPatientUpdated, onPatientDeleted }) {
  const navigate = useNavigate();
  const [tab,             setTab]             = useState("dossier");
  const [showModal,       setShowModal]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData,        setEditData]        = useState({});
  const [isSaving,        setIsSaving]        = useState(false);

  useEffect(() => { setTab("dossier"); }, [patient?.id]);
  useEffect(() => {
    if (patient) setEditData({
      nom:        patient.nom || '',
      prenom:     patient.prenom || '',
      civilite:   patient.civilite || '',
      telephone:  patient.tel || '',
      adresse:    patient.city || '',
      email:      patient.email || '',
      profession: patient.profession || '',
    });
  }, [patient?.id]);

  if (!patient) return null;

  const st = STATUS_CONFIG[patient.status] || STATUS_CONFIG.actif;

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
        <motion.a whileHover={{ scale: 1.05 }}
          href="/medecin/consultation"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Stethoscope size={13} />Consulter
        </motion.a>
        <motion.button whileHover={{ scale: 1.05 }}
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-(--sf) border border-(--ln) text-(--t2) text-xs font-bold rounded-lg hover:bg-(--sf2) transition-colors">
          <Edit3 size={13} />Modifier
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }}
          onClick={async () => {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
            const res   = await fetch(`${BASE}/consultations/${patient.id}/pdf`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const blob = await res.blob();
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement('a');
              a.href = url; a.download = `dossier_${patient.id}.pdf`; a.click();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-(--sf) border border-(--ln) text-(--t2) text-xs font-bold rounded-lg hover:bg-(--sf2) transition-colors">
          <Download size={13} />Télécharger
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowDeleteModal(true)}
          className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 border border-(--ln) hover:border-red-200 transition-colors dark:hover:bg-red-500/10 dark:hover:text-red-300"
          title="Supprimer ce patient">
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
        {tab === "history" && <HistoryTab p={patient} onAvisSaved={(consultationId, avisResult) => {
          // Mettre à jour le state local : remplacer la concordance dans tl
          onPatientUpdated?.(patient.id, {
            tl: (patient.tl || []).map(t =>
              t.consultation_id === consultationId
                ? { ...t, concordance: avisResult.concordanceIA, diagnosticFinal: avisResult.diagRetenu, commentaireMedecin: avisResult.observations, statut: 'terminee' }
                : t
            ),
            notes: avisResult.observations || patient.notes,
          });
        }} />}
        {tab === "status" && <StatusTab p={patient} onStatusChange={onStatusChange} onStatutCliniqueChange={onStatutCliniqueChange} />}
        {tab === "access" && <AccessTab p={patient} />}
      </motion.div>

      {/* Modal modification patient */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-(--sf) rounded-2xl w-full max-w-lg shadow-2xl border border-(--ln) flex flex-col max-h-[90vh]">

            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--ln)">
              <div>
                <h2 className="font-bold text-base text-(--t1)">Modifier le dossier patient</h2>
                <p className="text-xs text-(--t4) mt-0.5">Tous les champs de l'identité du patient</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-(--t4) hover:text-(--t1)"><X size={18} /></button>
            </div>

            {/* Corps scrollable */}
            <div className="overflow-y-auto px-6 py-4 space-y-4">

              {/* Identité */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Identité</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Civilité */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Civilité</label>
                    <select value={editData.civilite || ''} onChange={e => setEditData(p => ({...p, civilite: e.target.value}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm">
                      <option value="">—</option>
                      <option value="M">Monsieur</option>
                      <option value="Mme">Madame</option>
                    </select>
                  </div>
                  {/* Date naissance */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Date de naissance</label>
                    <input type="date" value={editData.date_naissance || ''} onChange={e => setEditData(p => ({...p, date_naissance: e.target.value}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {/* Nom */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Nom *</label>
                    <input value={editData.nom || ''} onChange={e => setEditData(p => ({...p, nom: e.target.value.toUpperCase()}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {/* Prénom */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Prénom *</label>
                    <input value={editData.prenom || ''} onChange={e => setEditData(p => ({...p, prenom: e.target.value}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {/* Téléphone */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Téléphone</label>
                    <input value={editData.telephone || ''} onChange={e => setEditData(p => ({...p, telephone: e.target.value}))}
                      placeholder="+237 6XX XXX XXX"
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Email</label>
                    <input type="email" value={editData.email || ''} onChange={e => setEditData(p => ({...p, email: e.target.value}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {/* Adresse */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Adresse</label>
                    <input value={editData.adresse || ''} onChange={e => setEditData(p => ({...p, adresse: e.target.value}))}
                      placeholder="Ville, quartier"
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {/* Profession */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Profession</label>
                    <input value={editData.profession || ''} onChange={e => setEditData(p => ({...p, profession: e.target.value}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {/* Religion */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Religion *</label>
                    <select value={editData.religion || ''} onChange={e => setEditData(p => ({...p, religion: e.target.value}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm">
                      <option value="">—</option>
                      <option value="catholique">Catholique</option>
                      <option value="protestant">Protestant</option>
                      <option value="temoin_jehovah">Témoin de Jéhovah</option>
                      <option value="musulman">Musulman</option>
                      <option value="autres">Autres</option>
                    </select>
                  </div>
                  {/* Groupe sanguin */}
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Groupe sanguin</label>
                    <select value={editData.groupe_sanguin || ''} onChange={e => setEditData(p => ({...p, groupe_sanguin: e.target.value}))}
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm">
                      <option value="">—</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                {/* Alerte Témoin de Jéhovah */}
                {editData.religion === 'temoin_jehovah' && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Patient Témoin de Jéhovah</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">Ne peut pas recevoir de transfusion sanguine. Cette info sera visible sur le dossier et dans les alertes IA.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Personne à contacter en urgence */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-3">Personne à contacter en cas d'urgence</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Nom complet</label>
                    <input value={editData.personne_a_contacter || ''} onChange={e => setEditData(p => ({...p, personne_a_contacter: e.target.value}))}
                      placeholder="Nom du contact"
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--t2) mb-1 block">Téléphone urgence</label>
                    <input value={editData.telephone_urgence || ''} onChange={e => setEditData(p => ({...p, telephone_urgence: e.target.value}))}
                      placeholder="+237 6XX XXX XXX"
                      className="w-full border border-(--ln) dark:border-slate-600 bg-(--sf) text-(--t1) rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-(--ln)">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-(--ln) dark:border-slate-600 rounded-lg text-sm text-(--t2) hover:bg-(--sf2)">
                Annuler
              </button>
              <button disabled={isSaving} onClick={async () => {
                setIsSaving(true);
                try {
                  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
                  const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                  const res   = await fetch(`${BASE}/patients/${patient.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                      nom:                  editData.nom,
                      prenom:               editData.prenom,
                      civilite:             editData.civilite        || '',
                      telephone:            editData.telephone       || null,
                      email:                editData.email           || null,
                      adresse:              editData.adresse         || null,
                      profession:           editData.profession      || null,
                      date_naissance:       editData.date_naissance  || null,
                      groupe_sanguin:       editData.groupe_sanguin  || null,
                      religion:             editData.religion        || null,
                      personne_a_contacter: editData.personne_a_contacter || null,
                      telephone_urgence:    editData.telephone_urgence    || null,
                      allergies:   patient.allergies || [],
                      antecedents: {},
                    }),
                  });
                  if (!res.ok) throw new Error('Erreur lors de la mise à jour');
                  setShowModal(false);
                  onPatientUpdated?.(patient.id, {
                    name:                 `${editData.nom} ${editData.prenom}`,
                    nom:                  editData.nom,
                    prenom:               editData.prenom,
                    civilite:             editData.civilite,
                    tel:                  editData.telephone,
                    city:                 editData.adresse,
                    email:                editData.email,
                    profession:           editData.profession,
                    religion:             editData.religion,
                    groupe_sanguin:       editData.groupe_sanguin,
                    personne_a_contacter: editData.personne_a_contacter,
                    telephone_urgence:    editData.telephone_urgence,
                    init:                 `${editData.prenom?.[0] || ''}${editData.nom?.[0] || ''}`,
                  });
                } catch (err) { console.error(err); }
                finally { setIsSaving(false); }
              }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
                {isSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Enregistrer les modifications
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal — Confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-(--sf) rounded-2xl p-6 max-w-md w-full shadow-2xl border border-(--ln)"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-(--t1)">Supprimer le dossier patient</h3>
                <p className="text-xs text-(--t3) mt-0.5">Cette action peut être annulée dans les 30 jours</p>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-(--t4) hover:text-(--t1) mt-0.5">
                <X size={16} />
              </button>
            </div>

            {/* Corps du message */}
            <div className="mb-5 space-y-3">
              <p className="text-sm text-(--t1)">
                Vous êtes sur le point de supprimer le dossier de{' '}
                <strong>{patient.civilite} {patient.prenom} {patient.nom}</strong>.
              </p>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
                <p className="flex items-start gap-1.5"><AlertTriangle size={12} className="shrink-0 mt-0.5" /><span><strong>Phase 1 — 0J à 30 Jours :</strong> Le dossier est placé dans votre corbeille. Vous pouvez le restaurer à tout moment depuis la page Corbeille.</span></p>
                <p className="flex items-start gap-1.5"><AlertTriangle size={12} className="shrink-0 mt-0.5" /><span><strong>Phase 2 — 30 Jours à 40 Jours :</strong> Le dossier est transféré à l'administrateur. Une demande de récupération reste possible.</span></p>
                <p className="flex items-start gap-1.5"><AlertTriangle size={12} className="shrink-0 mt-0.5" /><span><strong>Après 40 Jours :</strong> Le dossier est supprimé définitivement et devient irrécupérable.</span></p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-(--ln) rounded-xl text-sm font-semibold text-(--t2) hover:bg-(--sf2) transition-colors">
                Annuler
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('pneumoia_token');
                    const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                    const res   = await fetch(`${BASE}/patients/${patient.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error(`Erreur ${res.status}`);
                    setShowDeleteModal(false);
                    onPatientDeleted?.(patient.id);
                    onClose();
                  } catch (err) {
                    console.error('Erreur suppression:', err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60">
                {isSaving
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Suppression...</>
                  : <><Trash2 size={14} />Déplacer en corbeille</>}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
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
            nom:         p.nom || '',
            prenom:      p.prenom || '',
            civilite:    p.civilite || '',
            email:       p.email || '',
            profession:  p.profession || '',
            date_naissance: p.date_naissance || null,
            personne_a_contacter: p.personne_a_contacter || null,
            telephone_urgence:    p.telephone_urgence    || null,
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
        const diagPrincipal = derniere.diagnostic?.maladies?.[0];
        const symptomes     = derniere.symptomes || {};
        const presc         = derniere.prescriptions || {};

        setPatients(prev => ({
          ...prev,
          [selected]: {
            ...prev[selected],
            diag:      diagPrincipal?.nom    || 'Pas de diagnostic',
            diagSince: `Consulté le ${new Date(derniere.created_at).toLocaleDateString('fr-FR')} à ${new Date(derniere.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}`,
            iaPct:     diagPrincipal?.pct    || 0,
            medecin_referent: derniere.medecin
              ? `Dr. ${derniere.medecin.prenom || ''} ${derniere.medecin.nom || ''}`.trim()
              : (derniere.medecin_nom ? `Dr. ${derniere.medecin_nom}` : null),
            notes:        derniere.avis_medecin || derniere.observations || presc?.observations || '',
            prescriptions: presc,
            status:              derniere.statut === 'terminee' ? 'actif' : 'attente',
            statut_avis:         derniere.statut,
            statut_clinique:     derniere.statut_clinique || derniere.diagnostic?.etat_patient || null,
            derniere_consultation_id: derniere.id,
            vitals: {
              spo2:  symptomes.saturation_o2           ?? null,
              fr:    symptomes.frequence_respiratoire  ?? null,
              temp:  symptomes.temperature             ?? null,
              pa:    (symptomes.tension_systolique && symptomes.tension_diastolique)
                       ? `${symptomes.tension_systolique}/${symptomes.tension_diastolique}`
                       : null,
              fc:    symptomes.frequence_cardiaque     ?? null,
              fvc:   symptomes.fvc                     ?? null,
              fec1:  symptomes.fec1                    ?? null,
              peak_flow: symptomes.peak_flow           ?? null,
            },
            treatments: presc.medicaments
              ? presc.medicaments.split('\n').filter(Boolean).map(line => ({ name: line, dose: '' }))
              : [],
            tl: consultations.map(c => {
              const diag = c.diagnostic?.maladies?.[0];
              const fb   = c.feedback;
              return {
                date:      new Date(c.created_at).toLocaleDateString('fr-FR'),
                heure:     new Date(c.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
                title:     diag?.nom || 'Consultation',
                note:      c.avis_medecin || c.observations || c.prescriptions?.observations || '',
                ia:        diag?.pct || 0,
                color:     c.statut === 'terminee' ? '#1D6FEB' : '#D97706',
                statut:    c.statut,
                // Données cliniques
                symptomes:          c.symptomes || {},
                recommandations_ia: diag?.recommandations || [],
                examens:            c.diagnostic?.examens_recommandes || diag?.examens_suggeres || [],
                prescriptions:      c.prescriptions || {},
                differentiels:      (c.diagnostic?.maladies || []).slice(1).map(m => ({ nom: m.nom, pct: m.pct })),
                diagnostic_id:      c.diagnostic?.id || null,
                consultation_id:    c.id,
                // Concordance médecin
                concordance:        fb?.concordance,
                diagnosticFinal:    fb?.diagnostic_final,
                commentaireMedecin: fb?.commentaire,
              };
            }),
            iaDiags: consultations
              .filter(c => c.diagnostic)
              .map(c => {
                const diag = c.diagnostic.maladies?.[0];
                const fb   = c.feedback;
                // Normaliser concordance en booléen ou null
                let concordance = null;
                if (fb?.concordance !== undefined && fb?.concordance !== null) {
                  concordance = fb.concordance === true || fb.concordance === 'oui' || fb.concordance === 1;
                }
                return {
                  date:            new Date(c.created_at).toLocaleDateString('fr-FR'),
                  heure:           new Date(c.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
                  diag:            diag?.nom || '—',
                  pct:             diag?.pct || 0,
                  etat:            diag?.etat || 'stable',
                  version_modele:  c.diagnostic.version_modele || c.diagnostic.type_consultation || 'base',
                  concordance,
                  diagnosticFinal: fb?.diagnostic_final,
                  commentaire:     fb?.commentaire,
                  statut:          c.statut,
                  consultation_id: c.id,
                  diagnostic_id:   c.diagnostic?.id || null,
                };
              }),
            iaDiffs: diagPrincipal ? (derniere.diagnostic?.maladies || []).slice(1).map(m => ({
              diag: m.nom, pct: m.pct,
            })) : [],
            // ── Critères validés (depuis le diagnostic IA) ────────
            iaCriteria: (diagPrincipal?.criteres_valides || []).map(c => ({ label: c, ok: true })),
            // ── Recommandations IA ────────────────────────────────
            recommendations: diagPrincipal?.recommandations || derniere.diagnostic?.recommandations || [],
            // ── Alertes religion / groupe sanguin ─────────────────
            alertes: derniere.diagnostic?.alertes || [],
            // ── Examens recommandés ───────────────────────────────
            examens: derniere.diagnostic?.examens_recommandes
                  || diagPrincipal?.examens_suggeres
                  || [],
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

  const handleStatutCliniqueChange = async (newStatut) => {
    if (!selected) return;
    const consultationId = patients[selected]?.derniere_consultation_id;
    if (!consultationId) return;
    try {
      const token   = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('pneumoia_token');
      const BASE    = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const res     = await fetch(`${BASE}/consultations/${consultationId}/statut-clinique`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut_clinique: newStatut }),
      });
      if (!res.ok) throw new Error('Erreur réseau');
      setPatients(prev => ({ ...prev, [selected]: { ...prev[selected], statut_clinique: newStatut } }));
      addToast("success", "État clinique mis à jour", newStatut);
    } catch {
      addToast("error", "Impossible de mettre à jour l'état clinique", "");
    }
  };

  const handlePatientUpdated = (id, updates) => {
    setPatients(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    addToast("success", "Patient mis à jour", "Modifications enregistrées");
  };

  const handlePatientDeleted = (id) => {
    setPatients(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelected(null);
    addToast("success", "Dossier déplacé en corbeille", "Récupérable sous 30 jours");
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

  const [patPage,     setPatPage]     = useState(1);
  const [patPageSize, setPatPageSize] = useState(10);
  const patFrom          = (patPage - 1) * patPageSize;
  const paginatedPatients = filteredPatients.slice(patFrom, patFrom + patPageSize);

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
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Date création</th>
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-(--t4)">Concordance</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map(([id, p], i) => (
                    <PatientRow key={id} patient={p} selected={selected === id}
                      onClick={() => setSelected(selected === id ? null : id)} />
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-(--t4) text-sm">Aucun patient trouvé</td></tr>
                  )}
                </tbody>
              </table>
              <TablePagination
                total={filteredPatients.length}
                page={patPage}
                pageSize={patPageSize}
                onPageChange={setPatPage}
                onPageSizeChange={s => { setPatPageSize(s); setPatPage(1); }}
              />
            </motion.div>
          </motion.div>

          {/* Detail panel */}
          {currentPatient && (
            <DetailPanel
              patient={currentPatient}
              onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange}
              onStatutCliniqueChange={handleStatutCliniqueChange}
              onPatientUpdated={handlePatientUpdated}
              onPatientDeleted={handlePatientDeleted}
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