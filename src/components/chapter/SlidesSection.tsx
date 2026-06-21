'use client'

import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { useState } from 'react'

interface SlidesSectionProps {
  slidesTitle: string
  chapterTitle: string
}

export default function SlidesSection({ slidesTitle, chapterTitle }: SlidesSectionProps) {
  const [toast, setToast] = useState('')

  return (
    <div>
      <div
        className="rounded-2xl border p-10 text-center flex flex-col items-center gap-5"
        style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}
      >
        <span className="text-6xl">📄</span>
        <div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>{slidesTitle}</h3>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>PDF Lecture Slides · {chapterTitle}</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button variant="outline" onClick={() => setToast('⬇️ Downloading slides...')}>
            ⬇️ Download PDF
          </Button>
          <Button variant="outline" onClick={() => setToast('👁️ Opening preview...')}>
            👁️ Preview Slides
          </Button>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
