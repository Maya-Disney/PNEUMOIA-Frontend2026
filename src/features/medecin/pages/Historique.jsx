// src/features/medecin/pages/ConsultationHistory.jsx
import { useState } from 'react';
import { TablePagination } from '../../../components/ui/TablePagination';
import { useProfil } from '../hooks/useAuth';
import { 
  Search, Calendar, Clock, User, Stethoscope, 
  FileText, ChevronRight, Filter, Download,
  Eye, CheckCircle, XCircle, AlertCircle,
  Phone, Video, MapPin, ArrowUpDown,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  LayoutGrid, List, Activity, X
} from 'lucide-react';

export default function ConsultationHistory() {
  const { profil } = useProfil();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const nomMedecin = profil
    ? `${profil.civilite || 'Dr'}. ${profil.prenom} ${profil.nom}`
    : 'Dr.';

  const consultations = [
    {
      id: 1,
      patient: { name: 'Tamo Bernard', age: 47, avatar: 'TB' },
      date: '2026-04-08',
      time: '14:30',
      type: 'presentiel',
      status: 'completed',
      pathology: 'Pneumonie bactérienne',
      doctor: nomMedecin,
      duration: '45 min',
      notes: 'Patient réactif au traitement, amélioration des symptômes.',
      prescription: 'Antibiotiques x7 jours, repos',
      nextAppointment: '2026-04-15'
    },
    {
      id: 2,
      patient: { name: 'Fouda Marie', age: 52, avatar: 'FM' },
      date: '2026-04-08',
      time: '11:20',
      type: 'presentiel',
      status: 'completed',
      pathology: 'BPCO stade 3',
      doctor: nomMedecin,
      duration: '30 min',
      notes: 'Stable, poursuite du traitement habituel.',
      prescription: 'Bronchodilatateurs',
      nextAppointment: '2026-04-22'
    },
    {
      id: 3,
      patient: { name: 'Nguema Paul', age: 63, avatar: 'NP' },
      date: '2026-04-07',
      time: '09:15',
      type: 'presentiel',
      status: 'completed',
      pathology: 'Asthme sévère',
      doctor: nomMedecin,
      duration: '60 min',
      notes: 'Crise d\'asthme maîtrisée, ajustement du traitement.',
      prescription: 'Corticoïdes inhalés',
      nextAppointment: '2026-04-14'
    },
    {
      id: 4,
      patient: { name: 'Mboma Éric', age: 35, avatar: 'MÉ' },
      date: '2026-04-07',
      time: '16:45',
      type: 'presentiel',
      status: 'cancelled',
      pathology: 'Bronchite aiguë',
      doctor: nomMedecin,
      duration: '0 min',
      notes: 'Consultation annulée par le patient',
      prescription: null,
      nextAppointment: null
    },
    {
      id: 5,
      patient: { name: 'Kamga Jean', age: 71, avatar: 'KJ' },
      date: '2026-04-06',
      time: '10:00',
      type: 'presentiel',
      status: 'completed',
      pathology: 'Tuberculose',
      doctor: nomMedecin,
      duration: '50 min',
      notes: 'Début du traitement, suivi rapproché nécessaire.',
      prescription: 'Antituberculeux',
      nextAppointment: '2026-04-13'
    },
    {
      id: 6,
      patient: { name: 'Manga Honorine', age: 58, avatar: 'MH' },
      date: '2026-04-05',
      time: '14:00',
      type: 'presentiel',
      status: 'completed',
      pathology: 'Fibrose pulmonaire',
      doctor: nomMedecin,
      duration: '40 min',
      notes: 'Stabilité de la maladie, suivi semestriel.',
      prescription: 'Traitement antifibrotique',
      nextAppointment: '2026-10-05'
    },
    {
      id: 7,
      patient: { name: 'Essomba Patrice', age: 44, avatar: 'EP' },
      date: '2026-04-04',
      time: '09:30',
      type: 'presentiel',
      status: 'completed',
      pathology: 'Apnée du sommeil',
      doctor: nomMedecin,
      duration: '25 min',
      notes: 'Adaptation du traitement CPAP.',
      prescription: 'Pression CPAP ajustée',
      nextAppointment: '2026-05-04'
    },
    {
      id: 8,
      patient: { name: 'Biya Christine', age: 29, avatar: 'BC' },
      date: '2026-04-03',
      time: '15:45',
      type: 'presentiel',
      status: 'pending',
      pathology: 'Pneumonie',
      doctor: nomMedecin,
      duration: null,
      notes: 'En attente des résultats d\'imagerie',
      prescription: null,
      nextAppointment: null
    },
    {
      id: 9,
      patient: { name: 'Mvondo Alain', age: 51, avatar: 'MA' },
      date: '2026-04-02',
      time: '11:00',
      type: 'presentiel',
      status: 'completed',
      pathology: 'Bronchite chronique',
      doctor: nomMedecin,
      duration: '35 min',
      notes: 'Amélioration progressive.',
      prescription: 'Anti-inflammatoires',
      nextAppointment: '2026-05-02'
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      completed: { label: 'Terminée', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      cancelled: { label: 'Annulée', icon: XCircle, className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
      pending: { label: 'En attente', icon: AlertCircle, className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
    };
    return badges[status] || badges.completed;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredConsultations = consultations.filter(consult => {
    const matchesSearch = consult.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          consult.pathology.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || consult.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const paginatedConsultations = filteredConsultations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Vue Cartes
  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {paginatedConsultations.map((consult) => {
        const StatusBadge = getStatusBadge(consult.status);
        const StatusIcon = StatusBadge.icon;
        
        return (
          <div
            key={consult.id}
            onClick={() => setSelectedConsultation(consult)}
            className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-4 border-b border-(--ln) bg-(--sf2) dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {consult.patient.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-(--t1) dark:text-white">{consult.patient.name}</h3>
                    <p className="text-xs text-[var(--t3)] dark:text-slate-300">{consult.patient.age} ans</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${StatusBadge.className}`}>
                  <StatusIcon className="w-3 h-3" />
                  {StatusBadge.label}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[var(--t3)]">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(consult.date)}</span>
                </div>
                  <div className="flex items-center gap-2 text-[var(--t3)]">
                  <Clock className="w-4 h-4" />
                  <span>{consult.time}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-[var(--t4)] mb-1">Pathologie</p>
                <p className="text-sm font-medium text-(--t1)">{consult.pathology}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-[var(--t3)] bg-(--sf2) px-2 py-1 rounded-lg">
                  <User className="w-3 h-3" />
                  <span>{consult.doctor}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--t3)] bg-(--sf2) px-2 py-1 rounded-lg">
                  <Activity className="w-3 h-3" />
                  <span>{consult.duration || 'N/A'}</span>
                </div>
              </div>

              {consult.notes && (
                <p className="text-xs text-[var(--t3)] line-clamp-2 italic">
                  "{consult.notes}"
                </p>
              )}
            </div>

            <div className="px-4 py-3 bg-(--sf2) border-t border-(--ln) flex items-center justify-between">
              <span className="text-xs text-[var(--t3)]">Consultation présentielle</span>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir détails
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Vue Tableau
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-(--sf2) border-b border-(--ln)">
          <tr>
            <th className="text-left py-4 px-5 text-xs font-semibold text-[var(--t3)] uppercase tracking-wider">Patient</th>
            <th className="text-left py-4 px-5 text-xs font-semibold text-[var(--t3)] uppercase tracking-wider">Date & Heure</th>
            <th className="text-left py-4 px-5 text-xs font-semibold text-[var(--t3)] uppercase tracking-wider">Pathologie</th>
            <th className="text-left py-4 px-5 text-xs font-semibold text-[var(--t3)] uppercase tracking-wider">Durée</th>
            <th className="text-left py-4 px-5 text-xs font-semibold text-[var(--t3)] uppercase tracking-wider">Statut</th>
            <th className="text-right py-4 px-5 text-xs font-semibold text-[var(--t3)] uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--ln)]">
          {paginatedConsultations.map((consult) => {
            const StatusBadge = getStatusBadge(consult.status);
            const StatusIcon = StatusBadge.icon;
            
            return (
              <tr 
                key={consult.id} 
                className="hover:bg-(--sf2) transition-colors cursor-pointer"
                onClick={() => setSelectedConsultation(consult)}
              >
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {consult.patient.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--t1)">{consult.patient.name}</p>
                      <p className="text-xs text-[var(--t4)]">{consult.patient.age} ans</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-[var(--t2)]">{formatDate(consult.date)}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
                    <span className="text-sm text-[var(--t2)]">{consult.time}</span>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <p className="text-sm text-(--t1)">{consult.pathology}</p>
                </td>
                <td className="py-4 px-5">
                  <span className="text-sm text-[var(--t2)]">{consult.duration || '-'}</span>
                </td>
                <td className="py-4 px-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${StatusBadge.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {StatusBadge.label}
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Modal Détails Consultation
  const ConsultationModal = () => {
    if (!selectedConsultation) return null;
    const StatusBadge = getStatusBadge(selectedConsultation.status);
    const StatusIcon = StatusBadge.icon;

    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setSelectedConsultation(null)}
        />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* En-tête du modal */}
          <div className="p-6 border-b border-(--ln) bg-(--sf2) dark:bg-slate-950 sticky top-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-white" />
                <h2 className="text-xl font-bold text-(--t1) dark:text-white">Détails de la consultation</h2>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-2 rounded-lg hover:bg-[var(--sf3)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--t3)]" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            {/* Patient */}
            <div className="flex items-center gap-4 p-4 bg-(--sf2) dark:bg-slate-950 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {selectedConsultation.patient.avatar}
              </div>
              <div>
                <p className="text-lg font-bold text-(--t1) dark:text-white">{selectedConsultation.patient.name}</p>
                <p className="text-sm text-[var(--t3)] dark:text-slate-300">{selectedConsultation.patient.age} ans</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${StatusBadge.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {StatusBadge.label}
                  </span>
                  <span className="text-xs text-slate-400">Consultation présentielle</span>
                </div>
              </div>
            </div>

            {/* Infos consultation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-(--sf) border border-(--ln) rounded-xl">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--t3)]">Date</p>
                  <p className="text-sm font-medium">{formatDate(selectedConsultation.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-(--sf) border border-(--ln) rounded-xl">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--t3)]">Heure</p>
                  <p className="text-sm font-medium">{selectedConsultation.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-(--sf) border border-(--ln) rounded-xl">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--t3)]">Médecin</p>
                  <p className="text-sm font-medium">{selectedConsultation.doctor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-(--sf) border border-(--ln) rounded-xl">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-[var(--t3)]">Durée</p>
                  <p className="text-sm font-medium">{selectedConsultation.duration || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Pathologie */}
            <div className="p-4 bg-(--sf) border border-(--ln) rounded-xl">
              <h3 className="text-sm font-semibold text-(--t1) mb-1">Pathologie</h3>
              <p className="text-sm text-[var(--t2)]">{selectedConsultation.pathology}</p>
            </div>

            {/* Notes médicales */}
            {selectedConsultation.notes && (
              <div className="p-4 bg-(--sf2) rounded-xl">
                <h3 className="text-sm font-semibold text-(--t1) mb-2">Notes médicales</h3>
                <p className="text-sm text-[var(--t2)]">{selectedConsultation.notes}</p>
              </div>
            )}

            {/* Prescription */}
            {selectedConsultation.prescription && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="text-sm font-semibold text-(--t1) mb-2">Prescription</h3>
                <p className="text-sm text-[var(--t2)]">{selectedConsultation.prescription}</p>
              </div>
            )}

            {/* Prochain rendez-vous */}
            {selectedConsultation.nextAppointment && (
              <div className="flex items-center justify-between p-4 border border-(--ln) rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-[var(--t3)]">Prochain rendez-vous</p>
                    <p className="text-sm font-medium">{formatDate(selectedConsultation.nextAppointment)}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  Modifier
                </button>
              </div>
            )}
          </div>

          {/* Footer modal */}
          <div className="p-6 border-t border-(--ln) bg-(--sf2) flex justify-end gap-3 sticky bottom-0">
            <button
              onClick={() => setSelectedConsultation(null)}
              className="px-4 py-2 text-sm font-medium text-[var(--t2)] hover:bg-(--sf) rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
              <FileText className="w-4 h-4 inline mr-2" />
              Télécharger le rapport
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Historique des consultations</h1>
          <p className="text-sm text-[var(--t3)] mt-1">Consultez l'historique complet de vos consultations en présentiel</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-(--sf) border border-(--ln) rounded-xl text-sm font-medium text-[var(--t2)] hover:bg-(--sf2) transition-all">
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou pathologie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-(--ln) rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1)"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Terminées</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulées</option>
          </select>
          
          {/* Boutons de changement de vue */}
          <div className="flex border border-(--ln) rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 px-3 transition-all ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-(--sf) text-[var(--t3)] hover:bg-(--sf2)'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 px-3 transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-(--sf) text-[var(--t3)] hover:bg-(--sf2)'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Vue actuelle */}
      {viewMode === 'cards' ? <CardsView /> : <TableView />}

      {/* Pagination */}
      <TablePagination
        total={filteredConsultations.length}
        page={currentPage}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={s => { setItemsPerPage(s); setCurrentPage(1); }}
      />

      {/* État vide */}
      {filteredConsultations.length === 0 && (
        <div className="text-center py-12 bg-(--sf) rounded-xl border border-(--ln)">
          <div className="w-16 h-16 bg-(--sf2) rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-[var(--t3)] font-medium">Aucune consultation trouvée</p>
          <p className="text-sm text-slate-400 mt-1">Modifiez vos critères de recherche</p>
        </div>
      )}

      {/* Modal des détails */}
      <ConsultationModal />
    </div>
  );
}
