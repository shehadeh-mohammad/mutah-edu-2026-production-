import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const modules = await prisma.module.findMany({
        include: { course: true }
    });

    const toProcess = modules.filter(mod => {
        const desc = mod.aiContextSummary;
        return !desc || desc.trim() === '' || desc.includes('No description');
    });

    console.log(`Found ${toProcess.length} modules to process.`);
    let updatedCount = 0;
    
    for (const mod of toProcess) {
        // Clean up title strings for better readability
        const courseTitle = mod.course.title.trim();
        const chapterTitle = mod.title.replace(/^Ch\d+:?\s*/i, '').trim();

        // Dynamically replace with a polished, professional 2-sentence academic description
        const generatedDescription = `This module provides an in-depth lecture on ${chapterTitle}, focusing on the core principles and underlying mechanisms central to ${courseTitle}. Students will explore the foundational concepts and practical methodologies required to master this specific area of study.`;

        try {
            await prisma.module.update({
                where: { id: mod.id },
                data: { aiContextSummary: generatedDescription }
            });
            updatedCount++;
        } catch (err) {
            console.error(`Error updating module ${mod.id}:`, err);
        }
    }
    
    console.log(`Finished processing. Updated ${updatedCount} modules.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
