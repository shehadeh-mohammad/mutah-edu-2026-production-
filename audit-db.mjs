import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const modules = await prisma.module.findMany();
    let updatedCount = 0;
    for (const m of modules) {
        if (!m.pdfUrl || m.pdfUrl.trim() === '' || m.pdfUrl.includes('placeholder')) {
            console.log(`Fixing module ${m.id} (${m.title})`);
            await prisma.module.update({
                where: { id: m.id },
                data: {
                    pdfUrl: null,
                    aiContextSummary: `**ملخص الفصل: ${m.title}**

هذا ملخص تلقائي للفصل نظرًا لعدم توفر ملف PDF رسمي. 
يركز هذا الفصل على المفاهيم الأساسية، حيث يتم مناقشة الجوانب التقنية والنظرية بالتفصيل. 
**أهم النقاط:**
1. المفاهيم والمبادئ الأساسية المرتبطة بالموضوع.
2. التطبيقات العملية وأفضل الممارسات.
3. التحديات الشائعة وكيفية التغلب عليها.

نرجو متابعة الفيديو المرفق للحصول على التفاصيل الكاملة.`,
                    transcript: `[Auto-generated placeholder transcript for video module: ${m.title}]`
                }
            });
            updatedCount++;
        }
    }
    console.log(`Audit complete. Updated ${updatedCount} modules.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
