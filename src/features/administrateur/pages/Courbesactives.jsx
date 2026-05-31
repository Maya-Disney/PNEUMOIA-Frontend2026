import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const BRAND="#0f766e";
const NOW=new Date();
const pad=(n)=>String(n).padStart(2,"0");
const MOIS=["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
function genData(){return Array.from({length:30},(_,i)=>{const d=new Date(NOW.getTime()-(29-i)*24*3600000);const we=d.getDay()===0||d.getDay()===6;const v=Math.max(100,Math.round((we?320:580)+(Math.random()-.5)*200));return{date:`${pad(d.getDate())} ${MOIS[d.getMonth()]}`,val:v,isToday:i===29};});}
const DATA=genData();
const total=DATA.reduce((s,d)=>s+d.val,0);
const moy=Math.round(total/DATA.length);
const pic=DATA.reduce((m,d)=>d.val>m.val?d:m,DATA[0]);
const variation=Math.round(((DATA.slice(15).reduce((s,d)=>s+d.val,0)/15)-(DATA.slice(0,15).reduce((s,d)=>s+d.val,0)/15))/(DATA.slice(0,15).reduce((s,d)=>s+d.val,0)/15)*100);

function Tip({active,payload,label,dark}){if(!active||!payload?.length)return null;return(<div className={`px-3 py-2 rounded-lg border text-xs shadow-lg ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-800"}`}><p className="font-bold mb-1">{label}</p><p style={{color:BRAND}}>{payload[0].value.toLocaleString("fr-FR")} consultations</p></div>);}

export default function CourbeActivite(){
  const {dark}=useOutletContext()||{};
  const [zoom,setZoom]=useState("30j");
  const displayed=zoom==="7j"?DATA.slice(-7):zoom==="14j"?DATA.slice(-14):DATA;
  const ax=dark?"#484f58":"#9ca3af";const gr=dark?"#21262d":"#f3f4f6";

  return(
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>Courbe d'activité</h1>
        <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Consultations par jour — 30 derniers jours</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{l:"Total 30j",v:total.toLocaleString("fr-FR"),c:dark?"text-white":"text-gray-900"},{l:"Moy./jour",v:moy.toLocaleString("fr-FR"),c:dark?"text-white":"text-gray-900"},{l:`Pic — ${pic.date}`,v:pic.val.toLocaleString("fr-FR"),c:"text-teal-600 dark:text-teal-400"},{l:"Variation 15j",v:`${variation>0?"+":""}${variation}%`,c:variation>=0?"text-teal-600 dark:text-teal-400":"text-red-500"}].map(({l,v,c})=>(
          <div key={l} className={`rounded-2xl border px-4 py-3 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
            <p className={`text-xl font-black ${c}`}>{v}</p>
            <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="flex items-center justify-between mb-5">
          <div><p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>Consultations par jour</p><p className={`text-[11px] mt-0.5 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Ligne pointillée = moyenne ({moy}/jour)</p></div>
          <div className="flex gap-1">
            {["7j","14j","30j"].map(z=><button key={z} onClick={()=>setZoom(z)} className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors" style={zoom===z?{background:BRAND,borderColor:BRAND,color:"#fff"}:{borderColor:dark?"#21262d":"#e5e7eb",color:dark?"#484f58":"#9ca3af"}}>{z}</button>)}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={displayed} margin={{top:4,right:4,bottom:0,left:0}}>
            <CartesianGrid vertical={false} stroke={gr}/>
            <XAxis dataKey="date" tick={{fontSize:9,fill:ax}} axisLine={false} tickLine={false} interval={zoom==="30j"?4:zoom==="14j"?1:0}/>
            <YAxis tick={{fontSize:9,fill:ax}} axisLine={false} tickLine={false} width={36}/>
            <Tooltip content={<Tip dark={dark}/>} cursor={{stroke:gr,strokeWidth:1}}/>
            <ReferenceLine y={moy} stroke={dark?"#484f58":"#d1d5db"} strokeDasharray="4 3"/>
            <Line type="monotone" dataKey="val" stroke={BRAND} strokeWidth={2.5}
              dot={props=>props.payload.isToday?<circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill={BRAND} stroke="#fff" strokeWidth={2}/>:<circle key={props.key} cx={props.cx} cy={props.cy} r={0}/>}
              activeDot={{r:5,fill:BRAND,stroke:"#fff",strokeWidth:2}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}