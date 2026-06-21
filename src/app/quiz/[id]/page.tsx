import AppShell from '@/components/layout/AppShell'
import { getChapterById } from '@/services/dataService'
import QuizPageInner from './QuizPageInner'

interface Props { params: { id: string } }

export default function QuizPage({ params }: Props) {
  const chapter = getChapterById(params.id)
  return (
    <AppShell title={`Quiz · ${chapter?.title ?? ''}`}>
      <QuizPageInner chapterId={params.id} />
    </AppShell>
  )
}
