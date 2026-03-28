import { useState, useMemo } from 'react'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import { SUBJECTS, DIFFICULTIES, QUESTION_TYPES, EXAM_TYPES, getSubjectInfo } from '../../../utils/helpers'
import { FaFileAlt, FaFilter, FaPlay, FaRedo } from 'react-icons/fa'

export default function AvailableTests({ onStartTest }) {
  const { questions, getFilteredQuestions } = useData()
  const [filters, setFilters] = useState({ examType: '', subject: '', difficulty: '', type: '', count: 20, time: 45 })

  const availableCount = useMemo(() => {
    const f = { ...filters }
    delete f.count; delete f.time
    return getFilteredQuestions(f).length
  }, [filters, questions])

  const handleStart = () => {
    const f = { ...filters }
    delete f.count; delete f.time
    const qs = getFilteredQuestions({ ...f, limit: filters.count })
    if (qs.length === 0) return

    const subj = filters.subject ? getSubjectInfo(filters.subject).name : 'Mixed'
    onStartTest({
      title: `${subj} Test`,
      subject: filters.subject || 'mixed',
      difficulty: filters.difficulty,
      questions: qs,
      timeLimit: filters.time
    })
  }

  const reset = () => setFilters({ examType: '', subject: '', difficulty: '', type: '', count: 20, time: 45 })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaFileAlt className="text-indigo-500" /> Available Tests
        </h2>
        <p className="text-gray-500 text-sm">Filter and start tests based on your preparation needs</p>
      </div>

      <Card title="Advanced Test Filters" icon={FaFilter} action={<button onClick={reset} className="text-xs text-indigo-500 font-semibold hover:underline flex items-center gap-1"><FaRedo /> Reset</button>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Exam Type</label>
            <select value={filters.examType} onChange={e => setFilters(p => ({ ...p, examType: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value="">All Types</option>
              {EXAM_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
            <select value={filters.subject} onChange={e => setFilters(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulty</label>
            <select value={filters.difficulty} onChange={e => setFilters(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value="">All Levels</option>
              {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Type</label>
            <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value="">All Types</option>
              {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Questions</label>
            <select value={filters.count} onChange={e => setFilters(p => ({ ...p, count: parseInt(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n} Questions</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Limit</label>
            <select value={filters.time} onChange={e => setFilters(p => ({ ...p, time: parseInt(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              {[15, 30, 45, 60, 90, 120, 150].map(n => <option key={n} value={n}>{n} Minutes</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-indigo-600">{availableCount}</span> questions available with current filters
          </div>
          <button
            onClick={handleStart}
            disabled={availableCount === 0}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaPlay /> Start Test
          </button>
        </div>
      </Card>
    </div>
  )
}
