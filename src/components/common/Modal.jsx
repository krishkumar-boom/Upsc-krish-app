import { FaTimes } from 'react-icons/fa'

export default function Modal({ isOpen, onClose, title, icon: Icon, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[10002] flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-2xl p-8 w-full ${maxWidth} animate-slideUp max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {Icon && <Icon className="text-indigo-500" />}
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
