import React, { useState } from "react";
import DossierModal from "./DossierModal";
import RefusModal from "./RefusModal";
import { useNavigate } from "react-router-dom";

const inscriptions = [
  {
    id: 1, initials: "AS", name: "Dr. Aminata Sow", specialite: "Pneumologue",
    hopital: "H. Laquintinie, Douala", ville: "Douala", email: "a.sow@laquintinie.cm",
    telephone: "+237 677 111 222", cnom: "CM-2024-1122", soumisLe: "Auj. 08:00",
    docs: true, docsStatus: "✓", time: "Auj. 08:00", timeColor: "text-teal-500", status: "pending",
    avatarIndex: 0,
    documents: [
      { label: "Diplôme de pneumologie 2019", status: "verified" },
      { label: "Carte CNOM 2024", status: "verified" },
      { label: "Attestation d'exercice", status: "verified" },
    ],
  },
  {
    id: 2, initials: "PE", name: "Dr. Paul Essomba", specialite: "Pneumologue",
    hopital: "CHU de Yaoundé", ville: "Yaoundé", email: "p.essomba@chuy.cm",
    telephone: "+237 699 234 567", cnom: "CM-2023-0874", soumisLe: "Hier 14:22",
    docs: true, docsStatus: "⚠", time: "Hier 14:22", timeColor: "text-orange-400", status: "pending",
    avatarIndex: 1,
    documents: [
      { label: "Diplôme de pneumologie 2018", status: "verified" },
      { label: "Carte CNOM 2023", status: "pending" },
      { label: "Attestation d'exercice", status: "verified" },
    ],
  },
  {
    id: 3, initials: "FK", name: "Dr. Fatou Konaté", specialite: "Pneumologue",
    hopital: "H. Central, Bafoussam", ville: "Bafoussam", email: "f.konate@hcb.cm",
    telephone: "+237 655 789 012", cnom: "CM-2024-0311", soumisLe: "Il y a 2j",
    docs: true, docsStatus: "✓", time: "Il y a 2j", timeColor: "text-gray-400", status: "pending",
    avatarIndex: 2,
    documents: [
      { label: "Diplôme de pneumologie 2020", status: "verified" },
      { label: "Carte CNOM 2024", status: "verified" },
      { label: "Attestation d'exercice", status: "verified" },
    ],
  },
  {
    id: 4, initials: "MB", name: "Dr. Michel Biya", specialite: "Radiologue",
    hopital: "Clinique de l'Estuaire, Libreville", ville: "Libreville", email: "m.biya@estuaire.ga",
    telephone: "+241 077 456 789", cnom: "GA-2024-0099", soumisLe: "Il y a 3j",
    docs: false, docsStatus: "✗", time: "Il y a 3j", timeColor: "text-gray-400", status: "pending",
    avatarIndex: 3,
    documents: [
      { label: "Diplôme de radiologie 2021", status: "missing" },
      { label: "Carte CNOM 2024", status: "missing" },
    ],
  },
];

const avatarColors = ["bg-teal-600", "bg-blue-600", "bg-purple-600", "bg-orange-600"];

export default function InscriptionsUrgentes({ darkMode }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(inscriptions);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [refusDoc, setRefusDoc] = useState(null);

  const handleAction = (id, action) => {
    setItems((prev) => prev.map((item) => item.id === id ?{ ...item, status: action } : item));
  };

  const openRefus = (doc) => {
    setSelectedDossier(null);
    setRefusDoc(doc);
  };

  const handleConfirmRefus = ({ motif, message }) => {
    handleAction(refusDoc.id, "refused");
    setRefusDoc(null);
    console.log("Refus confirmé:", { doctorId: refusDoc.id, motif, message });
  };

  const pending = items.filter((i) => i.status === "pending");
  const visiblePending = pending.slice(0, 2);

  return (
    <>
      <div className={`rounded-2xl border overflow-hidden ${darkMode ?"bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>

        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${darkMode ?"border-gray-700" : "border-gray-100"}`}>
          <div>
            <h2 className={`font-semibold text-sm ${darkMode ?"text-white" : "text-gray-900"}`}>Inscriptions urgentes</h2>
            <p className={`text-xs mt-0.5 ${darkMode ?"text-gray-500" : "text-gray-400"}`}>En attente de décision</p>
          </div>
          <button
          onClick={() => navigate("/administrateur/inscriptions/nouvelles")}
          className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
            Tout traiter
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Liste */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {pending.length === 0 ?(
            <div className="py-12 text-center">
              <p className={`text-sm ${darkMode ?"text-gray-500" : "text-gray-400"}`}>
                ✓ Toutes les inscriptions ont été traitées
              </p>
            </div>
          ) : (
            visiblePending.map((doc, idx) => (
              <div
                key={doc.id}
                className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 transition-colors ${
                  darkMode ?"hover:bg-gray-750 border-gray-700" : "hover:bg-gray-50/60 border-gray-100"
                } border-b last:border-b-0`}
              >
                {/* Avatar + infos */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                    {doc.initials}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${darkMode ?"text-white" : "text-gray-900"}`}>{doc.name}</p>
                    <p className={`text-xs truncate ${darkMode ?"text-gray-400" : "text-gray-400"}`}>{doc.specialite} · {doc.hopital}</p>
                  </div>
                </div>

                {/* Docs + heure */}
                <div className="flex items-center gap-3 ml-12 sm:ml-0 sm:mr-4">
                  <span className={`text-xs ${doc.docsStatus === "✓" ?"text-teal-500" : doc.docsStatus === "⚠" ?"text-orange-400" : "text-red-400"}`}>
                    Docs {doc.docsStatus}
                  </span>
                  <span className={`text-xs ${doc.timeColor}`}>{doc.time}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-12 sm:ml-0 flex-shrink-0">
                  <button
                    onClick={() => handleAction(doc.id, "validated")}
                    className="text-xs font-semibold text-teal-600 border border-teal-300 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Valider
                  </button>
                  <button
                    onClick={() => setSelectedDossier(doc)}
                    className={`text-xs font-medium border px-3 py-1.5 rounded-lg transition-colors ${
                      darkMode ?"text-gray-300 border-gray-600 hover:bg-gray-700" : "text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Voir dossier
                  </button>
                  <button
                    onClick={() => openRefus(doc)}
                    className="text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Refuser
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DossierModal — contient déjà DocumentViewerModal en interne */}
      {selectedDossier && (
        <DossierModal
          doc={selectedDossier}
          darkMode={darkMode}
          onClose={() => setSelectedDossier(null)}
          onValidate={(id) => handleAction(id, "validated")}
          onRefuse={openRefus}
        />
      )}

      {/* RefusModal */}
      {refusDoc && (
        <RefusModal
          doctorName={refusDoc.name}
          darkMode={darkMode}
          onClose={() => setRefusDoc(null)}
          onConfirm={handleConfirmRefus}
        />
      )}
    </>
  );
}
