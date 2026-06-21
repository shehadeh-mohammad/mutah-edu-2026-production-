import AppShell from '@/components/layout/AppShell'
import DashboardClient from './DashboardClient'
import prisma from '@/lib/prisma'
import { getCoursesByIds, getChaptersByCourseId } from '@/services/dataService'

// Use the slug values (assigned by assign_slugs.ts) for enrolled course lookup
const ENROLLED_SLUGS = ['data-structures', 'operating-systems', 'computer-networks', 'algorithms', 'intro-ai', 'oop']

// Legacy static IDs for fallback UI fields
const ENROLLED_STATIC_IDS = ['cs101', 'cs201', 'cs301', 'ai101', 'se201', 'ds101']

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Fetch live courses from Prisma by slug
  const liveCourses = await prisma.course.findMany({
    where: { slug: { in: ENROLLED_SLUGS } },
    include: { modules: true }
  })

  // 2. Fetch recent modules from 'data-structures' course for recent chapters
  const liveDs = await prisma.course.findFirst({
    where: { slug: 'data-structures' },
    include: { modules: { take: 3 } }
  })

  // 3. Map live DB courses to legacy schema for the UI
  const staticCourses = getCoursesByIds(ENROLLED_STATIC_IDS)

  const mappedCourses = liveCourses.map((liveC: any) => {
    // Try to find a matching static course for UI-only fields (credits, level, instructor, etc.)
    const staticC = staticCourses.find(s =>
      liveC.title.toLowerCase().includes(s.title.split('(')[0].trim().toLowerCase()) ||
      s.title.toLowerCase().includes(liveC.title.split('(')[0].trim().toLowerCase())
    ) || null

    return {
      id: liveC.slug || liveC.id,       // slug used for /courses/[id] routing
      title: liveC.title,
      description: liveC.description,
      majorId: liveC.majorId || 'cs',
      credits: staticC?.credits ?? 3,
      level: staticC?.level ?? 'Intermediate',
      instructor: staticC?.instructor ?? "Mu'tah University",
      duration: staticC?.duration ?? '16 weeks',
      progress: staticC?.progress ?? 0,
      emoji: staticC?.emoji ?? '📚',
      chapterIds: liveC.modules.map((m: any) => m.id),
    }
  })

  // 4. Map recent chapters from data-structures
  const recentChapters = (liveDs?.modules ?? []).map((m: any, i: number) => ({
    id: m.id,
    courseId: liveDs?.slug || liveDs?.id || 'data-structures',
    title: m.title,
    videoUrl: m.videoUrl,
    pdfUrl: m.pdfUrl,
    order: i + 1,
    description: m.title,
    videoId: '',
    resource: { name: m.title, size: '', url: m.pdfUrl || '#' }
  }))

  return (
    <AppShell title="الرئيسية">
      <DashboardClient courses={mappedCourses as any} recentChapters={recentChapters as any} />
    </AppShell>
  )
}
