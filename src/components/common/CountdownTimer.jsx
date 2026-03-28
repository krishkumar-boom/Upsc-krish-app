import { useState, useEffect } from 'react'

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const getNextExam = () => {
      const now = new Date()
      const year = now.getFullYear()
      const april = new Date(year, 3, 13)
      const sept = new Date(year, 8, 1)

      if (now < april) return april
      if (now < sept) return sept
      return new Date(year + 1, 3, 13)
    }

    const target = getNextExam()

    const interval = setInterval(() => {
      const diff = target - new Date()
      if (diff <= 0) return

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const digits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.mins, label: 'Min' },
    { value: timeLeft.secs, label: 'Sec' },
  ]

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-7 text-white text-center animate-fadeIn">
      <h3 className="text-base font-semibold mb-1">⏰ Next NDA Exam Countdown</h3>
      <p className="text-xs opacity-60 mb-4">UPSC NDA 2025</p>
      <div className="flex gap-3 justify-center">
        {digits.map((d, i) => (
          <div key={i} className="bg-white/10 rounded-xl px-4 py-3 min-w-[56px]">
            <div className="text-2xl font-extrabold font-mono">
              {String(d.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-60 mt-1">
              {d.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
