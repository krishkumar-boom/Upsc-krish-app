import { useState, useEffect } from 'react'
import { useData } from '../../../contexts/DataContext'
import { useAuth } from '../../../contexts/AuthContext'
import Card from '../../common/Card'
import { FaBrain, FaClock, FaExclamationTriangle, FaPlay } from 'react-icons/fa'

export default function SmartPractice({ onStartTest }) {
  const { currentUser } = useAuth()
  const { getFilteredQuestions } = useData()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // In real app, fetch user's spaced repetition data
    setUserData({ due: 5, weak: 8 })
  }, [currentUser])

  const startPractice = (type) => {
    let qs = [], title = ''
    if (type === 'recommended') {
      qs = getFilteredQuestions({ limit: 20 })
      title = 'Smart Practice - Recommended'
    } else if (type === 'due') {
      qs = getFilteredQuestions({ limit: 10 })
      title = 'Review - Due Questions'
    } else if (type === 'weak') {
      qs = getFilteredQuestions({ difficulty: 'hard', limit: 15 })
      title = 'Practice - Weak Areas'
    }
    if (qs.length === 0) return
    onStartTest({ title, subject: 'mixed', questions: qs, timeLimit: Math.max(10, qs.length * 2) })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaBrain className="text-indigo-500" /> Smart Practice
        </h2>
        <p className="text-gray-500 text-sm">AI-powered personalized practice</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { type: 'recommended', icon: FaBrain, color: '#6366f1', label: 'Recommended', desc: '20 questions tailored for you', count: 20 },
          { type: 'due', icon: FaClock, color: '#f59e0b', label: 'Due for Review', desc: `${userData?.due || 0} questions to review`, count: userData?.due || 0 },
          { type: 'weak', icon: FaExclamationTriangle, color: '#ef4444', label: 'Weak Areas', desc: `${userData?.weak || 0} questions you got wrong`, count: userData?.weak || 0 },
        ].map(item => {
          const Icon = item.icon
          return (
            <Card key={item.type} className="text-center cursor-pointer border-t-4 hover:shadow-lg transition-all" style={{ borderTopColor: item.color }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${item.color}15` }}>
                <Icon className="text-2xl" style={{ color: item.color }} />
              </div>
              <h4 className="font-semibold mb-1">{item.label}</h4>
              <p className="text-xs text-gray-500 mb-4">{item.desc}</p>
              <button onClick={() => startPractice(item.type)} disabled={item.count === 0} className="w-full py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-50" style={{ backgroundColor: item.color }}>
                <FaPlay /> Start
              </button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
