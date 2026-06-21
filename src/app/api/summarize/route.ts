import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const MODEL_FALLBACK_CHAIN = [
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-pro-latest',
]

function shouldFallback(error: any): boolean {
    const msg = error?.message || ''
    const status = error?.status ?? 0
    return (
        status === 503 ||
        status === 429 ||
        status === 404 ||
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('high demand') ||
        msg.includes('Service Unavailable') ||
        msg.includes('Too Many Requests')
    )
}

// Approximate token calculation (rough estimate: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
}

// Split text into chunks, avoiding cutting code blocks and definitions
function smartChunkText(text: string, maxTokensPerChunk: number): string[] {
    // Split by double newlines (paragraphs) to avoid breaking sentences or small code blocks
    const paragraphs = text.split(/\n\s*\n/)
    const chunks: string[] = []
    let currentChunk = ''

    for (const paragraph of paragraphs) {
        const paragraphTokens = estimateTokens(paragraph)
        if (estimateTokens(currentChunk) + paragraphTokens > maxTokensPerChunk && currentChunk.length > 0) {
            chunks.push(currentChunk)
            currentChunk = paragraph
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph
        }
    }
    if (currentChunk) chunks.push(currentChunk)
    
    return chunks
}

const DYNAMIC_LINGUISTIC_RULE = `DYNAMIC LINGUISTIC & CONTEXT RULE:
- Maintain strict academic preservation: Since computer science course materials, slides, and exams are in English, always generate core summaries, technical concepts, flashcards, and practice questions in clear, professional English so they match the student's exam context.
- Adapt fluidly to the student's prompt: If the student asks a question or requests an explanation in Arabic (e.g., 'اشرحلي هاد بالعربي'), seamlessly explain the concepts using a friendly, simplified, and highly digestible Jordanian/Arabic conversational style.
- Keep technical terms intact: Never translate core computer science terms (e.g., Pointers, Thread, B-Tree, Middleware) into awkward Arabic. Keep the technical terms in English while embedding them naturally within the Arabic explanations.
- Be context-aware: If the student explicitly demands a specific language configuration (e.g., 'Summarize in English and explain the key points in Arabic'), strictly follow their direct intent with absolute flexibility.`;

export async function POST(req: NextRequest) {
    try {
        const pdfParse = require('pdf-parse')
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API key not configured.' }, { status: 500 })
        }

        const body = await req.json()
        const { pdfUrl, prompt, aiContext } = body

        // Detect placeholder / missing PDF (e.g. video-only masterclass chapters where resource.url is '#')
        const isRemoteUrl = pdfUrl && typeof pdfUrl === 'string' && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'));
        const isRealPdf = pdfUrl && typeof pdfUrl === 'string' && (pdfUrl.toLowerCase().endsWith('.pdf') || isRemoteUrl)
        const isPlaceholder = !pdfUrl || pdfUrl === '#' || !isRealPdf

        // --- FAST PATH: AI Context-based summary (no PDF required) ---
        // Used when a chapter is video-only or has no physical PDF attached.
        if (isPlaceholder) {
            if (!aiContext || (!aiContext.summary && !aiContext.transcript)) {
                return NextResponse.json(
                    { success: false, error: 'لا يوجد ملف PDF أو محتوى نصي متاح لهذا الفصل لإنشاء الملخص.' },
                    { status: 400 }
                )
            }

            const genAI = new GoogleGenerativeAI(apiKey!)

            const contextText = [
                aiContext.title ? `عنوان الفصل: ${aiContext.title}` : '',
                aiContext.summary ? `ملخص المحتوى الأكاديمي:\n${aiContext.summary}` : '',
                aiContext.transcript ? `نص الفيديو / المحتوى المرجعي:\n${aiContext.transcript}` : '',
            ].filter(Boolean).join('\n\n')

            const contextPrompt = `${DYNAMIC_LINGUISTIC_RULE}\n\nأنت مساعد أكاديمي. قم بتلخيص المحتوى التالي بأسلوب علمي احترافي.\n\n[المحتوى]\n${contextText}\n\n${prompt}`
            
            let summary = ''
            let lastError: any = null
            
            for (const modelName of MODEL_FALLBACK_CHAIN) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName })
                    for (let attempt = 0; attempt < 2; attempt++) {
                        try {
                            const result = await model.generateContent(contextPrompt)
                            summary = result.response.text()
                            break
                        } catch (err: any) {
                            if (shouldFallback(err) && attempt < 1) {
                                await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
                            } else {
                                throw err
                            }
                        }
                    }
                    if (summary) break
                } catch (err: any) {
                    lastError = err
                    if (shouldFallback(err)) continue
                    throw err
                }
            }
            if (!summary) throw lastError ?? new Error('All AI models are currently unavailable.')

            return NextResponse.json({ success: true, data: summary })
        }

        // --- STANDARD PATH: Physical PDF file ---
        // 1. Locate and read the PDF

        let dataBuffer: Buffer;

        if (isRemoteUrl) {
            let fetchUrl = pdfUrl;
            // Check for Google Drive URL and extract ID
            const driveMatch = pdfUrl.match(/(?:drive\.google\.com\/.*[?&]id=|\/d\/|open\?id=)([^/?&]+)/);
            if (driveMatch && driveMatch[1]) {
                const fileId = driveMatch[1];
                fetchUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
            }

            try {
                const response = await fetch(fetchUrl);
                if (!response.ok) throw new Error(`Failed to fetch remote PDF: ${response.statusText}`);
                const arrayBuf = await response.arrayBuffer();
                dataBuffer = Buffer.from(arrayBuf);
            } catch (err: any) {
                console.error(`[AI Summary] Remote fetch failed for ${pdfUrl}:`, err);
                return NextResponse.json({ error: 'Failed to fetch remote PDF' }, { status: 404 });
            }
        } else {
            const baseDir = path.resolve(process.cwd(), 'public')
            // Using path.join before resolve safely handles leading slashes in pdfUrl
            const filePath = path.resolve(path.join(baseDir, pdfUrl))

            if (!filePath.startsWith(baseDir)) {
                console.error(`[Security] Path traversal attempt blocked: ${pdfUrl}`)
                return NextResponse.json({ success: false, error: 'Forbidden: Invalid file path.' }, { status: 403 })
            }

            if (!fs.existsSync(filePath)) {
                console.error(`[AI Summary] File not found at path: ${filePath}`)
                return NextResponse.json({ error: 'File not found' }, { status: 404 })
            }

            dataBuffer = fs.readFileSync(filePath)
        }
        let pdfText = ''
        if (typeof pdfParse.PDFParse === 'function') {
            // Handle pdf-parse v2.x (Class-based API)
            const parser = new pdfParse.PDFParse(new Uint8Array(dataBuffer))
            const pdfData = await parser.getText()
            pdfText = pdfData.text
        } else {
            // Handle pdf-parse v1.x (Classic function API)
            const pdfData = await (pdfParse.default || pdfParse)(dataBuffer)
            pdfText = pdfData.text
        }

        // 2. Setup Gemini
        const genAI = new GoogleGenerativeAI(apiKey)
        
        // 3. Token Check and Smart Chunking
        const totalTokens = estimateTokens(pdfText)
        // Gemini 1.5 Flash has 1M context. Safe limit set to 600k tokens before chunking.
        const SAFE_LIMIT = 600000 
        
        let finalSummary = ''
        let lastError: any = null

        for (const modelName of MODEL_FALLBACK_CHAIN) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                for (let attempt = 0; attempt < 2; attempt++) {
                    try {
                        if (totalTokens <= SAFE_LIMIT) {
                            // Send full text
                            const fullPrompt = `${DYNAMIC_LINGUISTIC_RULE}\n\nYou are now reading the actual course material. Provide a witty, Jordanian-style summary based ONLY on this text.\n\n[PDF CONTENT BEGIN]\n${pdfText}\n[PDF CONTENT END]\n\n${prompt}`
                            const result = await model.generateContent(fullPrompt)
                            finalSummary = result.response.text()
                        } else {
                            // Smart Chunking Fallback
                            console.log(`[AI] Text exceeds safe limit (${totalTokens} tokens). Applying smart chunking...`)
                            const chunks = smartChunkText(pdfText, 200000) // chunk into manageable 200k tokens (~10-15 pages each depending on density)
                            const chunkSummaries: string[] = []

                            for (let i = 0; i < chunks.length; i++) {
                                const chunkPrompt = `${DYNAMIC_LINGUISTIC_RULE}\n\nSummarize this section of the course material accurately. Preserve any technical definitions and code concepts:\n\n[SECTION START]\n${chunks[i]}\n[SECTION END]`
                                const chunkResult = await model.generateContent(chunkPrompt)
                                chunkSummaries.push(chunkResult.response.text())
                            }

                            // Master Summary
                            const masterPrompt = `${DYNAMIC_LINGUISTIC_RULE}\n\nYou are now reading the summarized sections of the actual course material. Provide a cohesive, witty, Jordanian-style Master Summary based ONLY on these summaries.\n\n[SUMMARIES BEGIN]\n${chunkSummaries.join('\n\n---\n\n')}\n[SUMMARIES END]\n\n${prompt}`
                            const masterResult = await model.generateContent(masterPrompt)
                            finalSummary = masterResult.response.text()
                        }
                        break // Success, break retry loop
                    } catch (err: any) {
                        if (shouldFallback(err) && attempt < 1) {
                            await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
                        } else {
                            throw err
                        }
                    }
                }
                if (finalSummary) break // Success, break model chain
            } catch (err: any) {
                lastError = err
                if (shouldFallback(err)) continue
                throw err
            }
        }

        if (!finalSummary) {
            throw lastError ?? new Error('All AI models are currently unavailable.')
        }

        return NextResponse.json({ success: true, data: finalSummary })

    } catch (error: any) {
        console.error("PDF Summarize Error:", error)
        return NextResponse.json({ success: false, error: error.message || 'Internal error while parsing PDF' }, { status: 500 })
    }
}
