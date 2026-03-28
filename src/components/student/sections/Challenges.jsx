import { useState } from 'react'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import { FaBolt, FaRunning, FaFire, FaMountain, FaRandom, FaPlay } from 'react-icons/fa'

const CHALLENGES = {
  speed_round: { name: 'Speed Round', icon: FaBolt, color: '#f59e0b', desc: '30 seconds per question, 10 questions', timePerQ: 30, count: 10 },
  marathon: { name: 'Marathon', icon: FaRunning, color: '#6366f1', desc: '100 questions, 150 minutes', timePerQ: 90, count: 100 },
  rapid_fire: { name: 'Rapid Fire', icon: FaFire, color: '#ef4444', desc: '15 seconds per question, 20 questions', timePerQ: 15, count: 20 },
  endurance: { name: 'Endurance', icon: FaMountain, color: '#10b981', desc: '50 questions, no time limit', timePerQ: 0, count: 50 },
  mixed_bag: { name: 'Mixed Bag', icon: FaRandom, color: '#8b5cf6', desc: '25 random questions from all subjects', timePerQ: 60, count: 25 },
}

export default function Challenges({ onStartTest }) {
  const { getFilteredQuestions } = useData()

  const startChallenge = (key) => {
    const mode = CHALLENGES[key]
    const qs = getFilteredQuestions({ limit: mode.count })
    if (qs.length === 0) return

    const totalTime = mode.timePerQ > 0 ? Math.ceil((mode.timePerQ * Math.min(qs.length, mode.count)) / 60) : 999

    onStartTest({
      title: `Challenge: ${mode.name}`,
      subject: 'mixed',
      questions: qs.slice(0, mode.count),
      timeLimit: totalTime
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaFire className="text-indigo-500" /> Challenge Modes
        </h2>
        <p className="text-gray-500 text-sm">Test yourself with special challenge modes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(CHALLENGES).map(([key, mode]) => {
          const Icon = mode.icon
          return (
            <Card key={key} className="text-center cursor-pointer border-t-4 hover:shadow-lg transition-all" style={{ borderTopColor: mode.color }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${mode.color}15` }}>
                <Icon className="text-3xl" style={{ color: mode.color }} />
              </div>
              <h3 className="text-lg font-bold mb-2">{mode.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{mode.desc}</p>
              <button onClick={() => startChallenge(key)} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: mode.color }}>
                <FaPlay /> Start Challenge
              </button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
