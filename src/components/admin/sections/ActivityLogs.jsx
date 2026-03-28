import { useState, useEffect } from 'react'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import EmptyState from '../../common/EmptyState'
import { formatDate } from '../../../utils/helpers'
import { FaHistory, FaStream } from 'react-icons/fa'

const logIcons = {
  admin_login: '🛡️', student_login: '👤', question_added: '➕', question_updated: '✏️',
  question_deleted: '🗑️', test_started: '▶️', test_completed: '✅', bulk_upload: '📤',
  ai_generation: '🤖', bug_scan: '🐛', api_key_updated: '🔑', announcement_sent: '📢', logout: '🚪'
}

export default function ActivityLogs() {
  const { getLogs } = useData()
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    const data = await getLogs(100)
    setLogs(data)
    setLoading(false)
  }

  const filtered = filter ? logs.filter(l => l.type === filter) : logs
  const types = [...new Set(logs.map(l => l.type))].sort()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaHistory className="text-indigo-500" /> Activity Logs
        </h2>
        <p className="text-gray-500 text-sm">Complete system activity history</p>
      </div>

      <Card
        title={`All Activity (${filtered.length})`}
        icon={FaStream}
        action={
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-w-[180px]">
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={FaHistory} title="No Logs Found" />
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-1">
            {filtered.map(log => (
              <div key={log.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                <span className="text-lg flex-shrink-0">{logIcons[log.type] || 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{log.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-semibold">
                      {log.type}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {log.userName || 'System'} • {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
