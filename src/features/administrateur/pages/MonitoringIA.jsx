import React, { useState, useEffect, useRef } from 'react';
import useAdminTheme from "../hooks/useAdminTheme";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Topbar from '../components/Topbar';
import PathologyBars from '../components/PathologyBars';
import SystemIndicators from '../components/IndicateurSysteme';
import Top5Doctors from '../components/BestDoctor';
// Sous-composants
import Sidebar from '../components/Sidebar';
const fallbackData = {
  pathologies: [
    { name: 'Asthme severe', cases: 247, percent: 88 },
    { name: 'Pneumonie bacterienne', cases: 891, percent: 85 },
    { name: 'BPCO', cases: 312, percent: 83 },
    { name: 'Tuberculose', cases: 234, percent: 82 },
    { name: 'Bronchite aigue', cases: 198, percent: 82 },
    { name: 'Cancer bronchique', cases: 89, percent: 78 },
    { name: 'Epanchement pleural', cases: 156, percent: 76 },
    { name: 'Pneumopathie virale', cases: 89, percent: 72 },
    { name: 'Atelectasie', cases: 67, percent: 72 },
    { name: 'Normal (pas de pathologie)', cases: 124, percent: 57 },
  ],
  globalStats: {
    modelVersion: 'v2.4.1',
    lastUpdate: '15 mars 2026',
    trainingCases: 4821,
    contributors: 38,
    globalConcordance: 87,
    apiStatus: 'Operationnel',
  },
  topDoctors: [
    { rank: 1, name: 'Dr. Kamto', percent: 94 },
    { rank: 2, name: 'Dr. Nkoa', percent: 91 },
    { rank: 3, name: 'Dr. Moussa', percent: 90 },
    { rank: 4, name: 'Dr. Abena', percent: 89 },
    { rank: 5, name: 'Dr. Dupont', percent: 88 },
  ],
};

const normalizeMonitoringData = (payload) => {
  if (!payload || typeof payload !== 'object') return fallbackData;

  return {
    pathologies: Array.isArray(payload.pathologies) ?payload.pathologies : fallbackData.pathologies,
    globalStats:
      payload.globalStats && typeof payload.globalStats === 'object'
        ?{ ...fallbackData.globalStats, ...payload.globalStats }
        : fallbackData.globalStats,
    topDoctors: Array.isArray(payload.topDoctors) ?payload.topDoctors : fallbackData.topDoctors,
  };
};

const MonitoringIA = () => {
  const reportRef = useRef(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [activeKey, setActiveKey] = useState('monitoring');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const { darkMode, setDarkMode } = useAdminTheme();

  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!apiBaseUrl) {
        setData(fallbackData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/admin/monitoring-ia`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Erreur serveur');

        const result = await response.json();
        setData(normalizeMonitoringData(result));
      } catch (error) {
        console.error('Erreur lors du chargement des donnees:', error);
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadPDF = async () => {
    const element = reportRef.current;
    if (!element || exportingPdf) return;

    try {
      setExportingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        backgroundColor: darkMode ?'#111827' : '#f9fafb',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(`Monitoring_IA_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la generation du PDF. Reessayez ou reduisez le zoom du navigateur.");
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex admin-theme transition-colors duration-300 ${
        darkMode ?'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <Sidebar
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          darkMode={darkMode}
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <Topbar
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setMobileOpen={setMobileOpen}
          />
          <main className="flex-1 px-4 sm:px-6 py-4 flex items-center justify-center">
            <p className="text-lg text-gray-500">Chargement des donnees de monitoring...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex admin-theme transition-colors duration-300 ${
      darkMode ?'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <Sidebar
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        darkMode={darkMode}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setMobileOpen={setMobileOpen}
        />
        <main ref={reportRef} className="flex-1 px-4 sm:px-6 py-4 space-y-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ?'text-white' : 'text-gray-900'}`}>
                Monitoring IA
              </h1>
              <p className={`mt-1 ${darkMode ?'text-gray-400' : 'text-gray-500'}`}>
                Modele v2.4.1 - deploye le 15/03/2026
              </p>
            </div>

            <button
              type="button"
              onClick={downloadPDF}
              disabled={exportingPdf}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                darkMode ?'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white disabled:opacity-60' : 'bg-white border-gray-300 hover:bg-gray-50 disabled:opacity-60'
              }`}
            >
              {exportingPdf ?'Export en cours...' : 'Rapport PDF'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div
              className={`lg:col-span-8 rounded-2xl p-6 border ${
                darkMode ?'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}
            >
              <h2 className={`text-xl font-semibold mb-1 ${darkMode ?'text-white' : 'text-gray-900'}`}>
                Concordance par pathologie
              </h2>
              <p className={`mb-6 text-sm ${darkMode ?'text-gray-400' : 'text-gray-500'}`}>
                10 pathologies - toutes consultations
              </p>

              <PathologyBars pathologies={data.pathologies} darkMode={darkMode} />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <SystemIndicators stats={data.globalStats} darkMode={darkMode} />
              <Top5Doctors doctors={data.topDoctors} darkMode={darkMode} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MonitoringIA;



