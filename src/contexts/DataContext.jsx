import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, limit, where, getDocs, writeBatch, serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, COLLECTIONS } from '../firebase/config'
import { useAuth } from './AuthContext'
import { validateQuestion, shuffleArray } from '../utils/helpers'
import toast from 'react-hot-toast'

const DataContext = createContext()

export const useData = () => useContext(DataContext)

export function DataProvider({ children }) {
  const { currentUser, isAdmin } = useAuth()
  const [questions, setQuestions] = useState([])
  const [questionsLoading, setQuestionsLoading] = useState(true)

  // Real-time questions listener
  useEffect(() => {
    if (!currentUser) {
      setQuestions([])
      setQuestionsLoading(false)
      return
    }

    const q = query(
      collection(db, COLLECTIONS.QUESTIONS),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setQuestions(questionsData)
      setQuestionsLoading(false)
    }, (error) => {
      console.error('Questions listener error:', error)
      setQuestionsLoading(false)
    })

    return unsubscribe
  }, [currentUser])

  // Add question
  const addQuestion = useCallback(async (questionData) => {
    try {
      const data = {
        ...questionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser?.uid || 'system',
        active: true
      }
      const docRef = await addDoc(collection(db, COLLECTIONS.QUESTIONS), data)
      await logActivity('question_added', `New question added`)
      toast.success('Question added successfully')
      return docRef.id
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('Failed to add question')
      throw error
    }
  }, [currentUser])

  // Update question
  const updateQuestion = useCallback(async (id, data) => {
    try {
      const docRef = doc(db, COLLECTIONS.QUESTIONS, id)
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      await logActivity('question_updated', `Question updated: ${id}`)
      toast.success('Question updated')
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Failed to update question')
      throw error
    }
  }, [])

  // Delete question
  const deleteQuestion = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.QUESTIONS, id))
      await logActivity('question_deleted', `Question deleted: ${id}`)
      toast.success('Question deleted')
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
      throw error
    }
  }, [])

  // Bulk upload
  const bulkUpload = useCallback(async (questionsArray) => {
    const batchSize = 500
    let uploaded = 0
    let failed = 0

    for (let i = 0; i < questionsArray.length; i += batchSize) {
      const batch = writeBatch(db)
      const chunk = questionsArray.slice(i, i + batchSize)

      for (const q of chunk) {
        const validation = validateQuestion(q)
        if (validation.valid) {
          const docRef = doc(collection(db, COLLECTIONS.QUESTIONS))
          batch.set(docRef, {
            ...q,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: currentUser?.uid || 'system',
            active: true
          })
          uploaded++
        } else {
          failed++
        }
      }

      try {
        await batch.commit()
      } catch (error) {
        console.error('Batch error:', error)
        failed += chunk.length
        uploaded -= chunk.length
      }
    }

    await logActivity('bulk_upload', `Bulk upload: ${uploaded} success, ${failed} failed`)
    return { uploaded, failed }
  }, [currentUser])

  // Filter questions
  const getFilteredQuestions = useCallback((filters = {}) => {
    let filtered = questions.filter(q => q.active !== false)

    if (filters.subject) filtered = filtered.filter(q => q.subject === filters.subject)
    if (filters.difficulty) filtered = filtered.filter(q => q.difficulty === filters.difficulty)
    if (filters.type) filtered = filtered.filter(q => q.type === filters.type)
    if (filters.examType) filtered = filtered.filter(q => q.examType === filters.examType)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      filtered = filtered.filter(q =>
        q.question?.toLowerCase().includes(s) ||
        q.subject?.toLowerCase().includes(s) ||
        q.chapter?.toLowerCase().includes(s)
      )
    }
    if (filters.limit) {
      filtered = shuffleArray(filtered).slice(0, filters.limit)
    }

    return filtered
  }, [questions])

  // Get stats
  const getStats = useCallback(() => {
    const active = questions.filter(q => q.active !== false)
    const bySubject = {}
    const byDifficulty = { easy: 0, medium: 0, hard: 0 }
    const byType = {}

    active.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1
      if (byDifficulty[q.difficulty] !== undefined) byDifficulty[q.difficulty]++
      byType[q.type] = (byType[q.type] || 0) + 1
    })

    return { total: active.length, bySubject, byDifficulty, byType }
  }, [questions])

  // Upload image
  const uploadImage = useCallback(async (file, path) => {
    try {
      const storageRef = ref(storage, `question_images/${path}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
      throw error
    }
  }, [])

  // Log activity
  const logActivity = useCallback(async (type, message, details = {}) => {
    try {
      await addDoc(collection(db, COLLECTIONS.LOGS), {
        type,
        message,
        details,
        userId: currentUser?.uid || 'system',
        userName: currentUser?.displayName || 'System',
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Log error:', error)
    }
  }, [currentUser])

  // Get test results
  const getUserResults = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.TEST_RESULTS),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(50)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Results fetch error:', error)
      return []
    }
  }, [])

  // Save test result
  const saveTestResult = useCallback(async (resultData) => {
    try {
      await addDoc(collection(db, COLLECTIONS.TEST_RESULTS), {
        ...resultData,
        userId: currentUser?.uid,
        userName: currentUser?.displayName,
        completedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Save result error:', error)
    }
  }, [currentUser])

  // Get logs
  const getLogs = useCallback(async (limitCount = 50) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.LOGS),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Logs fetch error:', error)
      return []
    }
  }, [])

  // Announcements
  const getAnnouncements = useCallback(async (activeOnly = false) => {
    try {
      let q
      if (activeOnly) {
        q = query(
          collection(db, COLLECTIONS.ANNOUNCEMENTS),
          where('active', '==', true),
          orderBy('createdAt', 'desc'),
          limit(30)
        )
      } else {
        q = query(
          collection(db, COLLECTIONS.ANNOUNCEMENTS),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Announcements fetch error:', error)
      return []
    }
  }, [])

  const sendAnnouncement = useCallback(async (data) => {
    try {
      await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), {
        ...data,
        createdBy: currentUser?.uid,
        createdByName: currentUser?.displayName,
        createdAt: serverTimestamp()
      })
      await logActivity('announcement_sent', `New announcement: ${data.title}`)
      toast.success('Announcement sent!')
    } catch (error) {
      toast.error('Failed to send announcement')
      throw error
    }
  }, [currentUser, logActivity])

  const value = {
    questions,
    questionsLoading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    bulkUpload,
    getFilteredQuestions,
    getStats,
    uploadImage,
    logActivity,
    getUserResults,
    saveTestResult,
    getLogs,
    getAnnouncements,
    sendAnnouncement,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
