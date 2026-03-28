import { useEffect, useState } from 'react'

export default function Confetti({ show = false, duration = 4000 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!show) return

    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      dur: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
    }))

    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), duration)
    return () => clearTimeout(timer)
  }, [show, duration])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute -top-2.5"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
