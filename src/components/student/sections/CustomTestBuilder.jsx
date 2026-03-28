import { useState, useMemo } from 'react'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import { SUBJECTS, DIFFICULTIES, QUESTION_TYPES, EXAM_TYPES, getSubjectInfo } from '../../../utils/helpers'
import { FaTools, FaPlay } from 'react-icons/fa'

export default function CustomTestBuilder({ onStartTest }) {
  const { getFilteredQuestions } = useData()
  const [config, setConfig] = useState({
    title: 'Custom Practice Test', examType: '', subject: '', difficulty: '', type: '', count: 20, time: 45
  })

  const availableCount = useMemo(() => {
    const f = { examType: config.examType || undefined, subject: config.subject || undefined, difficulty: config.difficulty || undefined, type: config.type || undefined }
    return getFilteredQuestions(f).length
  }, [config, getFilteredQuestions])

  const handleStart = () => {
    const f = { examType: config.examType || undefined, subject: config.subject || undefined, difficulty: config.difficulty || undefined, type: config.type || undefined, limit: config.count }
    const qs = getFilteredQuestions(f)
    if (qs.length === 0) return

    onStartTest({
      title: config.title || 'Custom Test',
      subject: config.subject || 'mixed',
      difficulty: config.difficulty,
      questions: qs,
      timeLimit: config.time
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaTools className="text-indigo-500" /> Custom Test Builder
        </h2>
        <p className="text-gray-500 text-sm">Build your own personalized test</p>
      </div>

      <Card title="Configure Your Test" icon={FaTools}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Test Title</label>
            <input type="text" value={config.title} onChange={e => setConfig(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="My Practice Test" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Exam Type</label>
              <select value={config.examType} onChange={e => setConfig(p => ({ ...p, examType: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option value="">Any</option>
                {EXAM_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
              <select value={config.subject} onChange={e => setConfig(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option value="">All Subjects (Mixed)</option>
                {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulty</label>
              <select value={config.difficulty} onChange={e => setConfig(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option value="">All Levels</option>
                {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Type</label>
              <select value={config.type} onChange={e => setConfig(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option value="">All Types</option>
                {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Questions</label>
              <input type="number" value={config.count} onChange={e => setConfig(p => ({ ...p, count: Math.max(5, Math.min(200, parseInt(e.target.value) || 20)) }))} min={5} max={200} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Limit: {config.time} minutes</label>
            <input type="range" min={10} max={180} value={config.time} onChange={e => setConfig(p => ({ ...p, time: parseInt(e.target.value) }))} className="w-full accent-indigo-500" />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">{availableCount}</span> questions available for your selection
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={handleStart} disabled={availableCount === 0} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all">
              <FaPlay /> Start Custom Test
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
