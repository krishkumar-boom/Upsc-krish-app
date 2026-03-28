import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import { formatDate } from '../../../utils/helpers'
import { FaUserLock, FaUsersCog, FaSearch, FaBan, FaUnlock } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AccessControl() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try {
      const q = query(collection(db, COLLECTIONS.USERS), orderBy('lastLogin', 'desc'))
      const snap = await getDocs(q)
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (error) {
      console.error('Load users error:', error)
    }
  }

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), { blocked: !isBlocked })
      toast.success(isBlocked ? 'User unblocked' : 'User blocked')
      await loadUsers()
    } catch {
      toast.error('Failed to update user')
    }
  }

  const filtered = users.filter(u => {
    const s = search.toLowerCase()
    return !s || u.displayName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaUserLock className="text-indigo-500" /> Access Control
        </h2>
        <p className="text-gray-500 text-sm">Manage user permissions and restrictions</p>
      </div>

      <Card
        title={`All Users (${users.length})`}
        icon={FaUsersCog}
        action={
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 w-[200px]" />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">User</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Role</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Tests</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Accuracy</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Last Login</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}`} className="w-8 h-8 rounded-full" alt="" />
                      <span className="text-sm font-medium">{u.displayName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'admin' ? 'warning' : 'primary'}>
                      {u.role === 'admin' ? '👑 Admin' : '📚 Student'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{u.testsAttempted || 0}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: (u.averageAccuracy || 0) >= 60 ? '#10b981' : '#ef4444' }}>
                    {u.averageAccuracy || 0}%
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.lastLogin)}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' ? (
                      <button
                        onClick={() => toggleBlock(u.id, u.blocked)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${u.blocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}
                        title={u.blocked ? 'Unblock' : 'Block'}
                      >
                        {u.blocked ? <FaUnlock /> : <FaBan />}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
