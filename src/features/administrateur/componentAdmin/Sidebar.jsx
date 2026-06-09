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

const BRAND    = "#0f766e";
const BG_LIGHT = "#f0faf8";
const BG_DARK  = "#0a1a18";

const ACTIVE_BG_L = "rgba(255,255,255,0.70)";
const ACTIVE_TX_L = "#0c5f58";
const ACTIVE_BG_D = "rgba(15,118,110,0.20)";
const ACTIVE_TX_D = "#5eead4";

const ITEM_TX_L  = "#1a4a46";
const ITEM_TX_D  = "rgba(255,255,255,0.70)";
const HOVER_BG_L = "rgba(255,255,255,0.45)";
const HOVER_BG_D = "rgba(255,255,255,0.05)";

const SEC_L    = "rgba(15,80,75,0.55)";
const SEC_D    = "rgba(255,255,255,0.30)";
const BORDER_L = "rgba(15,118,110,0.15)";
const BORDER_D = "rgba(255,255,255,0.07)";

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
      teal:   { background: "rgba(255,255,255,0.60)", color: "#0c5f58", border: "1px solid rgba(15,118,110,0.25)"  },
      red:    { background: "rgba(255,255,255,0.60)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.25)"   },
      orange: { background: "rgba(255,255,255,0.60)", color: "#ea580c", border: "1px solid rgba(234,88,12,0.25)"   },
    },
    dark: {
      teal:   { background: "rgba(20,184,166,.15)",  color: "#5eead4", border: "1px solid rgba(20,184,166,.2)"    },
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
    // Mock — remplacer par getCounts().then(setCounts)
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
      style={{ width:224, minWidth:224, maxWidth:224, background:bg, borderRight:`1px solid ${border}` }}
    >
      {/* Logo */}
      <div className="h-[88px] flex items-center justify-center px-4 shrink-0 relative"
        style={{ borderBottom:`1px solid ${border}` }}>
        <img src={logo} alt="PneumoIA"
          style={{ height:68, width:"auto", objectFit:"contain", maxWidth:200, filter:dark?"brightness(1.1)":"none" }}/>
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
              <p className="text-[10px] font-bold uppercase tracking-[.12em] px-3 pt-3 pb-1.5"
                style={{ color: dark ? SEC_D : SEC_L }}>
                {section}
              </p>
            )}
            {items.map(({ to, icon: Icon, label, badge, badgeColor }) => (
              <NavLink key={to} to={to} onClick={()=>setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-[8px] rounded-[10px] text-[13px] font-medium transition-all mb-[2px]"
                style={({ isActive }) => ({
                  background: isActive ? (dark ? ACTIVE_BG_D : ACTIVE_BG_L) : "transparent",
                  color:      isActive ? (dark ? ACTIVE_TX_D : ACTIVE_TX_L) : (dark ? ITEM_TX_D : ITEM_TX_L),
                  fontWeight: isActive ? 600 : 500,
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
                <span style={{ flexShrink:0, opacity:0.85 }}><Icon size={15}/></span>
                <span className="truncate flex-1">{label}</span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold px-[7px] py-[2px] rounded-full"
                    style={{ ...getBadgeStyle(badgeColor, dark), flexShrink:0 }}>
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-3 py-4"
        style={{ borderTop:`1px solid ${border}`, background: dark?"rgba(0,0,0,0.15)":"rgba(13,121,114,0.12)" }}>
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: dark ? "rgba(15,118,110,0.6)" : BRAND }}>
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold truncate leading-tight"
              style={{ color: dark ? "#e2faf8" : "#0a3d39" }}>
              Administrateur
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
              <span className="text-[10px]" style={{ color: dark ? "#6ee7b7" : "#059669" }}>En ligne</span>
            </div>
          </div>
          <button onClick={()=>setShowLogout(true)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: dark ? "rgba(255,255,255,0.35)" : "rgba(13,80,75,0.45)" }}
            onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
            onMouseLeave={e=>e.currentTarget.style.color=dark?"rgba(255,255,255,0.35)":"rgba(13,80,75,0.45)"}
            title="Se déconnecter">
            <LogOut size={15}/>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Modal déconnexion */}
      {showLogout && (
        <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)" }}
          onClick={()=>setShowLogout(false)}>
          <div style={{ background:"#fff",borderRadius:16,padding:"28px 28px 24px",width:320,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",textAlign:"center" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ width:52,height:52,borderRadius:"50%",background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <LogOut size={22} style={{ color:"#ef4444" }}/>
            </div>
            <p style={{ fontSize:17,fontWeight:700,color:"#111827",marginBottom:8 }}>Déconnexion</p>
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
                style={{ flex:1,height:40,borderRadius:10,border:"none",background:"#ef4444",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background="#dc2626"}
                onMouseLeave={e=>e.currentTarget.style.background="#ef4444"}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:flex">{inner}</div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setOpen(false)}/>
          <div className="relative z-50" style={{ width:224 }}>{inner}</div>
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