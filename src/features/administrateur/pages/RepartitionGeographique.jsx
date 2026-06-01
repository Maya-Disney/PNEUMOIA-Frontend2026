import { useOutletContext } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const BRAND="#0f766e";
const VILLES=[{v:"Douala",r:"Littoral",md:18,c:2240,p:524},{v:"Yaoundé",r:"Centre",md:12,c:1540,p:367},{v:"Bafoussam",r:"Ouest",md:4,c:580,p:142},{v:"Garoua",r:"Nord",md:3,c:320,p:89},{v:"Bertoua",r:"Est",md:1,c:141,p:41}];
const REGIONS=[{r:"Littoral",md:18,cov:94},{r:"Centre",md:12,cov:88},{r:"Ouest",md:4,cov:52},{r:"Nord",md:3,cov:31},{r:"Est",md:1,cov:18},{r:"Sud",md:0,cov:0},{r:"Adamaoua",md:0,cov:0},{r:"Extrême-N",md:0,cov:0},{r:"N-Ouest",md:0,cov:0},{r:"S-Ouest",md:0,cov:0}];
const totC=VILLES.reduce((s,v)=>s+v.c,0);const totMd=VILLES.reduce((s,v)=>s+v.md,0);const maxC=Math.max(...VILLES.map(v=>v.c));
function covColor(c){return c>=70?BRAND:c>=40?"#f59e0b":"#ef4444";}
function Tip({active,payload,label,dark}){if(!active||!payload?.length)return null;return(<div className={`px-3 py-2 rounded-lg border text-xs shadow-lg ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-800"}`}><p className="font-bold">{label}</p>{payload.map((p,i)=><p key={i} style={{color:BRAND}}>{p.value.toLocaleString("fr-FR")} consultations</p>)}</div>);}

export default function RepartitionGeo(){
  const {dark}=useOutletContext()||{};
  const ax=dark?"#484f58":"#9ca3af";const gr=dark?"#21262d":"#f3f4f6";
  return(
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>Répartition géographique</h1>
        <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Distribution des médecins au Cameroun</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Médecins",v:totMd,c:dark?"text-white":"text-gray-900"},{l:"Consultations",v:totC.toLocaleString("fr-FR"),c:dark?"text-white":"text-gray-900"},{l:"Patients",v:VILLES.reduce((s,v)=>s+v.p,0).toLocaleString("fr-FR"),c:dark?"text-white":"text-gray-900"},{l:"Régions couvertes",v:`${REGIONS.filter(r=>r.md>0).length}/10`,c:"text-orange-500"}].map(({l,v,c})=>(
          <div key={l} className={`rounded-2xl border px-4 py-3 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
            <p className={`text-2xl font-black ${c}`}>{v}</p>
            <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-1 ${dark?"text-white":"text-gray-800"}`}>Consultations par ville</p>
          <p className={`text-[11px] mb-4 ${dark?"text-[#8b949e]":"text-gray-400"}`}>5 villes actives</p>
          <ResponsiveContainer width="100%" height={200}><BarChart data={VILLES} barSize={32}><CartesianGrid vertical={false} stroke={gr}/><XAxis dataKey="v" tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:ax}} axisLine={false} tickLine={false} width={36}/><Tooltip content={<Tip dark={dark}/>} cursor={{fill:dark?"rgba(255,255,255,.02)":"rgba(0,0,0,.02)"}}/><Bar dataKey="c" name="Consultations" fill={BRAND} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
        </div>

        <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
          <p className={`text-[13px] font-bold mb-4 ${dark?"text-white":"text-gray-800"}`}>Couverture par région</p>
          {REGIONS.map(r=>(
            <div key={r.r} className="flex items-center gap-2 mb-2 last:mb-0">
              <span className={`text-[10px] font-semibold w-20 shrink-0 ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.r}</span>
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark?"bg-[#21262d]":"bg-gray-100"}`}><div className="h-full rounded-full" style={{width:`${r.cov}%`,background:r.cov===0?"transparent":covColor(r.cov)}}/></div>
              {r.md>0?<span className={`text-[9px] w-14 text-right ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.md} md</span>:<span className="text-[9px] w-14 text-right text-red-400">Non couvert</span>}
            </div>
          ))}
          <p className="text-[10px] font-semibold text-orange-500 mt-4">⚠ 6 régions non couvertes</p>
        </div>
      </div>
    </div>
  );
}