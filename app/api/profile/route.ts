
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
        const { payload } = await jwtVerify(token, secret)
        const userId = payload.userId as string

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                age: true,
                bio: true,
                image: true,
                gender: true,
                interestedIn: true,
                instagram: true
            }
        })

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        return NextResponse.json({ user })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
        const { payload } = await jwtVerify(token, secret)
        const userId = payload.userId as string

        const body = await req.json()
        const { bio, image, interestedIn, instagram } = body

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                bio,
                image,
                interestedIn,
                instagram,
            },
        })

        return NextResponse.json({ user: updatedUser })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
