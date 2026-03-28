import { useState, useRef } from 'react'
import { useData } from '../../../contexts/DataContext'
import Card from '../../common/Card'
import { FaUpload, FaFileUpload, FaInfoCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function BulkUpload() {
  const { bulkUpload } = useData()
  const [result, setResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)

      if (!Array.isArray(parsed)) {
        toast.error('JSON must be an array of questions')
        return
      }

      if (window.confirm(`Found ${parsed.length} questions. Upload all?`)) {
        setUploading(true)
        setResult(null)
        const res = await bulkUpload(parsed)
        setResult(res)
        toast.success(`${res.uploaded} questions uploaded!`)
      }
    } catch (error) {
      toast.error('Invalid JSON file: ' + error.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaUpload className="text-indigo-500" /> Bulk Upload Questions
        </h2>
        <p className="text-gray-500 text-sm">Upload multiple questions at once</p>
      </div>

      <Card title="Upload from Device" icon={FaFileUpload}>
        <div
          className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
          onClick={() => fileRef.current?.click()}
        >
          <FaFileUpload className="text-5xl text-gray-300 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-800 mb-1">
            {uploading ? 'Uploading...' : 'Click to upload JSON file'}
          </h4>
          <p className="text-sm text-gray-400">Only valid JSON format supported</p>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="hidden" />
        </div>

        {result && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h4 className="font-semibold text-emerald-600 mb-2">Upload Complete!</h4>
            <p className="text-sm"><strong>{result.uploaded}</strong> questions uploaded successfully</p>
            {result.failed > 0 && (
              <p className="text-sm text-amber-600 mt-1"><strong>{result.failed}</strong> questions failed validation</p>
            )}
          </div>
        )}
      </Card>

      <Card title="JSON Format Example" icon={FaInfoCircle} className="mt-6">
        <pre className="bg-gray-50 p-4 rounded-xl overflow-x-auto text-sm font-mono text-gray-700">
{`[
  {
    "question": "What is the capital of India?",
    "options": ["Mumbai", "Delhi", "Kolkata", "Chennai"],
    "correctAnswer": 1,
    "explanation": "Delhi is the capital of India.",
    "subject": "geography",
    "difficulty": "easy",
    "type": "mcq",
    "chapter": "Indian Geography"
  }
]`}
        </pre>
      </Card>
    </div>
  )
}
