import { useState, useMemo } from 'react'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import Modal from '../../common/Modal'
import EmptyState from '../../common/EmptyState'
import { SUBJECTS, DIFFICULTIES, QUESTION_TYPES, getSubjectInfo, truncate } from '../../../utils/helpers'
import { FaDatabase, FaPlus, FaSearch, FaEdit, FaTrash, FaImage, FaInbox } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function QuestionManager() {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const [formData, setFormData] = useState({
    question: '', subject: '', difficulty: 'medium', type: 'mcq',
    chapter: '', options: ['', '', '', ''], correctAnswer: '',
    explanation: '', numericalAnswer: '',
  })

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = !searchTerm ||
        q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchSubject = !filterSubject || q.subject === filterSubject
      return matchSearch && matchSubject
    })
  }, [questions, searchTerm, filterSubject])

  const resetForm = () => {
    setFormData({
      question: '', subject: '', difficulty: 'medium', type: 'mcq',
      chapter: '', options: ['', '', '', ''], correctAnswer: '',
      explanation: '', numericalAnswer: '',
    })
    setEditingQuestion(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      question: formData.question,
      subject: formData.subject,
      difficulty: formData.difficulty,
      type: formData.type,
      chapter: formData.chapter || formData.subject,
      explanation: formData.explanation,
      examType: 'practice',
      marks: 2.5,
      negativeMark: 0.83,
    }

    if (formData.type === 'numerical') {
      data.correctAnswer = parseFloat(formData.numericalAnswer)
    } else {
      data.options = formData.options.filter(o => o.trim() !== '')
      data.correctAnswer = parseInt(formData.correctAnswer)
    }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion, data)
      } else {
        await addQuestion(data)
      }
      resetForm()
    } catch (error) {
      // Error handled in context
    }
  }

  const handleEdit = (q) => {
    setFormData({
      question: q.question || '',
      subject: q.subject || '',
      difficulty: q.difficulty || 'medium',
      type: q.type || 'mcq',
      chapter: q.chapter || '',
      options: q.options || ['', '', '', ''],
      correctAnswer: q.correctAnswer?.toString() || '',
      explanation: q.explanation || '',
      numericalAnswer: q.type === 'numerical' ? q.correctAnswer?.toString() : '',
    })
    setEditingQuestion(q.id)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteQuestion(deleteId)
    setDeleteId(null)
  }

  const updateOption = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaDatabase className="text-indigo-500" /> Question Manager
        </h2>
        <p className="text-gray-500 text-sm">Manage all questions • Total: {questions.length}</p>
      </div>

      {/* Add/Edit Form */}
      <Card
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        icon={FaPlus}
        action={
          !showForm && (
            <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <FaPlus /> New Question
            </button>
          )
        }
        className="mb-6"
      >
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                <select value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulty *</label>
                <select value={formData.difficulty} onChange={e => setFormData(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                  {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Type *</label>
                <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                  {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chapter / Topic</label>
                <input type="text" value={formData.chapter} onChange={e => setFormData(p => ({ ...p, chapter: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="Optional" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question *</label>
              <textarea value={formData.question} onChange={e => setFormData(p => ({ ...p, question: e.target.value }))} required rows={4} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-y" placeholder="Enter your question..." />
            </div>

            {formData.type === 'numerical' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numerical Answer *</label>
                <input type="number" step="any" value={formData.numericalAnswer} onChange={e => setFormData(p => ({ ...p, numericalAnswer: e.target.value }))} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none max-w-xs" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Options *</label>
                  <div className="space-y-2">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)} required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correct Answer *</label>
                  <select value={formData.correctAnswer} onChange={e => setFormData(p => ({ ...p, correctAnswer: e.target.value }))} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none max-w-xs">
                    <option value="">Select correct option</option>
                    {formData.options.map((_, i) => (
                      <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Explanation</label>
              <textarea value={formData.explanation} onChange={e => setFormData(p => ({ ...p, explanation: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-y" placeholder="Optional detailed explanation..." />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-2">
                <FaPlus /> {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* Questions List */}
      <Card title="All Questions" icon={FaDatabase}>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search questions..." className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
          </div>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none min-w-[180px]">
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {filteredQuestions.length === 0 ? (
          <EmptyState icon={FaInbox} title="No Questions Found" description="Try adjusting your filters or add new questions" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">#</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Question</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Difficulty</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuestions.slice(0, 50).map((q, i) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-[400px]">
                      <span className="line-clamp-2">{q.question}</span>
                      {q.imageUrl && <FaImage className="inline ml-2 text-blue-400 text-xs" />}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{getSubjectInfo(q.subject).name}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={q.difficulty === 'easy' ? 'success' : q.difficulty === 'hard' ? 'danger' : 'warning'}>
                        {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(q)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-200 transition-all" title="Edit">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => setDeleteId(q.id)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all" title="Delete">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredQuestions.length > 50 && (
              <p className="text-center text-sm text-gray-400 py-4">Showing first 50 of {filteredQuestions.length} questions</p>
            )}
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Question" icon={FaTrash}>
        <p className="text-gray-500 mb-5">Are you sure you want to permanently delete this question?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-600">
            <FaTrash /> Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
