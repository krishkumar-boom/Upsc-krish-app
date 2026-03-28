import { useState, useEffect } from 'react'
import { useData } from '../../../contexts/DataContext'
import { deleteDoc, doc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import EmptyState from '../../common/EmptyState'
import { formatDate } from '../../../utils/helpers'
import { FaBell, FaPaperPlane, FaTrash, FaHistory, FaBellSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Notifications() {
  const { getAnnouncements, sendAnnouncement } = useData()
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState({ type: 'general', title: '', message: '', priority: 'normal', active: true })
  const [sending, setSending] = useState(false)

  useEffect(() => { loadAnnouncements() }, [])

  const loadAnnouncements = async () => {
    const data = await getAnnouncements()
    setAnnouncements(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required')
      return
    }

    setSending(true)
    try {
      await sendAnnouncement({ ...form, active: form.active })
      setForm({ type: 'general', title: '', message: '', priority: 'normal', active: true })
      await loadAnnouncements()
    } catch (error) {
      // handled in context
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id))
      toast.success('Announcement deleted')
      await loadAnnouncements()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaBell className="text-indigo-500" /> Notifications Manager
        </h2>
        <p className="text-gray-500 text-sm">Send announcements to all students</p>
      </div>

      <Card title="Send New Announcement" icon={FaPaperPlane} className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option value="general">General</option>
                <option value="test_reminder">Test Reminder</option>
                <option value="exam_update">Exam Update</option>
                <option value="platform">Platform</option>
                <option value="important">Important Notice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Announcement title" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={5} placeholder="Your announcement..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y" />
          </div>
          <button type="submit" disabled={sending} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all">
            <FaPaperPlane /> {sending ? 'Sending...' : 'Send Announcement'}
          </button>
        </form>
      </Card>

      <Card title="Previous Announcements" icon={FaHistory}>
        {announcements.length === 0 ? (
          <EmptyState icon={FaBellSlash} title="No Announcements Yet" />
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className={`p-4 bg-gray-50 rounded-xl border-l-4 ${a.priority === 'urgent' ? 'border-red-500' : a.priority === 'high' ? 'border-amber-500' : 'border-indigo-500'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{a.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{a.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={a.active ? 'success' : 'danger'}>{a.active ? 'Active' : 'Inactive'}</Badge>
                      <Badge variant="info">{a.type}</Badge>
                      <span className="text-[11px] text-gray-400">{formatDate(a.createdAt)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
