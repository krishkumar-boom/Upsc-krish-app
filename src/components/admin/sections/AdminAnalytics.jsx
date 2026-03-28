import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import StatCard from '../../common/StatCard'
import { LineChart, DoughnutChart } from '../../common/ChartWrapper'
import Badge from '../../common/Badge'
import { formatDate, getSubjectInfo } from '../../../utils/helpers'
import { FaChartBar, FaFileAlt, FaBullseye, FaDatabase, FaUsers, FaChartLine, FaChartPie, FaTable } from 'react-icons/fa'

export default function AdminAnalytics() {
  const { getStats } = useData()
  const [results, setResults] = useState([])
  const [studentsCount, setStudentsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const stats = getStats()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const [resultsSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.TEST_RESULTS), orderBy('completedAt', 'desc'), limit(200))),
        getDocs(query(collection(db, COLLECTIONS.USERS), where('role', '==', 'student'))),
      ])
      setResults(resultsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setStudentsCount(usersSnap.size)
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  const avgAccuracy = results.length > 0
    ? Math.round(results.reduce((s, r) => s + (r.result?.accuracy || 0), 0) / results.length)
    : 0

  const trendData = results.slice(0, 20).reverse()
  const trendLabels = trendData.map(r => formatDate(r.completedAt)?.split(',')[0] || 'N/A')

  const subjLabels = Object.keys(stats.bySubject).map(s => getSubjectInfo(s).name)
  const subjValues = Object.values(stats.bySubject)
  const subjColors = Object.keys(stats.bySubject).map(s => getSubjectInfo(s).color)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaChartBar className="text-indigo-500" /> Platform Analytics
        </h2>
        <p className="text-gray-500 text-sm">Comprehensive analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={FaFileAlt} value={results.length} label="Tests Taken" colorClass="purple" />
        <StatCard icon={FaBullseye} value={`${avgAccuracy}%`} label="Avg Accuracy" colorClass="green" />
        <StatCard icon={FaDatabase} value={stats.total} label="Questions" colorClass="blue" />
        <StatCard icon={FaUsers} value={studentsCount} label="Active Students" colorClass="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Performance Trend" icon={FaChartLine}>
          {trendData.length > 0 ? (
            <LineChart
              labels={trendLabels}
              datasets={[
                {
                  label: 'Score %', data: trendData.map(r => r.result?.percentage || 0),
                  borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 4
                },
                {
                  label: 'Accuracy %', data: trendData.map(r => r.result?.accuracy || 0),
                  borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)', fill: true, tension: 0.4, pointRadius: 4
                }
              ]}
            />
          ) : <p className="text-gray-400 text-center py-10">No test data yet</p>}
        </Card>

        <Card title="Questions Distribution" icon={FaChartPie}>
          {subjLabels.length > 0 ? (
            <DoughnutChart labels={subjLabels} data={subjValues} colors={subjColors} />
          ) : <p className="text-gray-400 text-center py-10">No data</p>}
        </Card>
      </div>

      <Card title="Recent Test Results" icon={FaTable}>
        {results.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No test results yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Student</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Test</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Score</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Accuracy</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.slice(0, 20).map(r => {
                  const pct = r.result?.percentage || 0
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{r.userName || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.testConfig?.title || 'Practice'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={pct >= 60 ? 'success' : pct >= 40 ? 'warning' : 'danger'}>{pct}%</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{r.result?.accuracy || 0}%</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(r.completedAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
