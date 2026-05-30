import { useOutletContext } from "react-router-dom";
import { MOCKS } from "../mocks/adminDashboard.mock";
import HeroBanner      from "../componentDashboard/HeroBanner";
import KpiGrid         from "../componentDashboard/KPiGrid";
import PendingRequests from "../componentDashboard/pendingRequest";
import ActivityChart   from "../componentDashboard/ActivityChart";
import AuditLog        from "../componentDashboard/AuditLog";
import DoctorsTable    from "../componentDashboard/Doctorsstable";
import SystemHealth    from "../componentDashboard/systemHeath";

const data = MOCKS[0]; // ← changer en MOCKS[1] pour tester l'autre jeu

export default function Dashboard() {
  useOutletContext();

  return (
    <div className="flex flex-col gap-4 max-w-[1400px]">
      <HeroBanner />
      <KpiGrid stats={data.stats} />
      <div className="grid grid-cols-3 gap-3">
        <PendingRequests demandes={data.demandes} />
        <ActivityChart   activite={data.activite} />
        <AuditLog        audit={data.audit} />
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <DoctorsTable medecins={data.medecins} />
        <SystemHealth systeme={data.systeme} />
      </div>
    </div>
  );
}