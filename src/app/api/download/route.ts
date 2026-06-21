import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const fileUrl = searchParams.get('fileUrl')
    const fileName = searchParams.get('fileName') || 'download.pdf'

    if (!fileUrl) {
        return NextResponse.json({ error: 'Missing fileUrl parameter' }, { status: 400 })
    }

    // Redirect external URLs (Google Drive, etc.) directly to bypass local file system checks
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        return NextResponse.redirect(fileUrl)
    }

    try {
        // Ensure path traversal is prevented
        const normalizedUrl = path.normalize(fileUrl).replace(/^(\.\.[\/\\])+/, '')
        const filePath = path.join(process.cwd(), 'public', normalizedUrl)
        
        if (!fs.existsSync(filePath)) {
            const html = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>الملف غير موجود</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                        .container { background: rgba(255,255,255,0.05); padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); max-width: 400px; }
                        h1 { color: #f87171; font-size: 24px; margin-bottom: 10px; }
                        p { color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height: 1.6; }
                        button { background: #38bdf8; border: none; padding: 10px 20px; border-radius: 8px; color: #0f172a; font-weight: bold; cursor: pointer; transition: 0.2s; }
                        button:hover { background: #7dd3fc; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>عذراً، الملف غير متوفر</h1>
                        <p>يبدو أن الملف الذي تحاول تحميله إما غير موجود على الخادم المحلي أو تم نقله. يرجى التواصل مع المسؤول.</p>
                        <button onclick="window.history.back()">العودة للمساق</button>
                    </div>
                </body>
                </html>
            `;
            return new NextResponse(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        const fileBuffer = fs.readFileSync(filePath)

        const headers = new Headers()
        // Force attachment to bypass IDM and trigger native browser download
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
        headers.set('Content-Type', 'application/pdf')
        headers.set('X-Content-Type-Options', 'nosniff')

        return new NextResponse(fileBuffer, {
            status: 200,
            headers,
        })
    } catch (error) {
        console.error('Download API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
