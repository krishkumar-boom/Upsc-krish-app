import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyADoTbCK2P89sMnYXQnK2PTc_xWoEGU10Y",
  authDomain: "upsc-nda-with-krish.firebaseapp.com",
  projectId: "upsc-nda-with-krish",
  storageBucket: "upsc-nda-with-krish.firebasestorage.app",
  messagingSenderId: "911065701054",
  appId: "1:911065701054:web:a852abac9d841555cbdcef",
  measurementId: "G-S58365R3HT"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Use new persistent cache API (replaces deprecated enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })

export const COLLECTIONS = {
  USERS: 'users',
  QUESTIONS: 'questions',
  TEST_RESULTS: 'test_results',
  ANNOUNCEMENTS: 'announcements',
  LOGS: 'activity_logs',
  SETTINGS: 'platform_settings',
  AI_CONFIG: 'ai_config',
  BUG_REPORTS: 'bug_reports',
}

export const ADMIN_EMAIL = 'admin@krish.com'

export default app
