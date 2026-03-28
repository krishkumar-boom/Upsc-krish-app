import { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider, ADMIN_EMAIL, COLLECTIONS } from '../firebase/config'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      toast.success(`Welcome, ${result.user.displayName}!`)
      return result.user
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign in cancelled')
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Check your connection.')
      } else {
        toast.error('Sign in failed: ' + error.message)
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const saveUserData = async (user) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid)
      const userDoc = await getDoc(userRef)
      const isAdminUser = user.email === ADMIN_EMAIL

      const baseData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
        role: isAdminUser ? 'admin' : 'student'
      }

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          ...baseData,
          createdAt: serverTimestamp(),
          testsAttempted: 0,
          totalScore: 0,
          averageAccuracy: 0,
          strongSubjects: [],
          weakSubjects: [],
          bookmarks: [],
          notes: {},
          spacedRepetition: {},
          settings: { notifications: true, darkMode: false }
        })
      } else {
        await setDoc(userRef, baseData, { merge: true })
      }

      const updatedDoc = await getDoc(userRef)
      setUserData(updatedDoc.data())
      setIsAdmin(isAdminUser)
    } catch (error) {
      console.error('Error saving user data:', error)
    }
  }

  useEffect(() => {
    let unsubscribe
    const fallbackTimer = setTimeout(() => setLoading(false), 5000)
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            setCurrentUser(user)
            await saveUserData(user)
          } else {
            setCurrentUser(null)
            setUserData(null)
            setIsAdmin(false)
          }
        } catch (err) {
          console.error('Auth state handler error:', err)
          setCurrentUser(null)
          setUserData(null)
          setIsAdmin(false)
        } finally {
          setLoading(false)
        }
      })
    } catch (err) {
      console.error('onAuthStateChanged setup error:', err)
      setLoading(false)
    }

    return () => { if (unsubscribe) unsubscribe(); clearTimeout(fallbackTimer) }
  }, [])

  const value = {
    currentUser,
    userData,
    isAdmin,
    loading,
    signInWithGoogle,
    logout,
    setUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
