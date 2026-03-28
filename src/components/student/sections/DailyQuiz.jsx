import { useState, useEffect } from 'react'
import { useData } from '../../../contexts/DataContext'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import { useAuth } from '../../../contexts/AuthContext'
import Card from '../../common/Card'
import { FaCalendarDay, FaPlay, FaCheckCircle } from 'react-icons/fa'

export default function DailyQuiz({ onStartTest }) {
  const { currentUser } = useAuth()
  const { questions } = useData()
  const [completed, setCompleted] = useState(false)
  const [todayQuestions, setTodayQuestions] = useState([])

  useEffect(() => {
    checkCompletion()
    generateDailyQuiz()
  }, [currentUser, questions])

  const checkCompletion = async () => {
    if (!currentUser) return
    const today = new Date().toISOString().split('T')[0]
    try {
      const q = query(
        collection(db, COLLECTIONS.TEST_RESULTS),
        where('userId', '==', currentUser.uid),
        where('testConfig.title', '==', 'Daily Quiz'),
        orderBy('completedAt', 'desc'),
        limit(1)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const last = snap.docs[0].data()
        const lastDate = last.completedAt?.toDate?.()?.toISOString().split('T')[0]
        setCompleted(lastDate === today)
      }
    } catch (e) { console.error(e) }
  }

  const generateDailyQuiz = () => {
    const today = new Date().toISOString().split('T')[0]
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const active = questions.filter(q => q.active !== false)
    if (active.length === 0) return

    const selected = []
    const count = Math.min(10, active.length)
    for (let i = 0; i < count; i++) {
      const idx = Math.abs((seed + i * 7919) % active.length)
      if (!selected.find(q => q.id === active[idx].id)) selected.push(active[idx])
    }
    setTodayQuestions(selected)
  }

  const handleStart = () => {
    if (todayQuestions.length === 0) return
    onStartTest({
      title: 'Daily Quiz',
      subject: 'mixed',
      questions: todayQuestions,
      timeLimit: Math.max(10, todayQuestions.length * 2)
    })
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaCalendarDay className="text-indigo-500" /> Daily Quiz
        </h2>
        <p className="text-gray-500 text-sm">{today}</p>
      </div>

      <Card>
        <div className="text-center py-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${completed ? 'bg-emerald-100 text-emerald-500' : 'bg-indigo-100 text-indigo-500'}`}>
            {completed ? <FaCheckCircle className="text-4xl" /> : <FaCalendarDay className="text-4xl" />}
          </div>

          {completed ? (
            <>
              <h3 className="text-xl font-bold text-emerald-600 mb-2">Today's Quiz Completed! ✅</h3>
              <p className="text-gray-500 mb-6">Come back tomorrow for a new quiz!</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2">Today's Daily Quiz</h3>
              <p className="text-gray-500 mb-2">{todayQuestions.length} Questions • Mixed Subjects</p>
              <p className="text-sm text-gray-400 mb-6">New quiz every day! Complete it to maintain your streak.</p>
              {todayQuestions.length > 0 ? (
                <button onClick={handleStart} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 mx-auto hover:shadow-lg transition-all">
                  <FaPlay /> Start Daily Quiz
                </button>
              ) : (
                <p className="text-amber-500">No questions available. Ask admin to add questions.</p>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
