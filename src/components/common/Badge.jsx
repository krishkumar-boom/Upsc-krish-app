export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-indigo-50 text-indigo-600',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-red-50 text-red-600',
    warning: 'bg-amber-50 text-amber-600',
    info: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-100 text-gray-500',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </span>
  )
}
