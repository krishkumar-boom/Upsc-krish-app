import { useState } from 'react'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import { FaCode, FaPaste, FaUpload, FaTrash, FaBolt, FaShieldAlt, FaDatabase } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function JSONPasteBox() {
  const { bulkUpload } = useData()
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const charCount = text.length
  let questionCount = 0
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) questionCount = parsed.length
  } catch { questionCount = 0 }

  const handleUpload = async () => {
    if (!text.trim()) {
      toast.error('Please paste JSON data first')
      return
    }

    try {
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) {
        toast.error('JSON must be an array')
        return
      }

      if (!window.confirm(`Upload ${parsed.length} questions to database?`)) return

      setUploading(true)
      setResult(null)
      const res = await bulkUpload(parsed)
      setResult(res)
      toast.success(`${res.uploaded} questions uploaded instantly!`)
    } catch (error) {
      toast.error('Invalid JSON: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaCode className="text-indigo-500" /> JSON Paste Box
        </h2>
        <p className="text-gray-500 text-sm">Paste extremely large JSON datasets instantly</p>
      </div>

      <Card
        title="Paste JSON Here"
        icon={FaPaste}
        action={
          <div className="flex gap-2">
            <button onClick={() => { setText(''); setResult(null) }} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-gray-200">
              <FaTrash /> Clear
            </button>
            <button onClick={handleUpload} disabled={uploading} className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:shadow-lg disabled:opacity-50">
              <FaUpload /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        }
      >
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full min-h-[300px] p-4 font-mono text-sm border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 resize-y focus:border-indigo-500 focus:bg-white outline-none transition-all"
          placeholder="Paste your JSON array of questions here..."
        />
        <div className="mt-3 text-sm text-gray-400">
          <span>{charCount.toLocaleString()}</span> characters |{' '}
          <span className={questionCount > 0 ? 'text-emerald-500 font-semibold' : 'text-red-400'}>
            {questionCount > 0 ? `${questionCount} questions detected` : text.length > 0 ? 'Invalid JSON' : '0 questions'}
          </span>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h4 className="font-semibold text-emerald-600">Success! {result.uploaded} questions uploaded!</h4>
            {result.failed > 0 && <p className="text-sm text-amber-600 mt-1">{result.failed} failed</p>}
          </div>
        )}
      </Card>

      <Card title="Features" icon={FaBolt} className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: FaBolt, title: 'Instant Upload', desc: 'Questions appear in student panel immediately', color: 'text-indigo-500' },
            { icon: FaShieldAlt, title: 'Safe Processing', desc: 'Automatic validation with error reporting', color: 'text-indigo-500' },
            { icon: FaDatabase, title: 'No Data Loss', desc: 'Data never deletes on redeploy', color: 'text-indigo-500' },
          ].map(f => (
            <div key={f.title} className="p-4 bg-gray-50 rounded-xl">
              <h4 className={`font-semibold mb-1 flex items-center gap-2 ${f.color}`}>
                <f.icon /> {f.title}
              </h4>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
