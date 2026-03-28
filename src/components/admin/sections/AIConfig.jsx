import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import Card from '../../common/Card'
import { FaRobot, FaKey, FaSave, FaInfoCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AIConfig() {
  const [keys, setKeys] = useState({
    openrouter: '', deepseek: '', gemini: '', openai: ''
  })
  const [saving, setSaving] = useState({})

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const docRef = doc(db, COLLECTIONS.AI_CONFIG, 'api_keys')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setKeys(prev => ({ ...prev, ...docSnap.data() }))
      }
    } catch (error) {
      console.error('Load keys error:', error)
    }
  }

  const saveKey = async (provider) => {
    const key = keys[provider]?.trim()
    if (!key) {
      toast.error('Please enter a valid API key')
      return
    }

    setSaving(prev => ({ ...prev, [provider]: true }))
    try {
      await setDoc(doc(db, COLLECTIONS.AI_CONFIG, 'api_keys'), {
        [provider]: key
      }, { merge: true })
      toast.success(`${provider} API key saved!`)
    } catch (error) {
      toast.error('Failed to save API key')
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }))
    }
  }

  const providers = [
    { id: 'openrouter', label: 'OpenRouter', placeholder: 'sk-or-...' },
    { id: 'deepseek', label: 'DeepSeek', placeholder: 'sk-...' },
    { id: 'gemini', label: 'Gemini', placeholder: 'AIza...' },
    { id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaRobot className="text-indigo-500" /> AI Configuration
        </h2>
        <p className="text-gray-500 text-sm">Manage API keys for AI-powered features</p>
      </div>

      <Card title="API Keys" icon={FaKey}>
        <div className="space-y-4">
          {providers.map(p => (
            <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 min-w-[100px]">{p.label}</span>
              <input
                type="password"
                value={keys[p.id]}
                onChange={e => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                placeholder={p.placeholder}
                className="flex-1 w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <button
                onClick={() => saveKey(p.id)}
                disabled={saving[p.id]}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-600 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                <FaSave /> {saving[p.id] ? 'Saving...' : 'Save'}
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-4">
          <strong>Priority:</strong> OpenRouter → DeepSeek → Gemini → OpenAI
        </p>
      </Card>

      <Card title="Instructions" icon={FaInfoCircle} className="mt-6">
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>OpenRouter:</strong> Best performance and model variety</p>
          <p><strong>DeepSeek:</strong> Fast and cost-effective</p>
          <p><strong>Gemini:</strong> Google AI with strong reasoning</p>
          <p><strong>OpenAI:</strong> Reliable fallback option</p>
        </div>
      </Card>
    </div>
  )
}
