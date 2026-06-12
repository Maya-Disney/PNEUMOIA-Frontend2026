import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { adminLogout } from "../api/adminApi";
import logo from "../../../assets/images/logo.png";
import {
  LayoutDashboard, UserPlus, UserCheck, UserX,
  Stethoscope, UserMinus, LineChart, BarChart2,
  Brain, MapPin, FileSearch, Settings, LogOut,
  Menu, X, HelpCircle, MessageCircle
} from "lucide-react";

const BRAND    = "#007185";   // Couleur WelcomeBanner — utilisée pour avatar + accents
const BG_LIGHT = "#ffffff";   // Fond sidebar — blanc
const BG_DARK  = "#0a1a18";   // Fond sidebar — mode sombre (logique de base)

const ACTIVE_BG_L = "rgba(0,113,133,0.10)";   // Item actif — teal clair sur blanc
const ACTIVE_TX_L = "#005f6e";
const ACTIVE_BG_D = "rgba(0,113,133,0.18)";
const ACTIVE_TX_D = "#67e8f9";

const ITEM_TX_L  = "#374151";
const ITEM_TX_D  = "rgba(255,255,255,0.72)";
const HOVER_BG_L = "rgba(0,113,133,0.05)";
const HOVER_BG_D = "rgba(255,255,255,0.09)";

const SEC_L    = "#9ca3af";
const SEC_D    = "rgba(255,255,255,0.35)";
const BORDER_L = "rgba(0,0,0,0.06)";
const BORDER_D = "rgba(255,255,255,0.08)";

function getNav(counts) {
  return [
    {
      section: null,
      items: [
        { to: "/administrateur/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
      ]
    },
    {
      section: "Inscriptions",
      items: [
        { to: "/administrateur/demandes", icon: UserPlus,  label: "Nouvelles demandes", badge: counts.demandes, badgeColor: "orange" },
        { to: "/administrateur/validees", icon: UserCheck, label: "Validées ce mois" },
        { to: "/administrateur/refusees", icon: UserX,     label: "Refusées" },
      ]
    },
    {
      section: "Médecins",
      items: [
        { to: "/administrateur/medecins",  icon: Stethoscope, label: "Médecins actifs", badge: counts.actifs,    badgeColor: "teal"   },
        { to: "/administrateur/suspendus", icon: UserMinus,   label: "Suspendus" },
        { to: "/administrateur/faq",       icon: HelpCircle,  label: "FAQ Médecins",    badge: counts.faq,       badgeColor: "orange" },
      ]
    },
    {
      section: "Analyse",
      items: [
        { to: "/administrateur/activite",     icon: LineChart, label: "Courbe d'activité"   },
        { to: "/administrateur/stats",        icon: BarChart2, label: "Stats consultations" },
        { to: "/administrateur/performances", icon: Brain,     label: "Performances IA"     },
        { to: "/administrateur/geo",          icon: MapPin,    label: "Répartition géo"     },
      ]
    },
    {
      section: "Système",
      items: [
        { to: "/administrateur/commentaires", icon: MessageCircle, label: "Commentaires",   badge: counts.commentaires, badgeColor: "orange" },
        { to: "/administrateur/audit",        icon: FileSearch,    label: "Journal d'audit" },
        { to: "/administrateur/parametres",   icon: Settings,      label: "Paramètres"      },
      ]
    },
  ];
}

function getBadgeStyle(color, dark) {
  const styles = {
    light: {
      teal:   { background: "rgba(0,113,133,0.10)",   color: "#005f6e", border: "1px solid rgba(0,113,133,0.20)" },
      red:    { background: "rgba(254,226,226,0.90)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.25)" },
      orange: { background: "rgba(255,237,213,0.90)", color: "#c2410c", border: "1px solid rgba(234,88,12,0.25)" },
    },
    dark: {
      teal:   { background: "rgba(0,113,133,.15)",   color: "#67e8f9", border: "1px solid rgba(0,113,133,.2)"    },
      red:    { background: "rgba(239,68,68,.15)",   color: "#fca5a5", border: "1px solid rgba(239,68,68,.2)"     },
      orange: { background: "rgba(251,146,60,.15)",  color: "#fdba74", border: "1px solid rgba(251,146,60,.2)"    },
    },
  };
  return (dark ? styles.dark : styles.light)[color] || {};
}

export default function Sidebar({ dark }) {
  const navigate = useNavigate();
  const [open,       setOpen]       = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [counts,     setCounts]     = useState({ demandes:0, actifs:0, faq:0, commentaires:0 });

  useEffect(() => {
    // TODO: remplacer par getCounts().then(setCounts)
    setCounts({ demandes: 4, actifs: 38, faq: 3, commentaires: 5 });
  }, []);

  function confirmLogout() {
    adminLogout();
    navigate("/administrateur/login");
  }

  const bg     = dark ? BG_DARK  : BG_LIGHT;
  const border = dark ? BORDER_D : BORDER_L;

  const inner = (
    <aside
      className="h-full flex flex-col shrink-0 overflow-hidden"
      style={{ width:260, minWidth:260, maxWidth:260, background:bg, borderRight:`1px solid ${border}` }}
    >
      {/* Logo */}
      <div className="h-[96px] flex items-center justify-center px-4 shrink-0 relative"
        style={{ borderBottom:`1px solid ${border}` }}>
        <img src={logo} alt="PneumoIA"
          style={{ height:74, width:"auto", objectFit:"contain", maxWidth:200, filter:"none" }}/>
        <button onClick={()=>setOpen(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden"
          style={{ color: dark ? ITEM_TX_D : SEC_L }}>
          <X size={15}/>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {getNav(counts).map(({ section, items }, gi) => (
          <div key={gi} className={gi > 0 ? "mt-1" : ""}>
            {section && (
              <p className="text-[11px] font-bold uppercase tracking-[.12em] px-3 pt-3 pb-1.5"
                style={{ color: dark ? SEC_D : SEC_L }}>
                {section}
              </p>
            )}
            {items.map(({ to, icon: Icon, label, badge, badgeColor }) => (
              <NavLink key={to} to={to} onClick={()=>setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] text-[14px] font-medium transition-all mb-[2px]"
                style={({ isActive }) => ({
                  background:  isActive ? (dark ? ACTIVE_BG_D : ACTIVE_BG_L) : "transparent",
                  color:       isActive ? (dark ? ACTIVE_TX_D : ACTIVE_TX_L) : (dark ? ITEM_TX_D : ITEM_TX_L),
                  fontWeight:  isActive ? 700 : 500,
                  borderLeft:  isActive ? `3px solid ${dark ? "#5eead4" : "#0f766e"}` : "3px solid transparent",
                  paddingLeft: isActive ? "9px" : "12px",
                  borderTopLeftRadius:    isActive ? 4  : 10,
                  borderBottomLeftRadius: isActive ? 4  : 10,
                })}
                onMouseEnter={e => {
                  if (e.currentTarget.getAttribute("aria-current") !== "page")
                    e.currentTarget.style.background = dark ? HOVER_BG_D : HOVER_BG_L;
                }}
                onMouseLeave={e => {
                  if (e.currentTarget.getAttribute("aria-current") !== "page")
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ flexShrink:0, opacity:0.85 }}><Icon size={16}/></span>
                <span className="truncate flex-1">{label}</span>
                {badge > 0 && (
                  <span className="text-[11px] font-bold px-[7px] py-[2px] rounded-full"
                    style={{ ...getBadgeStyle(badgeColor, dark), flexShrink:0 }}>
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer — gradient teal façon WelcomeBanner ── */}
      <div className="shrink-0 px-3 py-4 relative overflow-hidden"
        style={{
          borderTop: `1px solid ${border}`,
          background: dark
            ? "linear-gradient(135deg, #0a2e2b 0%, #0f3d38 55%, #0d4a44 100%)"
            : "linear-gradient(135deg, #0a5c55 0%, #0f766e 55%, #0d9488 100%)",
        }}>

        {/* Motif de points façon WelcomeBanner */}
        <div style={{ position:"absolute", inset:0, opacity:.06,
          backgroundImage:"radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
          backgroundSize:"14px 14px", pointerEvents:"none" }} />

        <div className="relative flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
            style={{ background:"rgba(255,255,255,0.18)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.30)" }}>
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold truncate leading-tight" style={{ color:"#ffffff" }}>
              Administrateur
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0"/>
              <span className="text-[11px]" style={{ color:"#5eead4" }}>En ligne</span>
            </div>
          </div>
          <button onClick={()=>setShowLogout(true)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color:"rgba(255,255,255,0.65)" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#fff";e.currentTarget.style.background="rgba(255,255,255,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.65)";e.currentTarget.style.background="transparent";}}
            title="Se déconnecter">
            <LogOut size={15}/>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Modal déconnexion — header gradient teal façon WelcomeBanner ── */}
      {showLogout && (
        <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)" }}
          onClick={()=>setShowLogout(false)}>
          <div style={{ background:"#fff",borderRadius:16,width:320,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",textAlign:"center",overflow:"hidden" }}
            onClick={e=>e.stopPropagation()}>

            {/* Header gradient teal avec motif de points */}
            <div style={{
              background: "linear-gradient(135deg, #0a5c55 0%, #0f766e 55%, #0d9488 100%)",
              backgroundImage: `
                radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px),
                linear-gradient(135deg, #0a5c55 0%, #0f766e 55%, #0d9488 100%)
              `,
              backgroundSize: "16px 16px, 100% 100%",
              padding: "28px 28px 24px",
              position: "relative",
            }}>
              <div style={{ width:52,height:52,borderRadius:"50%",background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>
                <LogOut size={22} style={{ color:"#ffffff" }}/>
              </div>
              <p style={{ fontSize:17,fontWeight:700,color:"#ffffff" }}>Déconnexion</p>
            </div>

            {/* Corps */}
            <div style={{ padding:"24px 28px" }}>
              <p style={{ fontSize:13,color:"#6b7280",lineHeight:1.5,marginBottom:24 }}>
                Êtes-vous sûr de vouloir vous déconnecter de la plateforme ?
              </p>
              <div style={{ display:"flex",gap:10 }}>
                <button onClick={()=>setShowLogout(false)}
                  style={{ flex:1,height:40,borderRadius:10,border:"1.5px solid #e5e7eb",background:"#fff",color:"#374151",fontSize:13,fontWeight:600,cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                  Annuler
                </button>
                <button onClick={confirmLogout}
                  style={{ flex:1,height:40,borderRadius:10,border:"none",background:"#0f766e",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#0a5c55"}
                  onMouseLeave={e=>e.currentTarget.style.background="#0f766e"}>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:flex">{inner}</div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setOpen(false)}/>
          <div className="relative z-50" style={{ width:260 }}>{inner}</div>
        </div>
      )}

      <button id="sidebar-toggle" onClick={()=>setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 w-9 h-9 flex items-center justify-center rounded-xl shadow-sm"
        style={{ background:bg, border:`1px solid ${border}`, color:dark?ITEM_TX_D:ITEM_TX_L }}>
        <Menu size={16}/>
      </button>
    </>
  );
}