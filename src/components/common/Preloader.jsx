import { FaShieldAlt } from 'react-icons/fa'

export default function Preloader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center z-[99999]">
      <div className="text-center relative">
        {/* Pulse rings */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-30 h-30 border-2 border-indigo-500/30 rounded-full"
            style={{
              animation: `pulseRing 2s ease-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}

        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-5 animate-float relative z-10">
          <FaShieldAlt className="text-white text-3xl" />
        </div>

        <p className="text-white text-lg font-semibold tracking-widest mb-5 relative z-10">
          NDA Test Platform
        </p>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto relative z-10">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
            style={{ animation: 'loadBar 2s ease-in-out forwards' }}
          />
        </div>
      </div>
    </div>
  )
}
