
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value

    if (req.nextUrl.pathname.startsWith('/app')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
            await jwtVerify(token, secret)
        } catch (e) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/app/:path*'],
}
