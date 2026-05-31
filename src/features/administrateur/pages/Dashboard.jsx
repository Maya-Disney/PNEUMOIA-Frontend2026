import { useOutletContext } from "react-router-dom";
import WelcomeBanner from "../components/WelcomeBanner";
import DashKpis      from "../components/DashKpis";
import DashActivite  from "../components/Dashactive";
import DashDemandes  from "../components/DashDemandes";
import DashAudit     from "../components/DashAudit";
import DashGeo       from "../components/DashGeo";

export default function Dashboard() {
  const ctx  = useOutletContext();
  const dark = ctx?.dark ?? false;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <WelcomeBanner dark={dark} />
      <DashKpis      dark={dark} />
      <DashActivite  dark={dark} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashDemandes dark={dark} />
        <DashAudit    dark={dark} />
        <DashGeo      dark={dark} />
      </div>
    </div>
  );
}