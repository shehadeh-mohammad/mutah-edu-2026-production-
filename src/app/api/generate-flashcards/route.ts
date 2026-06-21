import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Force Node.js runtime — pdf-parse requires Node core modules (fs, buffer)
export const runtime = 'nodejs'

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
const MAX_CHARS = 16_000
const MAX_BYTES = 10 * 1024 * 1024

type Mode = 'classic' | 'exam'

// ─── Classic Mode Prompt ───────────────────────────────────────────────────────
function buildClassicPrompt(text: string): string {
  return `You are an expert academic content analyst and educator.
Analyze the following educational text and generate high-quality Active Recall flashcards for students.

CRITICAL — LANGUAGE RULE (NON-NEGOTIABLE):
ALL output values MUST be in clear, professional ENGLISH only. Never output Arabic or any other language.

REQUIREMENTS:
1. Generate between 10 and 15 flashcards.
2. Target core concepts, definitions, theories, algorithms, and key facts.
3. Each flashcard object must have EXACTLY these fields:
   - "id"       : unique string e.g. "fc-1"
   - "question" : concise question — ENGLISH ONLY
   - "answer"   : precise answer, 1–3 sentences — ENGLISH ONLY
   - "category" : one of "Definition" | "Concept" | "Logic" | "Algorithm" | "Theory" | "Fact"
4. Output MUST be a single raw JSON array. No markdown, no code fences, no text outside the array.

EXAMPLE:
[{ "id": "fc-1", "question": "What is a Binary Search Tree?", "answer": "A BST is a tree where left children have smaller keys and right children have larger keys.", "category": "Definition" }]

SOURCE TEXT:
---
${text.slice(0, MAX_CHARS)}
---
OUTPUT THE JSON ARRAY NOW:`
}

// ─── Exam Mode Prompt ──────────────────────────────────────────────────────────
function buildExamPrompt(text: string): string {
  return `You are an Exam Creator. You MUST return a JSON array where each object has: {id: string, category: string, question: string, options: [A, B, C, D], answer: string, explanation: string}. Failure to provide 4 options will break the system.

CRITICAL — LANGUAGE RULE (NON-NEGOTIABLE):
ALL output values MUST be in clear, professional ENGLISH only. Never output Arabic or any other language.

REQUIREMENTS:
1. Generate between 10 and 15 MCQ flashcards.
2. Create moderately difficult IT-college level questions. Distractors (wrong options) must be plausible and related to the topic to test deep understanding, not just definitions.
3. Each object MUST contain EXACTLY these fields:
   - "id"          : unique string e.g. "fc-1"
   - "category"    : one of "Definition" | "Concept" | "Logic" | "Algorithm" | "Theory" | "Fact"
   - "question"    : the exam question string — ENGLISH ONLY
   - "options"     : an array of EXACTLY 4 strings representing the choices (e.g. ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]).
   - "answer"      : the correct option string exactly as it appears in the options array.
   - "explanation" : 1–2 sentence explanation of WHY the answer is correct from slides.
4. Output MUST be a single raw JSON array. No markdown, no code fences, no text outside the array.

SOURCE TEXT:
---
${text.slice(0, MAX_CHARS)}
---
OUTPUT THE JSON ARRAY NOW:`
}

// ─── PDF Text Extractor (pdf-parse v1) ────────────────────────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
  const raw = require('pdf-parse')
  const parse: ((buf: Buffer) => Promise<{ text: string }>) | undefined =
    typeof raw === 'function' ? raw :
      (raw?.default && typeof raw.default === 'function') ? raw.default :
        undefined

  if (!parse) {
    const shape = JSON.stringify(
      Object.fromEntries(Object.entries(raw ?? {}).map(([k, v]) => [k, typeof v]))
    )
    throw new Error(
      `pdf-parse v1 is required but module shape is: ${shape}. Run: npm install pdf-parse@1`
    )
  }
  const result = await parse(buffer)
  return result.text?.trim() ?? ''
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('pdf') as File | null
    const pdfUrl = formData.get('pdfUrl') as string | null
    const rawMode = (formData.get('mode') as string | null) ?? 'classic'
    const mode: Mode = rawMode === 'exam' ? 'exam' : 'classic'

    let buffer: Buffer;

    if (pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'))) {
        let fetchUrl = pdfUrl;
        const driveMatch = pdfUrl.match(/(?:drive\.google\.com\/.*[?&]id=|\/d\/|open\?id=)([^/?&]+)/);
        if (driveMatch && driveMatch[1]) {
            const fileId = driveMatch[1];
            fetchUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
        }
        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Failed to fetch remote PDF: ${response.statusText}`);
            const arrayBuf = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuf);
        } catch (err: any) {
            console.error(`[generate-flashcards] Remote fetch failed for ${pdfUrl}:`, err);
            return NextResponse.json({ error: 'Failed to fetch remote PDF' }, { status: 404 });
        }
    } else if (file) {
        const isPdf =
          file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf')

        if (!isPdf) {
          return NextResponse.json(
            { error: 'الملف المرفق ليس بصيغة PDF. الرجاء رفع ملف PDF صالح.' },
            { status: 415 }
          )
        }

        if (file.size > MAX_BYTES) {
          return NextResponse.json(
            { error: 'حجم الملف يتجاوز الحد المسموح به (10 ميجابايت).' },
            { status: 413 }
          )
        }
        buffer = Buffer.from(await file.arrayBuffer())
    } else {
        return NextResponse.json({ error: 'لم يتم إرفاق أي ملف أو رابط صحيح.' }, { status: 400 })
    }
    let rawText: string

    try {
      rawText = await extractPdfText(buffer)
    } catch (parseErr: any) {
      console.error('[generate-flashcards] PDF parse error:', parseErr)
      return NextResponse.json(
        { error: 'تعذّر قراءة الملف. تأكد أن الـ PDF يحتوي على نص قابل للقراءة وليس محمياً بكلمة مرور.' },
        { status: 422 }
      )
    }

    if (!rawText || rawText.length < 80) {
      return NextResponse.json(
        { error: 'لم يتم العثور على نص كافٍ في الملف. الرجاء استخدام ملف PDF يحتوي على محتوى نصي.' },
        { status: 422 }
      )
    }

    const prompt = mode === 'exam' ? buildExamPrompt(rawText) : buildClassicPrompt(rawText)
    const genAI = new GoogleGenerativeAI(apiKey)

    let responseText = ''
    let lastError: any = null

    for (const modelName of MODEL_FALLBACK_CHAIN) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        })
        
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const result = await model.generateContent(prompt)
                responseText = result.response.text()
                break
            } catch (err: any) {
                if (shouldFallback(err) && attempt < 1) {
                    await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
                } else {
                    throw err
                }
            }
        }
        if (responseText) break
      } catch (err: any) {
        lastError = err
        if (shouldFallback(err)) continue
        throw err
      }
    }

    if (!responseText) {
      throw lastError ?? new Error('جميع نماذج الذكاء الاصطناعي غير متاحة حالياً.')
    }

    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let flashcards: unknown[]
    try {
      flashcards = JSON.parse(cleaned)
      if (!Array.isArray(flashcards)) throw new Error('not an array')
    } catch {
      console.error('[generate-flashcards] Malformed JSON from AI:', cleaned.slice(0, 400))
      return NextResponse.json(
        { error: 'أعاد الذكاء الاصطناعي بيانات غير صالحة. الرجاء المحاولة مرة أخرى.' },
        { status: 502 }
      )
    }

    // Return mode alongside cards so the viewer knows how to render
    return NextResponse.json({ success: true, mode, flashcards })

  } catch (error: any) {
    console.error('[generate-flashcards] Fatal error:', error)
    return NextResponse.json(
      { error: error?.message ?? 'خطأ داخلي في الخادم.' },
      { status: 500 }
    )
  }
}
