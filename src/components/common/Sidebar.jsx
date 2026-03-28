import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  FaShieldAlt, FaGraduationCap, FaBars, FaTachometerAlt, FaDatabase,
  FaUpload, FaCode, FaRobot, FaMagic, FaBug, FaChartBar, FaBell,
  FaHistory, FaPalette, FaUserLock, FaServer, FaSignOutAlt, FaHome,
  FaFileAlt, FaTools, FaChartPie, FaTrophy, FaCalendarDay, FaBrain,
  FaBookmark, FaAward, FaBullhorn, FaCog, FaChartLine, FaFlag, FaCrown, FaStar,
  FaFileInvoice, FaTimes
} from 'react-icons/fa'

const adminMenuItems = [
  { label: 'Main', type: 'label' },
  { id: 'dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { label: 'Questions', type: 'label' },
  { id: 'questionManager', icon: FaDatabase, label: 'Question Manager' },
  { id: 'bulkUpload', icon: FaUpload, label: 'Bulk Upload' },
  { id: 'jsonPaste', icon: FaCode, label: 'JSON Paste Box' },
  { label: 'AI Systems', type: 'label' },
  { id: 'aiConfig', icon: FaRobot, label: 'AI Configuration' },
  { id: 'aiGenerator', icon: FaMagic, label: 'AI Generator' },
  { id: 'aiBugFixer', icon: FaBug, label: 'Bug Fixer AI' },
  { label: 'Management', type: 'label' },
  { id: 'analytics', icon: FaChartBar, label: 'Analytics' },
  { id: 'notifications', icon: FaBell, label: 'Notifications' },
  { id: 'logs', icon: FaHistory, label: 'Activity Logs' },
  { id: 'errorReports', icon: FaFlag, label: 'Error Reports' },
  { id: 'uiCustomizer', icon: FaPalette, label: 'UI Customizer' },
  { id: 'accessControl', icon: FaUserLock, label: 'Access Control' },
  { label: 'System', type: 'label' },
  { id: 'dbStatus', icon: FaServer, label: 'Database Status' },
]

const studentMenuItems = [
  { label: 'Main', type: 'label' },
  { id: 'dashboard', icon: FaHome, label: 'Dashboard' },
  { label: 'Tests', type: 'label' },
  { id: 'availableTests', icon: FaFileAlt, label: 'Available Tests' },
  { id: 'customTest', icon: FaTools, label: 'Custom Test Builder' },
  { id: 'dailyQuiz', icon: FaCalendarDay, label: 'Daily Quiz' },
  { id: 'challenges', icon: FaTrophy, label: 'Challenges' },
  { id: 'smartPractice', icon: FaBrain, label: 'Smart Practice' },
  { label: 'Analysis', type: 'label' },
  { id: 'profileAnalysis', icon: FaChartPie, label: 'Profile Analysis' },
  { id: 'performance', icon: FaChartLine, label: 'Performance' },
  { id: 'testHistory', icon: FaHistory, label: 'Test History' },
  { id: 'reportCard', icon: FaFileInvoice, label: 'Report Card' },
  { id: 'achievements', icon: FaAward, label: 'Achievements' },
  { label: 'Library', type: 'label' },
  { id: 'bookmarks', icon: FaBookmark, label: 'Bookmarks' },
  { label: 'Other', type: 'label' },
  { id: 'announcements', icon: FaBullhorn, label: 'Announcements' },
  { id: 'settings', icon: FaCog, label: 'Settings' },
]

export default function Sidebar({ activeSection, onSectionChange, type = 'admin' }) {
  const { currentUser, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = type === 'admin' ? adminMenuItems : studentMenuItems
  const isAdminPanel = type === 'admin'

  const handleSectionClick = (id) => {
    onSectionChange(id)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    setMobileOpen(false)
    logout()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[999] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[998] md:hidden w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all"
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-[1000] flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 no-print
          ${collapsed ? 'w-[70px]' : 'w-[280px]'}
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 min-h-[64px]">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center w-full' : ''}`}>
            {isAdminPanel ? (
              <FaShieldAlt className="text-2xl text-indigo-500 flex-shrink-0" />
            ) : (
              <FaGraduationCap className="text-2xl text-indigo-500 flex-shrink-0" />
            )}
            {!collapsed && (
              <span className="text-base font-bold text-gray-900 whitespace-nowrap">
                {isAdminPanel ? 'Admin Panel' : 'NDA Platform'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 md:hidden"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-9 h-9 rounded-lg bg-gray-100 items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
            >
              <FaBars className="text-sm" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b border-gray-200 ${collapsed ? 'justify-center px-2' : ''}`}>
          <img
            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'U')}&background=6366f1&color=fff`}
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-indigo-100 flex-shrink-0 object-cover"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                {currentUser?.displayName || 'User'}
              </h4>
              {isAdminPanel ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500">
                  <FaCrown className="text-[9px]" /> God Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-500">
                  <FaStar className="text-[9px]" /> Student
                </span>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <ul className="flex-1 p-3 space-y-0.5">
          {menuItems.map((item, idx) => {
            if (item.type === 'label') {
              if (collapsed) return null
              return (
                <li key={`label-${idx}`} className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
                  {item.label}
                </li>
              )
            }

            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleSectionClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium
                    ${collapsed ? 'justify-center px-2' : ''}
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }
                  `}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className={`text-base flex-shrink-0 ${isActive ? 'text-indigo-600' : ''} ${collapsed ? 'text-lg' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            )
          })}

          {/* Logout */}
          <li className="mt-2">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium text-red-500 hover:bg-red-50
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              <FaSignOutAlt className={`flex-shrink-0 ${collapsed ? 'text-lg' : ''}`} />
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile bottom nav for students */}
      {!isAdminPanel && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-[997] md:hidden no-print"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        >
          {[
            { id: 'dashboard', icon: FaHome, label: 'Home' },
            { id: 'availableTests', icon: FaFileAlt, label: 'Tests' },
            { id: 'customTest', icon: FaTools, label: 'Create' },
            { id: 'profileAnalysis', icon: FaChartPie, label: 'Analysis' },
            { id: 'settings', icon: FaCog, label: 'More' },
          ].map(item => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold transition-all
                  ${isActive ? 'text-indigo-600' : 'text-gray-400'}
                `}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
