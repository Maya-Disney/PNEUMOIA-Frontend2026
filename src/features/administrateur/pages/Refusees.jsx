import { useMemo, useState } from "react";
import useAdminTheme from "../hooks/useAdminTheme";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
const MOCK_REFUSEES = [
  {
    id: 1,
    initiales: "DT",
    nom: "Dr. Tabi Jonas",
    specialite: "Pneumologue",
    cnom: "CM-2024-9999",
    etablissement: "Clinique Alpha, Yaoundé",
    dateDemande: "14 mars",
    dateRefus: "14 mars",
    motif: "N° CNOM invalide",
    refusePar: "Administrateur",
  },
  {
    id: 2,
    initiales: "BM",
    nom: "Dr. Bella Martin",
    specialite: "Médecine générale",
    cnom: "CM-2023-0411",
    etablissement: "Cabinet privé, Douala",
    dateDemande: "10 mars",
    dateRefus: "11 mars",
    motif: "Spécialité non couverte",
    refusePar: "Administrateur",
  },
  {
    id: 3,
    initiales: "NK",
    nom: "Dr. Nguele Kali",
    specialite: "Pneumologue",
    cnom: "CM-2021-0887",
    etablissement: "CHU Garoua",
    dateDemande: "05 mars",
    dateRefus: "07 mars",
    motif: "Attestation expirée",
    refusePar: "Administrateur",
  },
];

function Avatar({ initiales, darkMode }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        darkMode ?"bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
      }`}
    >
      {initiales}
    </div>
  );
}

function MotifBadge({ motif, darkMode }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
        darkMode ?"bg-red-900/30 text-red-400" : "bg-red-50 text-red-500"
      }`}
    >
      {motif}
    </span>
  );
}

function exportRefuseesCSV(rows) {
  const headers = [
    "Medecin",
    "Specialite",
    "CNOM",
    "Etablissement",
    "Date demande",
    "Date refus",
    "Motif refus",
    "Refuse par",
  ];

  const lines = rows.map((r) => [
    r.nom,
    r.specialite,
    r.cnom,
    r.etablissement,
    r.dateDemande,
    r.dateRefus,
    r.motif,
    r.refusePar,
  ]);

  const csv = [headers, ...lines]
    .map((line) =>
      line.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "inscriptions-refusees.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Refusees() {
  const { darkMode, setDarkMode } = useAdminTheme();
  const [activeKey, setActiveKey] = useState("refusees");
  const [isMobileOpen, setMobileOpen] = useState(false);
  const rows = useMemo(() => MOCK_REFUSEES, []);

  const pageCls = darkMode ?"bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const cardCls = darkMode ?"bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const thCls = darkMode ?"bg-gray-800/80 text-gray-400" : "bg-gray-50 text-gray-500";
  const mutedCls = darkMode ?"text-gray-400" : "text-gray-500";
  const rowHover = darkMode ?"hover:bg-gray-800/60" : "hover:bg-gray-50";
  const divider = darkMode ?"divide-gray-800" : "divide-gray-100";

  return (
    <div className={`h-screen flex admin-theme ${pageCls}`}>
      <Sidebar
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        darkMode={darkMode}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar darkMode={darkMode} setDarkMode={setDarkMode} setMobileOpen={setMobileOpen} />

        <main className={`overflow-y-auto flex-1 p-4 md:p-6 ${pageCls}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Inscriptions refusées</h1>
              <p className={`text-sm mt-0.5 ${mutedCls}`}>
                {rows.length} dossiers refusés — motifs détaillés ci-dessous
              </p>
            </div>

            <button
              type="button"
              onClick={() => exportRefuseesCSV(rows)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                darkMode
                  ?"border-gray-700 text-gray-200 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[980px]">
                <thead>
                  <tr className={`text-xs border-b ${thCls} ${darkMode ?"border-gray-700" : "border-gray-200"}`}>
                    <th className="px-4 py-3 text-left font-semibold">Médecin</th>
                    <th className="px-4 py-3 text-left font-semibold">CNOM</th>
                    <th className="px-4 py-3 text-left font-semibold">Établissement</th>
                    <th className="px-4 py-3 text-left font-semibold">Date demande</th>
                    <th className="px-4 py-3 text-left font-semibold">Date refus</th>
                    <th className="px-4 py-3 text-left font-semibold">Motif du refus</th>
                    <th className="px-4 py-3 text-left font-semibold">Refusé par</th>
                  </tr>
                </thead>

                <tbody className={`divide-y ${divider}`}>
                  {rows.map((row) => (
                    <tr key={row.id} className={`transition-colors duration-100 ${rowHover}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar initiales={row.initiales} darkMode={darkMode} />
                          <div>
                            <p className="font-semibold text-sm">{row.nom}</p>
                            <p className={`text-xs ${mutedCls}`}>{row.specialite}</p>
                          </div>
                        </div>
                      </td>

                      <td className={`px-4 py-3.5 font-mono text-xs ${mutedCls}`}>{row.cnom}</td>
                      <td className="px-4 py-3.5 text-sm">{row.etablissement}</td>
                      <td className={`px-4 py-3.5 text-sm ${mutedCls}`}>{row.dateDemande}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-red-500">{row.dateRefus}</td>
                      <td className="px-4 py-3.5">
                        <MotifBadge motif={row.motif} darkMode={darkMode} />
                      </td>
                      <td className="px-4 py-3.5 text-sm">{row.refusePar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



