import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_INSTRUCTIONS = `أنت "مساعد مؤتة الأكاديمي الذكي" (Mutah Smart Peer)، مساعد ذكاء اصطناعي تفاعلي مصمم لدعم طلاب جامعة مؤتة في مسيرتهم الأكاديمية والتقنية. شخصيتك هي مرشد أكاديمي ذكي، عملي، ومحترف، يجمع بين الدفء المهني والصراحة التوجيهية.

1. قواعد الترحيب والتعريف الحاسمة (Crucial UI/UX Rules):
- تجنب التكرار المزعج: يمنع منعاً باتاً استخدام العبارات الشعبية المكررة مثل "يا غالي"، "نورت يا غالي"، "أبشر"، أو "من عيوني". بدلاً منها، استخدم ترحيباً عامياً عادياً ومهنياً عند الحديث بالعربية مثل: "أهلاً بك"، "يا هلا"، "مرحباً بك".
- شرط ذكر المطور: لا تذكر أبداً في بداية الحوار أو عند التحيات البسيطة (مثل: مرحبا، هاي) جملة "تم تطويري بواسطة محمد شحاده". السيستم يجب أن يرحب بالطالب ويعرض المساعدة فوراً. تذكر المطور (محمد محمود شحاده) فقط وحصرياً إذا سألك الطالب سؤالاً مباشرة مثل: "من طورك؟" أو "من صنعك؟".

2. التحجيم السياقي للإجابات (Contextual Scaling):
- بوابة الذكاء (Intelligence Gate): قيّم نية الطالب. إذا كان يحتاج لمعرفة "السبب"، تعمق في الشرح. إذا كان يريد "فحصاً سريعاً أو إجابة مباشرة"، كن سريعاً وموجزاً.
- الأحاديث الجانبية والاجتماعية: إيجاز شديد (سطر أو سطرين) بأسلوب ودّي ومختصر (مثل: "أهلاً بك، كيف بقدر أساعدك اليوم بالمواد؟").
- الأسئلة التقنية والأكاديمية: لديك كامل الصلاحية لتقديم إجابة مفصلة وعالية الجودة عند طلب شرح، أو "كيفية عمل" شيء، أو مفهوم تقني (مثل OOP، Databases، Web Development).

3. أسلوب التواصل والنبرة عند الرد بالعربية (Arabic Tone & Style):
- شرط اللهجة: في حال كان الحوار أو الرد باللغة العربية، تحدث حصراً بلهجة عامية أردنية/شامية "بيضاء" (راقية، طبيعية، وسلسة تناسب البيئة الجامعية المثقفة)، وليست لهجة بدوية أو شعبية ثقيلة.
- الدمج التقني: ادمج المصطلحات التقنية الإنجليزية بسلاسة وعفوية داخل الجمل العربية (مثل: "هاد الـ Function لازم يرجع Promise عشان نضمن الـ Async يشتغل صح").
- الدفء المهني: حافظ على علاقة مهنية ودية بحتة، داعمة، وتحفز الطالب على التعلم دون مبالغة في العاطفة.

4. العمق المهيكل والمعرفي (Structured Depth):
للإجابات الطويلة، إياك واستخدام نصوص متصلة ومملة (Walls of text). بدلاً من ذلك استخدم:
- تنسيق Markdown متقدم (Bold للكلمات المفتاحية، كتل برمجية Code blocks نظيفة للمقاطع البرمجية).
- معادلات رياضية (Math/LaTeX) واضحة إذا استدعى الأمر.
- استخدم أمثلة واقعية مستوحاة من بيئة الكلية لتسهيل الشرح (مثل ربط المفاهيم بمبنى الـ IT أو التسجيل).
- مقدمة قوية وجذابة من سطر واحد، وعناوين عريضة للمواضيع الفرعية.
- اختم دائماً بـ "نصيحة احترافية" (Pro-tip) أو ملخص سريع في النهاية.

5. الخاتمة المميزة (Signature Closing):
- أنهِ كلامك احيانا وليس دائما, اي عند الحاجه بعبارة تشجيعية قصيرة جداً (سطر واحد) تترك الطالب يشعر بالثقة والقدرة على الإنجاز العالي.

6. DYNAMIC LINGUISTIC & CONTEXT RULE:
- STRICT LANGUAGE MATCHING (قاعدة حاسمة): بدقة متناهية، يجب أن تطابق لغة ردك مع لغة الطالب الأساسية. إذا كتب الطالب بالإنجليزية، يتم إلغاء وتجاوز كافة قواعد النبرة والترحيب العربية فوراً، وتلتزم بالرد بالإنجليزية فقط.
- Maintain strict academic preservation: Since course materials, slides, and exams are in English, always generate core summaries, technical concepts, flashcards, and practice questions in clear, professional English so they match the student's exam context.
- Adapt fluidly to the student's prompt: If the student asks a question or requests an explanation in Arabic (e.g., 'اشرحلي هاد بالعربي'), seamlessly explain the concepts using a friendly, simplified, and highly digestible Jordanian/Arabic conversational style.
- Keep technical terms intact: Never translate core computer science terms (e.g., Pointers, Thread, B-Tree, Middleware) into awkward Arabic. Keep the technical terms in English while embedding them naturally within the Arabic explanations.
- Be context-aware: If the student explicitly demands a specific language configuration (e.g., 'Summarize in English and explain the key points in Arabic'), strictly follow their direct intent with absolute flexibility.
- Stop Greeting Repetition: Only greet the user (e.g., say 'يا هلا بك' or other greetings) if the user's prompt is a greeting (e.g., 'مرحبا', 'هلا', 'سلام', 'hi', 'hello') or at the very beginning of the chat session. Never include or repeat greetings in subsequent replies to technical, informational, or follow-up questions.
- Compact Masterclass Layout: Inspect the prompt. If the prompt contains a context block (e.g., starting with '[السياق:') indicating it comes from a video/masterclass view, or if the user's question is a simple, quick chat question (e.g., 'هل بخلصه بساعتين؟'), respond with extremely concise, punchy, and brief text (short sentences, limited lines) suitable for a compact side-by-side layout, avoiding long essays.`;
// Model fallback chain — optimized for speed and stability.
// The SDK natively handles the routing (v1beta) for the 1.5 models.
const MODEL_FALLBACK_CHAIN = [
    'gemini-flash-latest',       // Priority 1: Fast and available
    'gemini-2.5-flash',          // Priority 2: Safe fallback
    'gemini-pro-latest'          // Priority 3: Heavier fallback
]

function shouldFallback(error: any): boolean {
    const msg = error?.message || ''
    const status = error?.status ?? 0
    return (
        status === 503 ||
        status === 429 ||
        status === 404 || // Add 404 so missing models correctly trigger a fallback
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
    console.log("--- API CHAT ROUTE START ---")
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'API key not configured on server.' },
                { status: 500 }
            )
        }

        const body = await req.json()
        const { prompt } = body

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { success: false, error: 'A valid prompt string is required.' },
                { status: 400 }
            )
        }

        // The SDK natively handles routing for standard models
        const genAI = new GoogleGenerativeAI(apiKey)
        const fullPrompt = `${SYSTEM_INSTRUCTIONS}\n\nالطلب: ${prompt}`

        let result: any = null
        let lastError: any = null

        // Try each model in the fallback chain
        for (const modelName of MODEL_FALLBACK_CHAIN) {
            try {
                console.log(`[AI] Attempting model: ${modelName}`)
                const model = genAI.getGenerativeModel({ model: modelName })

                // Each model gets up to 2 quick retries (for brief spikes)
                for (let attempt = 0; attempt < 2; attempt++) {
                    try {
                        result = await model.generateContent(fullPrompt)
                        console.log(`[AI] Success with model: ${modelName} (attempt ${attempt + 1})`)
                        break // Break inner retry loop
                    } catch (err: any) {
                        if (shouldFallback(err) && attempt < 1) {
                            const delay = 1500 * (attempt + 1) // 1.5s, 3s
                            console.warn(`[AI] ${modelName} overloaded, retrying in ${delay}ms...`)
                            await new Promise(r => setTimeout(r, delay))
                        } else {
                            throw err // Escalate to outer catch to try next model
                        }
                    }
                }

                if (result) break // Break outer model-chain loop on success

            } catch (err: any) {
                lastError = err
                if (shouldFallback(err)) {
                    console.warn(`[AI] Model ${modelName} unavailable, trying next fallback...`)
                    continue // Try the next model in the chain
                }
                throw err // Non-transient error (e.g. auth failure) — stop immediately
            }
        }

        if (!result) {
            throw lastError ?? new Error('All AI models are currently unavailable.')
        }

        let text = ''
        try {
            text = result.response.text()
        } catch (e) {
            console.error("Content blocked or empty:", e)
            throw new Error('عذراً، لم أتمكن من توليد إجابة لهذا السؤال، قد يكون المحتوى محظوراً أو غير متوفر.')
        }

        return NextResponse.json({ success: true, data: text })

    } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        const status = error?.status ?? 500
        console.error("FULL API ERROR:", error)

        // Return user-friendly error codes so the frontend can show smart messages
        const isOverloaded = message.includes('503') || message.includes('high demand')
        const isRateLimit = message.includes('429') || message.includes('Too Many')
        const errorCode = isOverloaded ? 'OVERLOADED' : isRateLimit ? 'RATE_LIMIT' : 'UNKNOWN'

        return NextResponse.json(
            { success: false, error: message, errorCode },
            { status: 500 }
        )
    }
}
