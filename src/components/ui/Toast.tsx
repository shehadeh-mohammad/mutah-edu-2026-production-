'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-fade-in-up"
      style={{ background: 'var(--surface2)', borderColor: 'var(--border2)' }}
    >
      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{message}</span>
      <button onClick={onClose} className="text-xs opacity-50 hover:opacity-100" style={{ color: 'var(--text3)' }}>✕</button>
    </div>
  )
}
