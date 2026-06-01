import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Save, Eye, EyeOff, AlertTriangle } from "lucide-react";

const BRAND="#0f766e";
const MOCK={email:"admin@pneumoia.cm",nom:"Super Admin",telephone:"+237 699 000 001",sms:"+237 699 000 001",notif_email:true,notif_sms:true,notif_demandes:true,notif_connexions:true,notif_ia:false};

function Section({title,sub,children,dark}){
  return(
    <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
      <div className={`px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
        <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
        {sub&&<p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{sub}</p>}
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({label,sub,id,type="text",value,onChange,placeholder,dark}){
  return(
    <div>
      <label htmlFor={id} className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>{label}</label>
      {sub&&<p className={`text-[10px] mb-1.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{sub}</p>}
      <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full text-[12px] px-3 py-2 rounded-xl border outline-none transition-all focus:ring-2 ${dark?"bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58] focus:border-[#0f766e] focus:ring-[#0f766e]/10":"bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-300 focus:border-[#0f766e] focus:ring-[#0f766e]/10"}`}/>
    </div>
  );
}

function Toggle({label,sub,checked,onChange,dark}){
  return(
    <div className="flex items-center justify-between gap-4">
      <div><p className={`text-[12px] font-semibold ${dark?"text-white":"text-gray-700"}`}>{label}</p>{sub&&<p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{sub}</p>}</div>
      <button type="button" onClick={()=>onChange(!checked)} className="relative w-10 h-5 rounded-full transition-colors shrink-0" style={{background:checked?BRAND:"#d1d5db"}}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked?"translate-x-5":"translate-x-0"}`}/>
      </button>
    </div>
  );
}

export default function Parametres(){
  const {dark}=useOutletContext()||{};
  const [form,setForm]=useState(MOCK);
  const [pwd,setPwd]=useState({current:"",next:"",confirm:""});
  const [show,setShow]=useState({current:false,next:false,confirm:false});
  const [toast,setToast]=useState(null);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),3000);return()=>clearTimeout(t);},[toast]);
  function set(k,v){setForm(f=>({...f,[k]:v}));}

  async function saveInfos(e){e.preventDefault();setSaving(true);await new Promise(r=>setTimeout(r,700));setSaving(false);setToast({msg:"Informations mises à jour",type:"success"});}
  async function savePwd(e){
    e.preventDefault();
    if(!pwd.current)return setToast({msg:"Entrez votre mot de passe actuel",type:"error"});
    if(!pwd.next)return setToast({msg:"Entrez un nouveau mot de passe",type:"error"});
    if(pwd.next!==pwd.confirm)return setToast({msg:"Les mots de passe ne correspondent pas",type:"error"});
    if(pwd.next.length<8)return setToast({msg:"Minimum 8 caractères",type:"error"});
    setSaving(true);await new Promise(r=>setTimeout(r,700));setSaving(false);
    setPwd({current:"",next:"",confirm:""});
    setToast({msg:"Mot de passe modifié",type:"success"});
  }

  const inp=`w-full text-[12px] px-3 py-2 rounded-xl border outline-none transition-all focus:ring-2 ${dark?"bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58] focus:border-[#0f766e] focus:ring-[#0f766e]/10":"bg-gray-50 border-gray-200 text-gray-800 focus:border-[#0f766e] focus:ring-[#0f766e]/10"}`;

  function BtnSave({label}){
    return(
      <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-bold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed" style={{background:BRAND}}>
        {saving&&<svg className="animate-spin w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>}
        <Save size={12}/>{label}
      </button>
    );
  }

  return(
    <div className="flex flex-col gap-5 max-w-[900px] mx-auto">
      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>Paramètres</h1>
        <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Configuration du compte administrateur</p>
      </div>

      <Section dark={dark} title="Informations du compte" sub="Coordonnées de l'administrateur">
        <form onSubmit={saveInfos} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field dark={dark} label="Nom complet" id="nom" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Super Admin"/>
            <Field dark={dark} label="Adresse email" id="email" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="admin@pneumoia.cm"/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field dark={dark} label="Téléphone" id="tel" value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="+237 6XX XXX XXX"/>
            <Field dark={dark} label="Numéro SMS notifications" id="sms" value={form.sms} onChange={e=>set("sms",e.target.value)} placeholder="+237 6XX XXX XXX" sub="Ce numéro reçoit les alertes SMS"/>
          </div>
          <div className="flex justify-end"><BtnSave label="Enregistrer"/></div>
        </form>
      </Section>

      <Section dark={dark} title="Sécurité — Mot de passe" sub="Modifiez votre mot de passe de connexion">
        <form onSubmit={savePwd} className="flex flex-col gap-3">
          {[["Mot de passe actuel","current","Votre mot de passe actuel"],["Nouveau mot de passe","next","Minimum 8 caractères"],["Confirmer","confirm","Répétez le mot de passe"]].map(([label,field,ph])=>(
            <div key={field}>
              <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>{label}</label>
              <div className="relative">
                <input type={show[field]?"text":"password"} value={pwd[field]} onChange={e=>setPwd(p=>({...p,[field]:e.target.value}))} placeholder={ph} className={`${inp} pr-9`}/>
                <button type="button" onClick={()=>setShow(s=>({...s,[field]:!s[field]}))} className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark?"text-[#484f58]":"text-gray-400"}`}>
                  {show[field]?<EyeOff size={13}/>:<Eye size={13}/>}
                </button>
              </div>
            </div>
          ))}
          {pwd.next&&pwd.confirm&&<p className={`text-[10.5px] ${pwd.next===pwd.confirm?"text-teal-600 dark:text-teal-400":"text-red-500"}`}>{pwd.next===pwd.confirm?"✓ Les mots de passe correspondent":"✗ Ne correspondent pas"}</p>}
          <div className="flex justify-end"><BtnSave label="Changer le mot de passe"/></div>
        </form>
      </Section>

      <Section dark={dark} title="Notifications" sub="Configurez les alertes à recevoir">
        <div className={`pb-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${dark?"text-[#484f58]":"text-gray-300"}`}>Canaux</p>
          <div className="flex flex-col gap-3">
            <Toggle dark={dark} label="Notifications par email" sub={`Alertes sur ${form.email}`} checked={form.notif_email} onChange={v=>set("notif_email",v)}/>
            <Toggle dark={dark} label="Notifications par SMS" sub={`Alertes sur ${form.sms}`} checked={form.notif_sms} onChange={v=>set("notif_sms",v)}/>
          </div>
        </div>
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${dark?"text-[#484f58]":"text-gray-300"}`}>Événements</p>
          <div className="flex flex-col gap-3">
            <Toggle dark={dark} label="Nouvelles demandes d'inscription" sub="Alerte dès qu'un médecin soumet un dossier" checked={form.notif_demandes} onChange={v=>set("notif_demandes",v)}/>
            <Toggle dark={dark} label="Connexions suspectes" sub="Tentatives de connexion répétées depuis IPs inconnues" checked={form.notif_connexions} onChange={v=>set("notif_connexions",v)}/>
            <Toggle dark={dark} label="Mises à jour du modèle IA" sub="Notifications lors des nouvelles versions" checked={form.notif_ia} onChange={v=>set("notif_ia",v)}/>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={()=>{setSaving(true);setTimeout(()=>{setSaving(false);setToast({msg:"Préférences sauvegardées",type:"success"});},700);}} className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-bold text-white" style={{background:BRAND}}><Save size={12}/>Sauvegarder</button>
        </div>
      </Section>

      <Section dark={dark} title="Zone dangereuse" sub="Actions irréversibles sur le compte">
        <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/10`}>
          <div>
            <p className="text-[12px] font-bold text-red-700 dark:text-red-400">Réinitialiser tous les paramètres</p>
            <p className="text-[10px] text-red-500 mt-0.5">Remet la configuration aux valeurs par défaut.</p>
          </div>
          <button onClick={()=>setToast({msg:"Disponible en production",type:"error"})} className="shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold border border-red-300 dark:border-red-700/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5"><AlertTriangle size={11}/>Réinitialiser</button>
        </div>
      </Section>

      {toast&&<div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-emerald-600":"bg-red-600"}`}>{toast.msg}</div>}
    </div>
  );
}