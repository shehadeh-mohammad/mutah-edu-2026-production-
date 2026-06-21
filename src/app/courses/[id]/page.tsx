import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CourseClient from './CourseClient';
import { getCourseById } from '@/services/dataService';
import prisma from '@/lib/prisma';

export default async function MasterclassPage({ params }: { params: { id: string } }) {
    // 1. Fetch live course data dynamically from Prisma SQLite based on slug/id
    let targetCourse = await prisma.course.findUnique({
        where: { slug: params.id },
        include: { modules: true },
    })

    // Fallback: If slug not found, try by internal ID (backward compatibility)
    if (!targetCourse) {
        targetCourse = await prisma.course.findUnique({
            where: { id: params.id },
            include: { modules: true },
        })
    }

    if (!targetCourse) notFound()

    // 2. Fetch static metadata to decorate the live DB response (globalDriveFolderUrl, etc.)
    const staticCourse = getCourseById(targetCourse.slug || targetCourse.id) || getCourseById(params.id)

    // 3. Map Prisma Modules into our frontend Course/Chapter schema.
    // CRITICAL: Field names here MUST match what CourseClient.tsx reads in its useMemo.
    // Chapter type uses: youtubeUrl, localVideoPath, pdfDriveUrl, titleArabic, aiContextSummary, transcript
    const mappedCourse = {
        id: targetCourse.id,
        nameArabic: targetCourse.title,
        nameEnglish: targetCourse.title,
        globalDriveFolderUrl: (staticCourse as any)?.globalDriveFolderUrl ?? null,
        majorId: targetCourse.majorId,
        chapters: targetCourse.modules.map((m: any, index: number) => ({
            id: m.id,
            number: index + 1,
            titleArabic: m.title,
            titleEnglish: m.title,
            // Store the DB videoUrl in youtubeUrl — CourseClient reads activeChapterRaw.youtubeUrl
            youtubeUrl: m.videoUrl ?? null,
            localVideoPath: null,
            pdfDriveUrl: m.pdfUrl ?? null,
            aiContextSummary: m.aiContextSummary ?? '',
            transcript: m.transcript ?? '',
        }))
    };

    // Suspense boundary is required by Next.js 14 whenever a child client component
    // calls useSearchParams() inside a statically pre-rendered (SSG) route.
    // Without it, static generation bails out on every /courses/[id] path.
    return (
        <Suspense fallback={null}>
            <CourseClient course={mappedCourse as any} />
        </Suspense>
    );
}
