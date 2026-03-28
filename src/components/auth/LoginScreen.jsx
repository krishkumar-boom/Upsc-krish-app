import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FaShieldAlt, FaBrain, FaChartLine, FaBolt, FaLock, FaAward } from 'react-icons/fa'

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10"
            style={{
              width: `${150 + i * 40}px`,
              height: `${150 + i * 40}px`,
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
              animation: `float ${15 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * -3}s`
            }}
          />
        ))}
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-5">
        <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.08] rounded-3xl p-10 md:p-12 text-center animate-slideUp">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-13 h-13 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              NDA<span className="text-cyan-400">Platform</span>
            </h1>
          </div>

          <p className="text-gray-400 text-sm mb-4">Advanced UPSC-NDA Examination System</p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold mb-7">
            <FaAward />
            <span>India's Most Advanced Test Platform</span>
          </div>

          {/* Feature pills */}
          <div className="flex gap-2 justify-center mb-8 flex-wrap">
            {[
              { icon: FaBrain, label: 'AI-Powered' },
              { icon: FaChartLine, label: 'Analytics' },
              { icon: FaBolt, label: 'Real-time' }
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/[0.08] rounded-full text-gray-400 text-xs font-medium">
                <Icon className="text-indigo-400 text-[10px]" /> {label}
              </span>
            ))}
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="relative w-full py-4 px-6 bg-white rounded-xl cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/15 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-center gap-3 relative z-10">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-semibold text-[#0f172a]">
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </span>
            </div>
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </button>

          {/* Footer */}
          <div className="mt-7">
            <p className="text-gray-500 text-xs mb-3">Secure authentication powered by Google</p>
            <div className="flex gap-4 justify-center">
              <span className="text-gray-500 text-[11px] flex items-center gap-1">
                <FaLock /> SSL Encrypted
              </span>
              <span className="text-gray-500 text-[11px] flex items-center gap-1">
                <FaShieldAlt /> Secure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-xs font-medium tracking-wider">
        Developer: KRISH MADDHESHIYA
      </div>
    </div>
  )
}
