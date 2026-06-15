import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import CardHeader from "./CardHeader";
import { brand, getSurface, getText } from "../theme";
import { getDemandes } from "../api/adminApi";
import { mapMedecin, elapsedStr } from "../api/demandesData";

export default function DashDemandes({ dark }) {
  const navigate = useNavigate();
  const surface  = getSurface(dark);
  const txt      = getText(dark);
  const [items, setItems] = useState([]);

  useEffect(() => {
    getDemandes()
      .then(data => setItems(Array.isArray(data) ? data.map(mapMedecin) : []))
      .catch(() => setItems([]));
  }, []);

  const pending = items.filter(d => d.status === "en_attente");
  const preview = pending.slice(0, 3);

  return (
    <Card dark={dark} className="p-4">
      <CardHeader
        dark={dark}
        title="Demandes en attente"
        sub={`${pending.length} en attente · validation manuelle`}
        action="Tout voir"
        onAction={() => navigate("/administrateur/demandes")}
      />
      <div className="flex flex-col gap-2">
        {preview.length === 0 ? (
          <p className="text-center text-[13px] py-3" style={{ color: txt.subtle }}>
            Aucune demande en attente
          </p>
        ) : preview.map(d => (
          <div key={d.id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: surface.bg }}>
            {d.photo_url
              ? <img src={d.photo_url} alt={d.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                  onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
              : null}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 text-white"
              style={{ background: d.avatarBg, display: d.photo_url ? "none" : "flex" }}>
              {d.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold truncate" style={{ color: txt.primary }}>{d.name}</p>
              <p className="text-[13px]" style={{ color: txt.subtle }}>{d.specialite} · {d.ville}</p>
            </div>
            <span className="text-[13px] shrink-0" style={{ color: txt.subtle }}>
              {elapsedStr(d.submittedAt)}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/administrateur/demandes")}
        className="mt-2 w-full py-2 rounded-xl text-[13px] font-bold border transition-colors"
        style={{ borderColor: brand.DEFAULT, color: brand.DEFAULT }}
        onMouseEnter={e => { e.currentTarget.style.background = brand.DEFAULT; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = brand.DEFAULT; }}>
        Gérer les demandes →
      </button>
    </Card>
  );
}
