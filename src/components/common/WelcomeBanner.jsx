export default function WelcomeBanner({ name, subtitle, stats = [] }) {
  return (
    <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 rounded-3xl p-8 text-white overflow-hidden mb-6 animate-fadeIn">
      {/* Decorative circles */}
      <div className="absolute -top-1/2 -right-[20%] w-72 h-72 bg-white/[0.08] rounded-full" />
      <div className="absolute -bottom-[30%] left-[10%] w-48 h-48 bg-white/[0.05] rounded-full" />

      <h2 className="text-2xl md:text-[26px] font-extrabold mb-2 relative z-10">{name}</h2>
      <p className="text-sm opacity-85 relative z-10 max-w-[500px]">{subtitle}</p>

      {stats.length > 0 && (
        <div className="flex gap-6 mt-5 relative z-10 flex-wrap">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <h3 className="text-2xl font-extrabold">{stat.value}</h3>
              <p className="text-xs opacity-70 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
