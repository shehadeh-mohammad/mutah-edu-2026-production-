import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// ─── Flashcard / Quiz Schema ──────────────────────────────────────────────────
// SDK-level JSON enforcement: the model is contractually bound to return a
// JSON array and nothing else — no markdown fences, no prose preamble.
// This eliminates the hallucination risk that prompt-only constraints carry.
const FLASHCARD_RESPONSE_SCHEMA = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            front: {
                type: 'string',
                description: 'The question or concept prompt on the front of the card.',
            },
            back: {
                type: 'string',
                description: 'The correct answer with a brief explanation on the back of the card.',
            },
        },
        required: ['front', 'back'],
    },
}

// ─── Model Fallback Chain ─────────────────────────────────────────────────────
// Mirrors the chain in /api/chat/route.ts for consistency.
const MODEL_FALLBACK_CHAIN = [
    'gemini-flash-latest',  // Priority 1: Fast and available
    'gemini-2.5-flash',     // Priority 2: Safe fallback
    'gemini-pro-latest',    // Priority 3: Heavier fallback
]

function shouldFallback(error: any): boolean {
    const msg = error?.message || ''
    const status = error?.status ?? 0
    return (
        status === 503 ||
        status === 429 ||
        status === 404 || // Missing model alias → try next
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('high demand') ||
        msg.includes('Service Unavailable') ||
        msg.includes('Too Many Requests')
    )
}

export async function POST(req: NextRequest) {
    console.log('--- API FLASHCARDS ROUTE START ---')
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'API key not configured on server.' },
                { status: 500 }
            )
        }

        const body = await req.json()
        const { prompt, count = 3 } = body

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { success: false, error: 'A valid prompt string is required.' },
                { status: 400 }
            )
        }

        const safeCount = Math.min(Math.max(Number(count) || 3, 1), 10)

        const genAI = new GoogleGenerativeAI(apiKey)

        // Structured prompt — the SDK-level schema already enforces JSON output,
        // but we keep the prompt directive for semantic clarity to the model.
        const fullPrompt = `You are a university-level academic quiz generator for Mutah University students.
Generate exactly ${safeCount} strong, exam-quality MCQ questions based on the following academic context.

RULES:
- Each question must test a distinct concept. Do not repeat similar questions.
- Keep technical terms in English (e.g., Pointers, B-Tree, Thread, Middleware).
- The "back" field must contain the correct answer AND a concise 1-sentence explanation.
- Output language for questions: English (since exams are in English). Explanation in "back" may be bilingual if helpful.

CONTEXT:
${prompt}`

        let result: any = null
        let lastError: any = null

        // ── 3-tier fallback loop ──────────────────────────────────────────────
        for (const modelName of MODEL_FALLBACK_CHAIN) {
            try {
                console.log(`[Flashcards] Attempting model: ${modelName}`)

                // SDK-level JSON contract: responseMimeType + responseSchema
                // This forces the model to return a valid JSON array or throw.
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        responseMimeType: 'application/json',
                        responseSchema: FLASHCARD_RESPONSE_SCHEMA as any,
                    },
                })

                // Each model gets up to 2 quick retries for transient spikes
                for (let attempt = 0; attempt < 2; attempt++) {
                    try {
                        result = await model.generateContent(fullPrompt)
                        console.log(`[Flashcards] Success with model: ${modelName} (attempt ${attempt + 1})`)
                        break // Break inner retry loop
                    } catch (err: any) {
                        if (shouldFallback(err) && attempt < 1) {
                            const delay = 1500 * (attempt + 1) // 1.5s, then 3s
                            console.warn(`[Flashcards] ${modelName} overloaded, retrying in ${delay}ms...`)
                            await new Promise(r => setTimeout(r, delay))
                        } else {
                            throw err // Escalate to outer catch → try next model
                        }
                    }
                }

                if (result) break // Break outer model-chain loop on success

            } catch (err: any) {
                lastError = err
                if (shouldFallback(err)) {
                    console.warn(`[Flashcards] Model ${modelName} unavailable, trying next fallback...`)
                    continue
                }
                // Non-transient error (e.g. auth failure) — stop immediately
                throw err
            }
        }

        if (!result) {
            throw lastError ?? new Error('All AI models are currently unavailable.')
        }

        // ── Parse the SDK-enforced JSON response ─────────────────────────────
        let rawText = ''
        try {
            rawText = result.response.text()
        } catch (e) {
            console.error('[Flashcards] Content blocked or empty:', e)
            throw new Error('عذراً، لم أتمكن من توليد الأسئلة. قد يكون المحتوى محظوراً.')
        }

        let parsed: { front: string; back: string }[]
        try {
            // The SDK enforces JSON, so this should never fail — but we keep a
            // safety net to surface any edge-case model defects clearly.
            parsed = JSON.parse(rawText)
            if (!Array.isArray(parsed)) {
                throw new Error('Response is not a JSON array.')
            }
        } catch (parseErr) {
            console.error('[Flashcards] Unexpected JSON parse failure despite SDK schema:', rawText)
            throw new Error('فشل في استخراج الأسئلة بصيغة صحيحة. يرجى المحاولة مرة أخرى.')
        }

        return NextResponse.json({ success: true, data: parsed })

    } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[Flashcards] FULL API ERROR:', error)

        const isOverloaded = message.includes('503') || message.includes('high demand')
        const isRateLimit = message.includes('429') || message.includes('Too Many')
        const errorCode = isOverloaded ? 'OVERLOADED' : isRateLimit ? 'RATE_LIMIT' : 'UNKNOWN'

        return NextResponse.json(
            { success: false, error: message, errorCode },
            { status: 500 }
        )
    }
}
