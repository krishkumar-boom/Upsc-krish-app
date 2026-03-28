import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useData } from '../../../contexts/DataContext'
import { collection, getDocs } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import WelcomeBanner from '../../common/WelcomeBanner'
import StatCard from '../../common/StatCard'
import Card from '../../common/Card'
import CountdownTimer from '../../common/CountdownTimer'
import { BarChart } from '../../common/ChartWrapper'
import { formatDate, getSubjectInfo } from '../../../utils/helpers'
import {
  FaDatabase, FaUsers, FaRobot, FaShieldAlt, FaSmile, FaMeh,
  FaFrown, FaChartBar, FaHistory, FaBolt, FaMagic, FaPlus,
  FaCode, FaUpload, FaBell, FaBug
} from 'react-icons/fa'

export default function AdminDashboard({ onNavigate }) {
  const { currentUser } = useAuth()
  const { getStats, getLogs } = useData()
  const [usersCount, setUsersCount] = useState(0)
  const [testsCount, setTestsCount] = useState(0)
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const stats = getStats()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [usersSnap, testsSnap, logs] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.USERS)),
        getDocs(collection(db, COLLECTIONS.TEST_RESULTS)),
        getLogs(10),
      ])
      setUsersCount(usersSnap.size)
      setTestsCount(testsSnap.size)
      setRecentLogs(logs)
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const subjectLabels = Object.keys(stats.bySubject).map(s => getSubjectInfo(s).name)
  const subjectValues = Object.values(stats.bySubject)
  const subjectColors = Object.keys(stats.bySubject).map(s => getSubjectInfo(s).color)

  const logIconMap = {
    admin_login: '🛡️', student_login: '👤', question_added: '➕', question_deleted: '🗑️',
    test_completed: '✅', bulk_upload: '📤', ai_generation: '🤖', bug_scan: '🐛',
    announcement_sent: '📢', logout: '🚪', default: 'ℹ️'
  }

  const quickActions = [
    { label: 'AI Generate', icon: FaMagic, color: 'from-indigo-500 to-indigo-600', section: 'aiGenerator' },
    { label: 'Add Question', icon: FaPlus, color: 'from-indigo-500 to-indigo-600', section: 'questionManager' },
    { label: 'JSON Upload', icon: FaCode, color: 'from-cyan-500 to-cyan-600', section: 'jsonPaste' },
    { label: 'Bulk Upload', icon: FaUpload, color: 'from-violet-500 to-violet-600', section: 'bulkUpload' },
    { label: 'Announce', icon: FaBell, color: 'from-emerald-500 to-emerald-600', section: 'notifications' },
    { label: 'Bug Fixer', icon: FaBug, color: 'from-amber-500 to-amber-600', section: 'aiBugFixer' },
  ]

  return (
    <div>
      <WelcomeBanner
        name={`Welcome back, ${currentUser?.displayName?.split(' ')[0] || 'Admin'}! 👑`}
        subtitle="You have full control over the NDA Test Platform. Manage questions, monitor students, and optimize the system."
        stats={[
          { value: stats.total, label: 'Questions' },
          { value: usersCount, label: 'Users' },
          { value: testsCount, label: 'Tests Taken' },
        ]}
      />

      {/* Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fadeIn">
        <StatCard icon={FaDatabase} value={stats.total} label="Total Questions" colorClass="purple" />
        <StatCard icon={FaUsers} value={usersCount} label="Registered Users" colorClass="green" />
        <StatCard icon={FaRobot} value="Active" label="AI Systems" colorClass="blue" />
        <StatCard icon={FaShieldAlt} value="Online" label="Platform Status" colorClass="cyan" />
      </div>

      {/* Difficulty stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
        <StatCard icon={FaSmile} value={stats.byDifficulty.easy} label="Easy Questions" colorClass="green" borderColor="#10b981" />
        <StatCard icon={FaMeh} value={stats.byDifficulty.medium} label="Medium Questions" colorClass="orange" borderColor="#f59e0b" />
        <StatCard icon={FaFrown} value={stats.byDifficulty.hard} label="Hard Questions" colorClass="red" borderColor="#ef4444" />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card title="Questions by Subject" icon={FaChartBar}>
          {subjectLabels.length > 0 ? (
            <BarChart
              labels={subjectLabels}
              datasets={[{
                label: 'Questions',
                data: subjectValues,
                backgroundColor: subjectColors.map(c => c + '40'),
                borderColor: subjectColors,
                borderWidth: 2,
                borderRadius: 8,
              }]}
            />
          ) : (
            <p className="text-gray-400 text-center py-10">No data available</p>
          )}
        </Card>

        <Card
          title="Recent Activity"
          icon={FaHistory}
          action={
            <button onClick={() => onNavigate('logs')} className="text-xs text-indigo-500 font-semibold hover:underline">
              View All →
            </button>
          }
        >
          <div className="max-h-[350px] overflow-y-auto space-y-1">
            {recentLogs.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No activity yet</p>
            ) : (
              recentLogs.map(log => (
                <div key={log.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                  <span className="text-lg">{logIconMap[log.type] || logIconMap.default}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{log.message}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(log.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card title="Quick Actions" icon={FaBolt} className="mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => onNavigate(action.section)}
                className={`bg-gradient-to-r ${action.color} text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all`}
              >
                <Icon /> {action.label}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Countdown */}
      <div className="mt-6">
        <CountdownTimer />
      </div>
    </div>
  )
}
