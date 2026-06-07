import { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { TablePagination } from '../../../components/ui/TablePagination';

const BRAND="#0f766e";
const NOW=new Date();
const sub=(ms)=>new Date(NOW.getTime()-ms);
const pad=(n)=>String(n).padStart(2,"0");
function fmtDT(d){return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;}

const MOCK=[
  {id:1,initials:"DM",nom:"Dr. Mbang",specialite:"Pneumologue",hopital:"Clinique Sud, Douala",cnom:"CM-2020-0345",raison:"Signalement d'un confrère — comportement non conforme",duree:"30 jours",dureeType:"limitee",suspenduLe:sub(24*3600000),suspenduPar:"Super Admin"},
];

function Modal({onClose,title,children,footer}){
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#21262d]">
          <p className="text-[13px] font-bold text-gray-800 dark:text-white">{title}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-[#484f58] hover:bg-gray-100 dark:hover:bg-[#21262d]"><X size={13}/></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer&&<div className="flex gap-2 px-5 py-4 border-t border-gray-100 dark:border-[#21262d]">{footer}</div>}
      </div>
    </div>
  );
}

export default function MedecinsSuspendus(){
  const {dark}=useOutletContext()||{};
  const [suspendus,setSuspendus]=useState(MOCK);
  const [modaleSuppr,setModaleSuppr]=useState(null);
  const [toast,setToast]=useState(null);
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const from=( page-1)*pageSize;
  const paginated=suspendus.slice(from,from+pageSize);

  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),3000);return()=>clearTimeout(t);},[toast]);

  function reactiver(id){setSuspendus(p=>p.filter(m=>m.id!==id));setToast({msg:"Compte réactivé",type:"success"});}
  function supprimer(){setSuspendus(p=>p.filter(m=>m.id!==modaleSuppr.id));setToast({msg:`Compte de ${modaleSuppr.nom} supprimé`,type:"error"});setModaleSuppr(null);}

  const th=`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td=`px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;

  return(
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>Comptes suspendus</h1>
        <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>{suspendus.length} compte{suspendus.length>1?"s":""} suspendu{suspendus.length>1?"s":""}</p>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:700}}>
            <thead><tr>
              {["Médecin","CNOM","Raison","Durée","Suspendu le","Suspendu par","Actions"].map(h=><th key={h} className={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {suspendus.length===0
                ? <tr><td colSpan={7} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>Aucun compte suspendu</td></tr>
                : paginated.map(m=>(
                  <tr key={m.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${dark?"bg-[#21262d] text-[#8b949e]":"bg-gray-100 text-gray-600"}`}>{m.initials}</div>
                        <div><p className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p><p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · {m.hopital}</p></div>
                      </div>
                    </td>
                    <td className={`${td} text-[11px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.cnom}</td>
                    <td className={`${td} text-[11px] font-medium text-orange-500 dark:text-orange-400 max-w-xs`}>{m.raison}</td>
                    <td className={td}><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${m.dureeType==="indefinie"?"bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400":"bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"}`}>{m.duree}</span></td>
                    <td className={`${td} text-[11px] ${dark?"text-[#484f58]":"text-gray-400"} whitespace-nowrap`}>{fmtDT(m.suspenduLe)}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{m.suspenduPar}</td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <button onClick={()=>reactiver(m.id)} className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-teal-200 dark:border-teal-700/40 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">Réactiver</button>
                        <button onClick={()=>setModaleSuppr(m)} className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <TablePagination
          total={suspendus.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={s=>{setPageSize(s);setPage(1);}}
          dark={dark}
        />
      </div>

      {modaleSuppr&&<Modal onClose={()=>setModaleSuppr(null)} title="Supprimer le compte"
        footer={<><button onClick={()=>setModaleSuppr(null)} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button><button onClick={supprimer} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold transition-colors">Supprimer définitivement</button></>}>
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px]">
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>Supprimer définitivement le compte de <strong className="mx-1">{modaleSuppr.nom}</strong> ? Action irréversible.
        </div>
      </Modal>}

      {toast&&<div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-emerald-600":"bg-red-600"}`}>{toast.msg}</div>}
    </div>
  );
}