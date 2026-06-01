import { useOutletContext } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const BRAND="#0f766e";
const EVOL=[{m:"Jan",v:79},{m:"Fév",v:81},{m:"Mar",v:83},{m:"Avr",v:85},{m:"Mai",v:88},{m:"Juin",v:94}];
const PAR_MALADIE=[{p:"Pneumonie",ok:42,ko:5,t:89},{p:"Asthme",ok:38,ko:6,t:86},{p:"BPCO",ok:29,ko:7,t:81},{p:"Tuberculose",ok:25,ko:4,t:86},{p:"Pleurésie",ok:18,ko:5,t:78},{p:"Bronchite",ok:31,ko:3,t:91}];
const PAR_MED=[{ini:"DK",nom:"Dr. Kamto Diane",t:92,total:198,bg:"bg-blue-100 text-blue-700"},{ini:"JD",nom:"Dr. Jean Dupont",t:88,total:134,bg:"bg-teal-100 text-teal-700"},{ini:"AS",nom:"Dr. Aminata Sow",t:82,total:87,bg:"bg-purple-100 text-purple-700"},{ini:"DM",nom:"Dr. Mbang",t:74,total:62,bg:"bg-amber-100 text-amber-700"}];
const totC=PAR_MED.reduce((s,m)=>s+Math.round(m.total*m.t/100),0);
const totT=PAR_MED.reduce((s,m)=>s+m.total,0);
const tG=Math.round((totC/totT)*100);
function col(t){return t>=85?BRAND:t>=75?"#f59e0b":"#ef4444";}
function Tip({active,payload,label,dark}){if(!active||!payload?.length)return null;return(<div className={`px-3 py-2 rounded-lg border text-xs shadow-lg ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-800"}`}><p className="font-bold">{label}</p><p style={{color:BRAND}}>{payload[0].value}% concordance</p></div>);}

export default function PerformancesIA(){
  const {dark}=useOutletContext()||{};
  const ax=dark?"#484f58":"#9ca3af";const gr=dark?"#21262d":"#f3f4f6";
  return(
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>Performances IA</h1>
        <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Taux de concordance médecin / modèle IA</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Concordance globale",v:`${tG}%`,c:"text-teal-600 dark:text-teal-400"},{l:"Cas analysés",v:totT,c:dark?"text-white":"text-gray-900"},{l:"Accords médecin/IA",v:totC,c:"text-teal-600 dark:text-teal-400"},{l:"Meilleure concordance",v:`${Math.max(...PAR_MED.map(m=>m.t))}%`,c:"text-teal-600 dark:text-teal-400"}].map(({l,v,c})=>(
          <div key={l} className={`rounded-2xl border px-4 py-3 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
            <p className={`text-2xl font-black ${c}`}>{typeof v==="number"?v.toLocaleString("fr-FR"):v}</p>
            <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-1 ${dark?"text-white":"text-gray-800"}`}>Évolution concordance</p>
          <p className={`text-[11px] mb-4 ${dark?"text-[#8b949e]":"text-gray-400"}`}>6 derniers mois</p>
          <ResponsiveContainer width="100%" height={180}><LineChart data={EVOL}><CartesianGrid vertical={false} stroke={gr}/><XAxis dataKey="m" tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false}/><YAxis domain={[70,100]} tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false} width={28}/><Tooltip content={<Tip dark={dark}/>}/><Line type="monotone" dataKey="v" stroke={BRAND} strokeWidth={2.5} dot={{fill:BRAND,r:3}} activeDot={{r:5,fill:BRAND,stroke:"#fff",strokeWidth:2}}/></LineChart></ResponsiveContainer>
        </div>
        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-4 ${dark?"text-white":"text-gray-800"}`}>Concordance par pathologie</p>
          {[...PAR_MALADIE].sort((a,b)=>b.t-a.t).map(m=>(
            <div key={m.p} className="flex items-center gap-3 mb-2 last:mb-0">
              <span className={`text-[10px] w-20 shrink-0 ${dark?"text-[#8b949e]":"text-gray-500"}`}>{m.p}</span>
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark?"bg-[#21262d]":"bg-gray-100"}`}><div className="h-full rounded-full" style={{width:`${m.t}%`,background:col(m.t)}}/></div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full w-10 text-center`} style={{background:m.t>=85?"#f0fdfa":m.t>=75?"#fffbeb":"#fef2f2",color:col(m.t)}}>{m.t}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <p className={`text-[13px] font-bold mb-4 ${dark?"text-white":"text-gray-800"}`}>Concordance par médecin</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...PAR_MED].sort((a,b)=>b.t-a.t).map((m,i)=>(
            <div key={m.nom} className={`flex flex-col gap-3 px-4 py-3 rounded-xl ${dark?"bg-[#0d1117] border border-[#21262d]":"bg-gray-50"}`}>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black ${dark?"text-[#484f58]":"text-gray-300"}`}>#{i+1}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${m.bg}`}>{m.ini}</div>
                <p className={`text-[10px] font-bold truncate ${dark?"text-[#8b949e]":"text-gray-700"}`}>{m.nom.replace("Dr. ","")}</p>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${dark?"bg-[#21262d]":"bg-gray-200"}`}><div className="h-full rounded-full" style={{width:`${m.t}%`,background:col(m.t)}}/></div>
              <p className="text-xl font-black" style={{color:col(m.t)}}>{m.t}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}