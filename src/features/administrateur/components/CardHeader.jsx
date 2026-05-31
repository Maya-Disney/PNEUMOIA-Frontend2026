import { ChevronRight } from "lucide-react";

const BRAND = "#0f766e";

export default function CardHeader({ title, sub, action, onAction, dark }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{title}</p>
        {sub && <p className={`text-[11px] mt-0.5 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>{sub}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1 text-[11px] font-bold hover:opacity-70 transition-opacity" style={{ color: BRAND }}>
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}