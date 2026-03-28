import { useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../../../firebase/config'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import { SUBJECTS, DIFFICULTIES, QUESTION_TYPES, downloadJSON } from '../../../utils/helpers'
import { FaMagic, FaBrain, FaUpload, FaDownload, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'

async function callAI(prompt, systemPrompt = '') {
  const docSnap = await getDoc(doc(db, COLLECTIONS.AI_CONFIG, 'api_keys'))
  const keys = docSnap.exists() ? docSnap.data() : {}

  const providers = [
    {
      name: 'openrouter', key: keys.openrouter,
      url: 'https://openrouter.ai/api/v1/chat/completions',
      getHeaders: (k) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
      getBody: () => ({ model: 'deepseek/deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4000 }),
      extract: (d) => d.choices?.[0]?.message?.content
    },
    {
      name: 'deepseek', key: keys.deepseek,
      url: 'https://api.deepseek.com/v1/chat/completions',
      getHeaders: (k) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
      getBody: () => ({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4000 }),
      extract: (d) => d.choices?.[0]?.message?.content
    },
    {
      name: 'gemini', key: keys.gemini,
      url: null,
      getHeaders: () => ({ 'Content-Type': 'application/json' }),
      getBody: () => ({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 4000 } }),
      extract: (d) => d.candidates?.[0]?.content?.parts?.[0]?.text
    },
    {
      name: 'openai', key: keys.openai,
      url: 'https://api.openai.com/v1/chat/completions',
      getHeaders: (k) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
      getBody: () => ({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4000 }),
      extract: (d) => d.choices?.[0]?.message?.content
    }
  ]

  for (const provider of providers) {
    if (!provider.key) continue
    try {
      const url = provider.name === 'gemini'
        ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${provider.key}`
        : provider.url

      const response = await fetch(url, {
        method: 'POST',
        headers: provider.getHeaders(provider.key),
        body: JSON.stringify(provider.getBody())
      })

      if (!response.ok) continue
      const data = await response.json()
      const text = provider.extract(data)
      if (text) return { provider: provider.name, response: text }
    } catch (e) {
      console.warn(`${provider.name} failed:`, e.message)
    }
  }

  throw new Error('All AI providers failed. Please check your API keys in AI Configuration.')
}

export default function AIGenerator() {
  const { bulkUpload, logActivity } = useData()
  const [config, setConfig] = useState({
    subject: '', difficulty: 'medium', type: 'mcq', chapter: '', count: 10
  })
  const [generating, setGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState(null)

  const handleGenerate = async () => {
    if (!config.subject) {
      toast.error('Please select a subject')
      return
    }

    setGenerating(true)
    setGeneratedQuestions(null)

    const subjectName = SUBJECTS.find(s => s.id === config.subject)?.name || config.subject

    const prompt = `Generate exactly ${config.count} UPSC NDA level ${config.difficulty} ${config.type} questions for "${subjectName}"${config.chapter ? ` on "${config.chapter}"` : ''}.

Return ONLY a valid JSON array:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation",
    "subject": "${config.subject}",
    "difficulty": "${config.difficulty}",
    "type": "${config.type}",
    "chapter": "${config.chapter || subjectName}",
    "examType": "practice",
    "marks": 2.5,
    "negativeMark": 0.83
  }
]

correctAnswer is the INDEX (0-3). Return ONLY valid JSON.`

    try {
      const result = await callAI(prompt, 'You are an expert UPSC NDA exam question generator. Return only valid JSON.')
      const jsonMatch = result.response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Invalid response format')

      const questions = JSON.parse(jsonMatch[0])
      setGeneratedQuestions(questions)
      await logActivity('ai_generation', `AI generated ${questions.length} questions via ${result.provider}`)
      toast.success(`${questions.length} questions generated!`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleUpload = async () => {
    if (!generatedQuestions) return
    try {
      const res = await bulkUpload(generatedQuestions)
      toast.success(`${res.uploaded} questions uploaded to database!`)
      setGeneratedQuestions(null)
    } catch (error) {
      toast.error('Upload failed')
    }
  }

  const handleDownload = () => {
    if (!generatedQuestions) return
    downloadJSON(generatedQuestions, `nda-ai-questions-${new Date().toISOString().split('T')[0]}.json`)
    toast.success('Questions downloaded!')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaMagic className="text-indigo-500" /> AI Question Generator
        </h2>
        <p className="text-gray-500 text-sm">Generate high-quality NDA questions using AI</p>
      </div>

      <Card title="Generate Questions" icon={FaBrain}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
            <select value={config.subject} onChange={e => setConfig(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
              <option value="">Select Subject</option>
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulty</label>
            <select value={config.difficulty} onChange={e => setConfig(p => ({ ...p, difficulty: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
              {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
            <select value={config.type} onChange={e => setConfig(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
              {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chapter / Topic</label>
            <input type="text" value={config.chapter} onChange={e => setConfig(p => ({ ...p, chapter: e.target.value }))} placeholder="Optional" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Questions</label>
            <input type="number" value={config.count} onChange={e => setConfig(p => ({ ...p, count: parseInt(e.target.value) || 5 }))} min={1} max={50} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={generating} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 transition-all">
          {generating ? <FaSpinner className="animate-spin" /> : <FaMagic />}
          {generating ? 'Generating...' : 'Generate Questions'}
        </button>

        {generatedQuestions && (
          <div className="mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h4 className="font-semibold text-emerald-600 mb-3">
              ✅ {generatedQuestions.length} Questions Generated!
            </h4>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handleUpload} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-600">
                <FaUpload /> Upload All
              </button>
              <button onClick={handleDownload} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-200">
                <FaDownload /> Download JSON
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
