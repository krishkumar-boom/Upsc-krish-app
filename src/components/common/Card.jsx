export default function Card({ title, icon: Icon, action, children, className = '', noPadding = false }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 transition-all hover:shadow-md ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title && (
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              {Icon && <Icon className="text-indigo-500" />}
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  )
}
