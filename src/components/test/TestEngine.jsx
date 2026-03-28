import { useState, useEffect, useCallback, useRef } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatTime, calculateNDAScore, getPercentage, QUESTION_TYPES } from '../../utils/helpers'
import { FaClock, FaTh, FaPaperPlane, FaChevronLeft, FaChevronRight, FaFlag, FaEraser } from 'react-icons/fa'

export default function TestEngine({ testConfig, onSubmit, onClose }) {
  const { saveTestResult, logActivity } = useData()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [marked, setMarked] = useState(new Set())
  const [visited, setVisited] = useState(new Set([0]))
  const [timeLeft, setTimeLeft] = useState((testConfig.timeLimit || 60) * 60)
  const [showNav, setShowNav] = useState(false)
  const timerRef = useRef(null)

  const questions = testConfig.questions || []
  const isReview = testConfig.reviewMode || false

  // Timer
  useEffect(() => {
    if (isReview) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [isReview])

  // Prevent accidental close
  useEffect(() => {
    if (isReview) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isReview])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'n') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'p') goPrev()
      if (e.key === 'm') toggleMark()
      if (e.key >= '1' && e.key <= '4' && !isReview) selectOption(parseInt(e.key) - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex])

  const q = questions[currentIndex]

  const selectOption = (idx) => {
    if (isReview) return
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }))
  }

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1
      setCurrentIndex(next)
      setVisited(prev => new Set(prev).add(next))
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const goTo = (idx) => {
    setCurrentIndex(idx)
    setVisited(prev => new Set(prev).add(idx))
    setShowNav(false)
  }

  const toggleMark = () => {
    if (isReview) return
    setMarked(prev => {
      const next = new Set(prev)
      next.has(currentIndex) ? next.delete(currentIndex) : next.add(currentIndex)
      return next
    })
  }

  const clearResponse = () => {
    if (isReview) return
    setAnswers(prev => { const n = { ...prev }; delete n[currentIndex]; return n })
  }

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current)

    let correct = 0, incorrect = 0, unattempted = 0
    const subjectWise = {}

    questions.forEach((q, i) => {
      const subj = q.subject || 'general'
      if (!subjectWise[subj]) subjectWise[subj] = { correct: 0, incorrect: 0, total: 0 }
      subjectWise[subj].total++

      if (answers[i] !== undefined) {
        const isCorrect = q.type === 'numerical'
          ? parseFloat(answers[i]) === parseFloat(q.correctAnswer)
          : answers[i] === q.correctAnswer
        if (isCorrect) { correct++; subjectWise[subj].correct++ }
        else { incorrect++; subjectWise[subj].incorrect++ }
      } else { unattempted++ }
    })

    const score = calculateNDAScore(correct, incorrect, questions.length)
    const accuracy = (correct + incorrect) > 0 ? getPercentage(correct, correct + incorrect) : 0
    const timeTaken = (testConfig.timeLimit || 60) * 60 - timeLeft

    const result = {
      total: questions.length, attempted: correct + incorrect,
      correct, incorrect, unattempted, accuracy, ...score, subjectWise,
      testConfig: { title: testConfig.title, subject: testConfig.subject, timeLimit: testConfig.timeLimit, questionCount: questions.length },
      answers, timeTaken,
    }

    try {
      await saveTestResult({ ...result, questions: questions.map(q => q.id) })
      await logActivity('test_completed', `Test completed: ${testConfig.title} - Score: ${score.percentage}%`)
    } catch (e) { console.error('Save error:', e) }

    onSubmit(result)
  }, [answers, questions, timeLeft, testConfig])

  const confirmSubmit = () => {
    const answered = Object.keys(answers).length
    const unanswered = questions.length - answered
    if (window.confirm(`Submit test?\n\nAnswered: ${answered}\nUnanswered: ${unanswered}\n\n${unanswered > 0 ? '⚠️ You have unanswered questions!' : ''}`)) {
      handleSubmit()
    }
  }

  if (!q) return null

  const timerClass = timeLeft <= 60 ? 'bg-red-500 animate-pulse' : timeLeft <= 300 ? 'bg-amber-500' : 'bg-gray-900'
  const typeName = QUESTION_TYPES.find(t => t.id === q.type)?.name || 'MCQ'

  const getNavBtnClass = (i) => {
    let cls = 'w-full aspect-square rounded-lg text-sm font-semibold transition-all border '
    if (i === currentIndex) cls += 'border-indigo-500 text-indigo-600 border-2 '
    else if (answers[i] !== undefined) cls += 'bg-emerald-500 text-white border-emerald-500 '
    else if (marked.has(i)) cls += 'bg-amber-500 text-white border-amber-500 '
    else if (visited.has(i)) cls += 'bg-red-500 text-white border-red-500 '
    else cls += 'bg-white text-gray-600 border-gray-300 '
    return cls
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-[10000] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gray-200 gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm md:text-base font-bold text-gray-900 truncate">{testConfig.title || 'Test'}</h3>
        </div>
        <div className={`flex items-center gap-2 px-3 md:px-4 py-2 ${timerClass} text-white rounded-lg font-mono text-base md:text-lg font-semibold`}>
          <FaClock className="text-sm" />
          {isReview ? 'REVIEW' : formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNav(!showNav)} className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
            <FaTh />
          </button>
          {!isReview && (
            <button onClick={confirmSubmit} className="px-3 md:px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition-all">
              <FaPaperPlane /> Submit
            </button>
          )}
          {isReview && (
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col">
          {/* Question header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <span className="text-lg font-bold text-indigo-600">Q.{currentIndex + 1}</span>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-semibold">{typeName}</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-semibold">+{q.marks || 2.5} / -{q.negativeMark || 0.83}</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : q.difficulty === 'hard' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
              </span>
            </div>
          </div>

          {/* Question text */}
          <div className="text-base leading-7 text-gray-800 mb-5 whitespace-pre-wrap">{q.question}</div>

          {/* Image */}
          {q.imageUrl && <img src={q.imageUrl} alt="Question" className="max-w-full max-h-72 object-contain rounded-xl border border-gray-200 mb-5" />}

          {/* Options */}
          {q.type === 'numerical' ? (
            <div className="max-w-xs mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Enter your answer:</label>
              <input
                type="number" step="any" disabled={isReview}
                value={answers[currentIndex] ?? ''}
                onChange={e => setAnswers(prev => ({ ...prev, [currentIndex]: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:border-indigo-500 outline-none disabled:bg-gray-100"
                placeholder="Type answer..."
              />
              {isReview && (
                <div className="mt-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${String(answers[currentIndex]) === String(q.correctAnswer) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Your: {answers[currentIndex] ?? 'N/A'}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                    Correct: {q.correctAnswer}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {(q.options || []).map((opt, i) => {
                const isSelected = answers[currentIndex] === i
                let cls = 'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all '
                if (isReview) {
                  if (i === q.correctAnswer) cls += 'border-emerald-500 bg-emerald-50 '
                  else if (isSelected && i !== q.correctAnswer) cls += 'border-red-500 bg-red-50 '
                  else cls += 'border-gray-200 '
                  cls += 'cursor-default '
                } else {
                  cls += isSelected ? 'border-indigo-500 bg-indigo-50 ' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 '
                }

                return (
                  <div key={i} className={cls} onClick={() => selectOption(i)}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-gray-800 flex-1 leading-relaxed">
                      {typeof opt === 'object' ? opt.text : opt}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Explanation in review */}
          {isReview && q.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
              <h4 className="text-sm font-semibold text-blue-600 mb-2">💡 Explanation</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* Footer navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto flex-wrap gap-2">
            <button onClick={goPrev} disabled={currentIndex === 0} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 disabled:opacity-40 transition-all">
              <FaChevronLeft /> Previous
            </button>

            <div className="flex gap-2">
              {!isReview && (
                <>
                  <button onClick={toggleMark} className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${marked.has(currentIndex) ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                    <FaFlag /> {marked.has(currentIndex) ? 'Marked' : 'Mark'}
                  </button>
                  <button onClick={clearResponse} className="px-3 py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-100 transition-all">
                    <FaEraser /> Clear
                  </button>
                </>
              )}
            </div>

            <button onClick={goNext} disabled={currentIndex === questions.length - 1} className="px-4 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-600 disabled:opacity-40 transition-all">
              Next <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Navigator */}
        <div className={`w-[260px] bg-white border-l border-gray-200 p-5 overflow-y-auto flex-shrink-0 transition-all
          ${showNav ? 'fixed right-0 top-[57px] bottom-0 z-50 shadow-2xl md:relative md:top-0 md:shadow-none' : 'hidden md:block'}
        `}>
          <h4 className="text-sm font-bold text-gray-800 mb-4">Question Navigator</h4>

          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { cls: 'bg-emerald-500', label: 'Answered' },
              { cls: 'bg-red-500', label: 'Not Answered' },
              { cls: 'bg-amber-500', label: 'Marked' },
              { cls: 'bg-gray-300', label: 'Not Visited' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className={`w-3 h-3 rounded ${l.cls}`} /> {l.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={getNavBtnClass(i)}>
                {i + 1}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 space-y-1 border-t border-gray-200 pt-3">
            <p><strong>Answered:</strong> {Object.keys(answers).length} / {questions.length}</p>
            <p><strong>Marked:</strong> {marked.size}</p>
            <p><strong>Not Visited:</strong> {questions.length - visited.size}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
