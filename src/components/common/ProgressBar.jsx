export default function ProgressBar({ value, max = 100, color = '#6366f1', height = 8, showLabel = false }) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full rounded-full overflow-hidden" style={{ height: `${height}px`, background: '#e2e8f0' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  )
}
