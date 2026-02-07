
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

        const matches = await prisma.match.findMany({
            where: {
                OR: [{ user1Id: userId }, { user2Id: userId }]
            },
            include: {
                user1: true,
                user2: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formattedMatches = matches.map(match => {
            const otherUser = match.user1Id === userId ? match.user2 : match.user1
            return {
                id: match.id,
                type: match.type,
                user: {
                    id: otherUser.id,
                    name: otherUser.name,
                    image: otherUser.image,
                    instagram: otherUser.instagram,
                },
                lastMessage: match.messages[0]?.content || 'New Match!'
            }
        })

        return NextResponse.json({ matches: formattedMatches })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
