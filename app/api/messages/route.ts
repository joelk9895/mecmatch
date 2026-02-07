
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export const dynamic = 'force-dynamic'

// Helper to get current user
async function getCurrentUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload.userId as string
    } catch {
        return null
    }
}

export async function GET(req: Request) {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) return NextResponse.json({ error: 'Missing matchId' }, { status: 400 })

    // Verify user is part of match
    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { user1: true, user2: true }
    })

    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
        where: { matchId },
        orderBy: { createdAt: 'asc' }
    })

    const otherUser = match.user1Id === userId ? match.user2 : match.user1

    return NextResponse.json({
        messages,
        otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image
        }
    })
}

export async function POST(req: Request) {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { matchId, content } = await req.json()
    if (!matchId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const receiverId = match.user1Id === userId ? match.user2Id : match.user1Id

    const message = await prisma.message.create({
        data: {
            matchId,
            senderId: userId,
            receiverId,
            content
        }
    })

    return NextResponse.json({ message })
}
