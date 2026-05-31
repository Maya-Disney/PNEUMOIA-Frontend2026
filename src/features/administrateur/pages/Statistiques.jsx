import { useOutletContext } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Activity, Brain, TrendingUp } from "lucide-react";

const BRAND="#0f766e";
const WEEK=[{j:"Lun",v:420},{j:"Mar",v:510},{j:"Mer",v:480},{j:"Jeu",v:590},{j:"Ven",v:735},{j:"Sam",v:620},{j:"Dim",v:680}];
const MONTHS=[{m:"Jan",v:2},{m:"Fév",v:4},{m:"Mar",v:3},{m:"Avr",v:6},{m:"Mai",v:8},{m:"Juin",v:5}];
const VILLES=[{v:"Douala",c:2240,md:18},{v:"Yaoundé",c:1540,md:12},{v:"Bafoussam",c:580,md:4},{v:"Garoua",c:320,md:3},{v:"Bertoua",c:141,md:1}];
const TOP=[{ini:"DK",nom:"Dr. Kamto Diane",c:3201,ia:92,bg:"bg-blue-100 text-blue-700"},{ini:"JD",nom:"Dr. Jean Dupont",c:4821,ia:88,bg:"bg-teal-100 text-teal-700"},{ini:"AS",nom:"Dr. Aminata Sow",c:1243,ia:82,bg:"bg-purple-100 text-purple-700"},{ini:"DM",nom:"Dr. Mbang",c:987,ia:74,bg:"bg-amber-100 text-amber-700"}];
const maxV=Math.max(...VILLES.map(v=>v.c));

function Tip({active,payload,label,dark}){if(!active||!payload?.length)return null;return(<div className={`px-3 py-2 rounded-lg border text-xs shadow-lg ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-800"}`}><p className="font-bold mb-1">{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color||BRAND}}>{p.value}</p>)}</div>);}

export default function Statistiques(){
  const {dark}=useOutletContext()||{};
  const ax=dark?"#484f58":"#9ca3af";const gr=dark?"#21262d":"#f3f4f6";

  return(
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>Statistiques</h1>
        <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Vue globale de l'activité PneumoIA CEMAC</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{icon:Users,l:"Médecins actifs",v:"38",s:"+3 ce mois",ibg:"bg-teal-50 dark:bg-teal-900/20",ic:"text-teal-600"},{icon:Activity,l:"Consultations",v:"4 821",s:"+247 ce mois",ibg:"bg-blue-50 dark:bg-blue-900/20",ic:"text-blue-500"},{icon:Brain,l:"Précision IA",v:"94%",s:"+1.2% ce mois",ibg:"bg-purple-50 dark:bg-purple-900/20",ic:"text-purple-500"},{icon:TrendingUp,l:"Concordance moy.",v:"84%",s:"Médecins actifs",ibg:"bg-amber-50 dark:bg-amber-900/20",ic:"text-amber-500"}].map(({icon:Icon,l,v,s,ibg,ic})=>(
          <div key={l} className={`rounded-2xl border px-4 py-3 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${ibg}`}><Icon size={16} className={ic}/></div>
            <p className={`text-2xl font-black ${dark?"text-white":"text-gray-900"}`}>{v}</p>
            <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</p>
            <p className="text-[10px] mt-1 font-semibold" style={{color:BRAND}}>{s}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-1 ${dark?"text-white":"text-gray-800"}`}>Consultations semaine</p>
          <p className={`text-[11px] mb-4 ${dark?"text-[#8b949e]":"text-gray-400"}`}>7 derniers jours</p>
          <ResponsiveContainer width="100%" height={180}><BarChart data={WEEK} barSize={28}><CartesianGrid vertical={false} stroke={gr}/><XAxis dataKey="j" tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false} width={30}/><Tooltip content={<Tip dark={dark}/>} cursor={{fill:dark?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)"}}/><Bar dataKey="v" name="Consultations" fill={BRAND} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
        </div>
        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-1 ${dark?"text-white":"text-gray-800"}`}>Inscriptions validées</p>
          <p className={`text-[11px] mb-4 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Par mois · 2026</p>
          <ResponsiveContainer width="100%" height={180}><LineChart data={MONTHS}><CartesianGrid vertical={false} stroke={gr}/><XAxis dataKey="m" tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false} width={24}/><Tooltip content={<Tip dark={dark}/>}/><Line type="monotone" dataKey="v" stroke={BRAND} strokeWidth={2.5} dot={{fill:BRAND,r:3}} activeDot={{r:5}}/></LineChart></ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-4 ${dark?"text-white":"text-gray-800"}`}>Répartition géographique</p>
          {VILLES.map(v=>(
            <div key={v.v} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold ${dark?"text-[#8b949e]":"text-gray-600"}`}>{v.v}</span>
                <div className="flex items-center gap-3 text-[10px]"><span className={dark?"text-[#484f58]":"text-gray-400"}>{v.md} md</span><span className={`font-bold ${dark?"text-white":"text-gray-700"}`}>{v.c.toLocaleString("fr-FR")}</span></div>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${dark?"bg-[#21262d]":"bg-gray-100"}`}><div className="h-full rounded-full" style={{width:`${Math.round((v.c/maxV)*100)}%`,background:BRAND}}/></div>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-4 ${dark?"text-white":"text-gray-800"}`}>Top médecins — Concordance IA</p>
          {[...TOP].sort((a,b)=>b.ia-a.ia).map((m,i)=>(
            <div key={m.nom} className={`flex items-center gap-3 p-3 rounded-xl mb-2 last:mb-0 ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
              <span className={`text-[10px] font-black w-4 ${dark?"text-[#484f58]":"text-gray-300"}`}>#{i+1}</span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${m.bg}`}>{m.ini}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold truncate ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                <div className={`mt-1 h-1.5 rounded-full overflow-hidden ${dark?"bg-[#21262d]":"bg-gray-200"}`}><div className="h-full rounded-full" style={{width:`${m.ia}%`,background:m.ia>=85?BRAND:m.ia>=75?"#f59e0b":"#ef4444"}}/></div>
              </div>
              <span className="text-[12px] font-black shrink-0" style={{color:m.ia>=85?BRAND:m.ia>=75?"#f59e0b":"#ef4444"}}>{m.ia}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}