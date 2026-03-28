import { useMemo } from 'react'
import { formatTime, getGrade, getPercentage, getSubjectInfo } from '../../utils/helpers'
import ProgressBar from '../common/ProgressBar'
import Confetti from '../common/Confetti'
import { FaTrophy, FaMedal, FaStarHalfAlt, FaExclamationTriangle, FaEye, FaHome } from 'react-icons/fa'

export default function ResultOverlay({ result, onClose, onReview }) {
  const grade = useMemo(() => getGrade(result.percentage), [result.percentage])
  const showConfetti = result.percentage >= 80

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (result.percentage / 100) * circumference

  const iconMap = {
    Outstanding: FaTrophy, Excellent: FaTrophy, 'Very Good': FaMedal,
    Good: FaMedal, Average: FaStarHalfAlt, 'Below Average': FaExclamationTriangle,
    'Needs Improvement': FaExclamationTriangle,
  }
  const ResultIcon = iconMap[grade.label] || FaTrophy
  const iconBg = result.percentage >= 60 ? 'bg-emerald-50 text-emerald-500' : result.percentage >= 40 ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'

  return (
    <>
      <Confetti show={showConfetti} />
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[10001] flex items-center justify-center p-5 overflow-y-auto">
        <div className="bg-white rounded-3xl p-6 md:p-10 max-w-[600px] w-full text-center animate-slideUp max-h-[90vh] overflow-y-auto">
          {/* Icon */}
          <div className={`w-[70px] h-[70px] rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
            <ResultIcon className="text-3xl" />
          </div>

          <h2 className="text-2xl font-bold mb-1">{grade.label}!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Grade: {grade.grade} | {result.testConfig?.title}
          </p>

          {/* Score circle */}
          <div className="relative w-[140px] h-[140px] mx-auto mb-6">
            <svg viewBox="0 0 120 120" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={grade.color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold" style={{ color: grade.color }}>{result.percentage}%</span>
              <span className="text-xs text-gray-400">Score</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-left">
            {[
              { label: 'Score', value: `${result.obtained} / ${result.maximum}` },
              { label: 'Accuracy', value: `${result.accuracy}%`, color: result.accuracy >= 70 ? '#10b981' : result.accuracy >= 40 ? '#f59e0b' : '#ef4444' },
              { label: 'Correct', value: `${result.correct} / ${result.total}`, color: '#10b981' },
              { label: 'Incorrect', value: result.incorrect, color: '#ef4444' },
              { label: 'Unattempted', value: result.unattempted },
              { label: 'Time Taken', value: formatTime(result.timeTaken || 0) },
            ].map(stat => (
              <div key={stat.label} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-[11px] text-gray-400 mb-1">{stat.label}</div>
                <div className="text-lg font-bold" style={{ color: stat.color || '#0f172a' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Subject-wise */}
          {result.subjectWise && Object.keys(result.subjectWise).length > 0 && (
            <div className="text-left mb-6">
              <h4 className="text-sm font-semibold mb-3">Subject-wise Performance</h4>
              {Object.entries(result.subjectWise).map(([subj, data]) => {
                const info = getSubjectInfo(subj)
                const pct = getPercentage(data.correct, data.total)
                return (
                  <div key={subj} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{info.name}</span>
                      <span className="text-sm font-semibold">{data.correct}/{data.total} ({pct}%)</span>
                    </div>
                    <ProgressBar value={data.correct} max={data.total} color={pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'} height={6} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={onReview} className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
              <FaEye /> Review Answers
            </button>
            <button onClick={onClose} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-200 transition-all">
              <FaHome /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
