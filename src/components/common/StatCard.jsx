export default function StatCard({ icon: Icon, value, label, colorClass = 'purple', borderColor }) {
  const colorMap = {
    purple: 'bg-indigo-500/10 text-indigo-500',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-emerald-500/10 text-emerald-500',
    orange: 'bg-amber-500/10 text-amber-500',
    red: 'bg-red-500/10 text-red-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    pink: 'bg-pink-500/10 text-pink-500',
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={borderColor ? { borderLeft: `4px solid ${borderColor}` } : {}}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colorMap[colorClass] || colorMap.purple}`}>
        <Icon />
      </div>
      <div>
        <h3 className="text-[22px] font-bold text-gray-900 leading-none">{value}</h3>
        <p className="text-[13px] text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  )
}
