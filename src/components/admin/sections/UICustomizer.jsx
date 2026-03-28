import { useState } from 'react'
import Card from '../../common/Card'
import { FaPalette, FaPaintBrush, FaCheck } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function UICustomizer() {
  const [color, setColor] = useState('#6366f1')

  const applyTheme = () => {
    document.documentElement.style.setProperty('--color-primary', color)
    toast.success('Theme applied!')
  }

  const toggleDark = () => {
    document.body.classList.toggle('dark-mode')
    toast.success(document.body.classList.contains('dark-mode') ? 'Dark mode enabled' : 'Light mode enabled')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaPalette className="text-indigo-500" /> UI Customizer
        </h2>
        <p className="text-gray-500 text-sm">Customize the platform appearance</p>
      </div>

      <Card title="Theme Settings" icon={FaPaintBrush}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-10 border-none cursor-pointer rounded" />
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dark Mode</label>
            <button onClick={toggleDark} className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-all">
              Toggle Dark Mode
            </button>
          </div>
        </div>
        <button onClick={applyTheme} className="mt-6 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
          <FaCheck /> Apply Theme
        </button>
      </Card>
    </div>
  )
}
