import { useState } from 'react'
import Sidebar from '../common/Sidebar'
import AdminDashboard from './sections/AdminDashboard'
import QuestionManager from './sections/QuestionManager'
import BulkUpload from './sections/BulkUpload'
import JSONPasteBox from './sections/JSONPasteBox'
import AIConfig from './sections/AIConfig'
import AIGenerator from './sections/AIGenerator'
import BugFixer from './sections/BugFixer'
import AdminAnalytics from './sections/AdminAnalytics'
import Notifications from './sections/Notifications'
import ActivityLogs from './sections/ActivityLogs'
import UICustomizer from './sections/UICustomizer'
import AccessControl from './sections/AccessControl'
import DatabaseStatus from './sections/DatabaseStatus'
import ErrorReports from './sections/ErrorReports'

export default function AdminPanel({ onStartTest }) {
  const [activeSection, setActiveSection] = useState('dashboard')

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard onNavigate={setActiveSection} />
      case 'questionManager': return <QuestionManager />
      case 'bulkUpload': return <BulkUpload />
      case 'jsonPaste': return <JSONPasteBox />
      case 'aiConfig': return <AIConfig />
      case 'aiGenerator': return <AIGenerator />
      case 'aiBugFixer': return <BugFixer />
      case 'analytics': return <AdminAnalytics />
      case 'notifications': return <Notifications />
      case 'logs': return <ActivityLogs />
      case 'uiCustomizer': return <UICustomizer />
      case 'accessControl': return <AccessControl />
      case 'dbStatus': return <DatabaseStatus />
      case 'errorReports': return <ErrorReports />
      default: return <AdminDashboard onNavigate={setActiveSection} />
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        type="admin"
      />
      <main className="md:ml-[280px] w-full md:w-[calc(100%-280px)] p-4 md:p-6 min-h-screen transition-all pb-8">
        {renderSection()}
        <div className="text-center py-6 text-gray-400 text-xs font-medium tracking-wider">
          Developer: KRISH MADDHESHIYA
        </div>
      </main>
    </div>
  )
}
