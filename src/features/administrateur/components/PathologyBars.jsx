export default function PathologyBars({
  pathologies,
  darkMode,
}) {
  return (
    <div className="space-y-6">
      {pathologies.map((patho, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className={`font-medium ${darkMode ?"text-gray-200" : "text-gray-800"}`}>
              {patho.name}
            </span>
            <div>
              <span className="font-semibold">{patho.cases} cas </span>
              <span className="font-bold text-emerald-600">{patho.percent}%</span>
            </div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${patho.color || "bg-emerald-500"}`}
              style={{ width: `${patho.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}