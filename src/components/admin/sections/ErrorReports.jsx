import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import EmptyState from '../../common/EmptyState'
import { formatDate } from '../../../utils/helpers'
import { FaFlag, FaCheckCircle, FaEye, FaCheck, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function ErrorReports() {
  const [reports, setReports] = useState([])

  useEffect(() => { loadReports() }, [])

  const loadReports = async () => {
    try {
      const q = query(collection(db, COLLECTIONS.BUG_REPORTS), orderBy('createdAt', 'desc'), limit(100))
      const snap = await getDocs(q)
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (error) {
      console.error('Load reports error:', error)
    }
  }

  const resolveReport = async (id) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.BUG_REPORTS, id), { status: 'resolved' })
      toast.success('Report resolved')
      await loadReports()
    } catch { toast.error('Failed to resolve') }
  }

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try {
      await deleteDoc(doc(db, COLLECTIONS.BUG_REPORTS, id))
      toast.success('Report deleted')
      await loadReports()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaFlag className="text-indigo-500" /> Error Reports
        </h2>
        <p className="text-gray-500 text-sm">{reports.length} reports from students</p>
      </div>

      <Card>
        {reports.length === 0 ? (
          <EmptyState icon={FaCheckCircle} title="No Error Reports" description="All questions are working correctly!" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Issue</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Description</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Reporter</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><Badge variant={r.issueType === 'wrong_answer' ? 'danger' : 'warning'}>{r.issueType || 'general'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[250px] truncate">{r.description || 'No description'}</td>
                    <td className="px-4 py-3 text-sm">{r.reporterName || 'Unknown'}</td>
                    <td className="px-4 py-3"><Badge variant={r.status === 'resolved' ? 'success' : 'danger'}>{r.status || 'open'}</Badge></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => resolveReport(r.id)} className="w-7 h-7 rounded flex items-center justify-center text-emerald-500 hover:bg-emerald-50" title="Resolve"><FaCheck className="text-xs" /></button>
                        <button onClick={() => deleteReport(r.id)} className="w-7 h-7 rounded flex items-center justify-center text-red-500 hover:bg-red-50" title="Delete"><FaTrash className="text-xs" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
