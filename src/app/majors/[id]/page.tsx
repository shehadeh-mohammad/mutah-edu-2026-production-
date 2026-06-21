import { notFound } from 'next/navigation'
import { getMajorById, getAllCourses } from '@/services/dataService'
import MajorClient from './MajorClient'
import prisma from '@/lib/prisma'

interface Props { params: { id: string } }

export const dynamic = 'force-dynamic';

export default async function MajorDetailPage({ params }: Props) {
  const major = getMajorById(params.id)
  if (!major) notFound()

  // 1. Fetch all courses for this major from Prisma (by majorId slug, using contains for multi-major support)
  const liveCourses = await prisma.course.findMany({
    where: { majorId: { contains: params.id } },
    include: { modules: true },
    orderBy: { title: 'asc' },
  })

  // 2. Build a lookup of static courses for UI-only fields (credits, level, instructor, etc.)
  const staticCoursesLookup = new Map(
    getAllCourses()
      .filter(c => c.majorId.includes(params.id))
      .map(c => [c.id, c])
  )

  // 3. Map live DB courses into the frontend schema, merging static UI fields by slug match
  const mappedCourses = liveCourses.map((liveC: any) => {
    // Try to find static course by slug match
    const staticC = staticCoursesLookup.get(liveC.slug || '') || null

    return {
      id: liveC.slug || liveC.id,        // Use slug for URL routing
      slug: liveC.slug || liveC.id,
      title: liveC.title,
      description: liveC.description,
      majorId: liveC.majorId,
      // UI-only fields: pull from static JSON if matched, otherwise defaults
      credits: staticC?.credits ?? 3,
      level: staticC?.level ?? 'Intermediate',
      instructor: staticC?.instructor ?? 'Mu\'tah University',
      duration: staticC?.duration ?? '16 weeks',
      progress: staticC?.progress ?? 0,
      emoji: staticC?.emoji ?? '📚',
      chapterIds: liveC.modules.map((m: any) => m.id),
    }
  })

  return <MajorClient major={major} allCourses={mappedCourses as any} />
}
