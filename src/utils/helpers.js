export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

export const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

export const getPercentage = (value, total) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', label: 'Outstanding', color: '#10b981' }
  if (percentage >= 80) return { grade: 'A', label: 'Excellent', color: '#10b981' }
  if (percentage >= 70) return { grade: 'B+', label: 'Very Good', color: '#3b82f6' }
  if (percentage >= 60) return { grade: 'B', label: 'Good', color: '#3b82f6' }
  if (percentage >= 50) return { grade: 'C', label: 'Average', color: '#f59e0b' }
  if (percentage >= 40) return { grade: 'D', label: 'Below Average', color: '#f59e0b' }
  return { grade: 'F', label: 'Needs Improvement', color: '#ef4444' }
}

export const calculateNDAScore = (correct, incorrect, total) => {
  const marksPerCorrect = 2.5
  const negativeMark = 0.83
  const totalMarks = correct * marksPerCorrect - incorrect * negativeMark
  const maxMarks = total * marksPerCorrect
  return {
    obtained: Math.max(0, parseFloat(totalMarks.toFixed(2))),
    maximum: maxMarks,
    percentage: getPercentage(Math.max(0, totalMarks), maxMarks)
  }
}

export const truncate = (str, length = 50) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export const shuffleArray = (arr) => {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const sanitizeHTML = (str) => {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

export const parseJSON = (str) => {
  try {
    return { success: true, data: JSON.parse(str) }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

export const validateQuestion = (q) => {
  const errors = []
  if (!q.question || q.question.trim() === '') errors.push('Question text required')
  if (!q.subject) errors.push('Subject required')
  if (!q.options || q.options.length < 2) errors.push('At least 2 options required')
  if (q.correctAnswer === undefined || q.correctAnswer === null) errors.push('Correct answer required')
  if (!q.difficulty) errors.push('Difficulty required')
  return { valid: errors.length === 0, errors }
}

export const SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', icon: 'FaCalculator', color: '#6366f1' },
  { id: 'general_ability', name: 'General Ability Test', icon: 'FaBrain', color: '#06b6d4' },
  { id: 'general_science', name: 'General Science', icon: 'FaFlask', color: '#10b981' },
  { id: 'history', name: 'History', icon: 'FaLandmark', color: '#f59e0b' },
  { id: 'geography', name: 'Geography', icon: 'FaGlobeAsia', color: '#3b82f6' },
  { id: 'current_affairs', name: 'Current Affairs', icon: 'FaNewspaper', color: '#ef4444' },
  { id: 'english', name: 'English', icon: 'FaBook', color: '#8b5cf6' },
  { id: 'physics', name: 'Physics', icon: 'FaAtom', color: '#ec4899' },
  { id: 'chemistry', name: 'Chemistry', icon: 'FaVial', color: '#14b8a6' },
  { id: 'biology', name: 'Biology', icon: 'FaDna', color: '#84cc16' },
  { id: 'polity', name: 'Indian Polity', icon: 'FaBalanceScale', color: '#f97316' },
  { id: 'economics', name: 'Economics', icon: 'FaChartLine', color: '#0ea5e9' },
]

export const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: '#10b981' },
  { id: 'medium', name: 'Medium', color: '#f59e0b' },
  { id: 'hard', name: 'Hard', color: '#ef4444' },
]

export const QUESTION_TYPES = [
  { id: 'mcq', name: 'MCQ' },
  { id: 'numerical', name: 'Numerical' },
  { id: 'assertion_reason', name: 'Assertion & Reason' },
  { id: 'match_following', name: 'Match the Following' },
]

export const EXAM_TYPES = [
  { id: 'nda_1', name: 'NDA I' },
  { id: 'nda_2', name: 'NDA II' },
  { id: 'practice', name: 'Practice' },
  { id: 'mock', name: 'Mock Test' },
  { id: 'previous_year', name: 'Previous Year' },
  { id: 'topic_wise', name: 'Topic Wise' },
  { id: 'chapter_wise', name: 'Chapter Wise' },
]

export const getSubjectInfo = (id) => SUBJECTS.find(s => s.id === id) || { name: id, color: '#6366f1' }
