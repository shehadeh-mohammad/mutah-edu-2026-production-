interface VideoSectionProps {
  videoId: string
  title: string
  duration: string
}

export default function VideoSection({ videoId, title, duration }: VideoSectionProps) {
  return (
    <div className="space-y-3">
      <div
        className="w-full rounded-2xl overflow-hidden border"
        style={{ aspectRatio: '16/9', borderColor: 'var(--border)', background: '#000' }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title}
          allowFullScreen
          loading="lazy"
          className="w-full h-full border-0"
        />
      </div>
      <p className="text-sm" style={{ color: 'var(--text2)' }}>
        📺 Lecture: <strong style={{ color: 'var(--text)' }}>{title}</strong>{' '}
        <span style={{ color: 'var(--text3)' }}>· {duration}</span>
      </p>
    </div>
  )
}
