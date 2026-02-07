
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody

    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN

        if (!token) {
            throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
        }

        const jsonResponse = await handleUpload({
            body,
            request,
            token, // Explicitly pass token
            onBeforeGenerateToken: async (pathname) => {
                // Allow public uploads for registration
                // In a real app, you might want to add rate limiting or a temporary session token here
                // For now, we'll allow it but log it

                const cookieStore = await cookies()
                const token = cookieStore.get('token')?.value
                let userId = 'guest_registration'

                if (token) {
                    try {
                        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
                        const { payload } = await jwtVerify(token, secret)
                        userId = payload.userId as string
                    } catch (e) {
                        console.log('[Upload API] Invalid token, proceeding as guest')
                    }
                }

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                    tokenPayload: JSON.stringify({ userId }),
                }
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Optional: Could update user db here with blob.url if webhook configured
                console.log('Blob uploaded', blob.url)
            },
        })

        return NextResponse.json(jsonResponse)
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        )
    }
}
