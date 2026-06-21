import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <span className="text-7xl mb-6 block">🔍</span>
      <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
        Page Not Found
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text3)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
      >
        ← Back to Dashboard
      </Link>
    </div>
  )
}
