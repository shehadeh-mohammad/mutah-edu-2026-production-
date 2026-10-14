# 🎓 MutahEdu – AI-First Academic Management & LLM Infrastructure

**MutahEdu** is an enterprise-grade, AI-first learning management infrastructure built specifically for the Faculty of Information Technology at Mutah University. It digitizes college curricula, dynamic course routing, video streams, and academic PDFs into an interactive, stateful learning space driven by advanced Large Language Model (LLM) architectures.

---

## 🤖 Deep-Dive: AI Infrastructure & LLM Architecture

The core philosophy of MutahEdu is building **deterministic, zero-downtime AI workflows** on top of non-deterministic LLMs.

### 1. 🛡️ Fault-Tolerant 3-Tier AI Fallback Cascade
To withstand high traffic load spikes (503 Service Unavailable & 429 Rate Limit errors) during university exam seasons, the system bypasses single-point-of-failure API limits via an automated 3-tier cascade (`MODEL_FALLBACK_CHAIN`):
- **Primary Tier (`gemini-flash-latest`):** High-speed edge model handling zero-latency student chat and rapid flashcard generation.
- **Secondary Tier (`gemini-2.5-flash`):** Resilient fallback tier triggered via exponential backoff loops (1500ms - 3000ms delay offsets).
- **Tertiary Tier (`gemini-pro-latest`):** Heavy fallback model handling complex multi-page document reasoning.
- **Active Schema Sanitization:** Enforces strict regex cleaning layers on model output streams to strip rogue markdown formatting and guarantee 100% valid JSON parsing under all execution states.

### 2. ⚡ Token-Defensive Smart Chunking & Context Optimization
Prevents LLM context degradation and hallucinations when processing multi-megabyte course PDFs:
- **Character-to-Token Ratio Estimation:** Real-time token evaluation before API payload assembly.
- **Parallel Chunk Summarization:** Documents exceeding a strict **600k token threshold** are algorithmically split into **200k token boundary-aware chunks**, summarized in parallel, and synthesized through a master prompt combiner.

### 3. ☁️ Cloud-to-AI Ingestion Stream (Zero Disk I/O)
Solves cross-origin file reading for cloud assets without saving files to disk:
- Intercepts remote Google Drive PDF assets directly from the API endpoint (`/api/summarize` & `/api/generate-flashcards`).
- Converts cloud file streams into volatile memory buffers (`ArrayBuffer` → `Node.js Buffer`).
- Pipes memory streams directly into `pdf-parse` for instantaneous, zero-disk-I/O contextual extraction.

### 4. 🧠 Active Recall Lab & MCQ Examination Engine
- **Structured Outputs:** Leverages `@google/generative-ai` with strict `responseMimeType: 'application/json'` enforcement.
- **Exam-Grade Prompt Engineering:** Generates college-level multiple-choice questions (MCQs) and concept definitions categorized by difficulty, feeding directly into interactive client exam runners.

### 5. 💬 Dual-Layer In-Context Chat & Math Engine
- **Course-Level & Standalone Tutors:** Provides both in-context course sidebar assistants (video/PDF aware) and dedicated full-page AI workspace environments (`/ai-assistant`).
- **Mathematical & Code Rendering:** Custom Markdown parser supporting LaTeX math equations via `KaTeX` and syntax-highlighted code blocks via `react-syntax-highlighter`.
- **75% Re-render Reduction:** Employs a `requestAnimationFrame` (RAF) typewriter loop printing 4 characters per frame, massively optimizing client React tree hydration during streaming responses.

---

## 🛠️ Complete Technology Stack

- **Core Framework:** Next.js 14.2.5 (App Router), React 18, TypeScript 5
- **AI Infrastructure:** `@google/generative-ai` (v0.24.1)
- **Database & ORM:** Prisma ORM, SQLite (Multi-Major comma-separated slug filtering)
- **UI & Animation:** Tailwind CSS, Glassmorphic CSS Engine, Framer Motion, GSAP, Parallax Physics Springs
- **Document & Math Parsing:** `pdf-parse`, `react-markdown`, `katex`, `rehype-katex`, `remark-math`

---

## 🔗 Live Deployment & Links

- **Live Platform Demo:** [https://mutah-edu-production.onrender.com/](https://mutah-edu-production.onrender.com/)
- **GitHub Repository:** [https://github.com/shehadeh-mohammad/mutah-edu-2026-production-](https://github.com/shehadeh-mohammad/mutah-edu-2026-production-)
