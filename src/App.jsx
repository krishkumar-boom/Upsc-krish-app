import { useState, useEffect, Component } from 'react'
import { useAuth } from './contexts/AuthContext.jsx'
import Preloader from './components/common/Preloader.jsx'
import LoginScreen from './components/auth/LoginScreen.jsx'
import AdminPanel from './components/admin/AdminPanel.jsx'
import StudentPanel from './components/student/StudentPanel.jsx'
import TestEngine from './components/test/TestEngine.jsx'
import ResultOverlay from './components/test/ResultOverlay.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong.</h2>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#6366f1', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppInner() {
  const { currentUser, isAdmin, loading } = useAuth()
  const [showPreloader, setShowPreloader] = useState(true)
  const [activeTest, setActiveTest] = useState(null)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowPreloader(false), 2000)
    const fallback = setTimeout(() => setShowPreloader(false), 5000)
    return () => { clearTimeout(timer); clearTimeout(fallback) }
  }, [])

  if (showPreloader || loading) {
    return <Preloader />
  }

  if (!currentUser) {
    return <LoginScreen />
  }

  if (activeTest) {
    return (
      <TestEngine
        testConfig={activeTest}
        onSubmit={(result) => {
          setTestResult(result)
          setActiveTest(null)
        }}
        onClose={() => setActiveTest(null)}
      />
    )
  }

  if (testResult) {
    return (
      <ResultOverlay
        result={testResult}
        onClose={() => setTestResult(null)}
        onReview={() => {
          setActiveTest({ ...testResult?.testConfig, reviewMode: true, answers: testResult?.answers })
          setTestResult(null)
        }}
      />
    )
  }

  if (isAdmin) {
    return <AdminPanel onStartTest={(config) => setActiveTest(config)} />
  }

  return <StudentPanel onStartTest={(config) => setActiveTest(config)} />
}

export default function App() {
  return <ErrorBoundary><AppInner /></ErrorBoundary>
}
