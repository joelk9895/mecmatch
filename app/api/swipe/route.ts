
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
        const { payload } = await jwtVerify(token, secret)
        const userId = payload.userId as string

        const { toId, direction } = await req.json()

        if (!toId || !direction) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // Record swipe
        // Use upsert to prevent duplicates if user swipes multiple times (shouldn't happen in UI but good for safety)
        await prisma.swipe.upsert({
            where: {
                fromId_toId: {
                    fromId: userId,
                    toId: toId
                }
            },
            update: { direction },
            create: {
                fromId: userId,
                toId,
                direction
            }
        })

        let isMatch = false

        // Check for match
        if (direction === 'RIGHT' || direction === 'FRIEND') {
            const otherSwipe = await prisma.swipe.findUnique({
                where: {
                    fromId_toId: {
                        fromId: toId,
                        toId: userId
                    }
                }
            })

            // Match if other user swiped RIGHT or FRIEND
            if (otherSwipe && (otherSwipe.direction === 'RIGHT' || otherSwipe.direction === 'FRIEND')) {
                // It's a match!
                isMatch = true

                // Check if match already exists
                const existingMatch = await prisma.match.findFirst({
                    where: {
                        OR: [
                            { user1Id: userId, user2Id: toId },
                            { user1Id: toId, user2Id: userId }
                        ]
                    }
                })

                if (!existingMatch) {
                    // Determine Match Type
                    const isFriendMatch = direction === 'FRIEND' || otherSwipe.direction === 'FRIEND'

                    await prisma.match.create({
                        data: {
                            user1Id: userId,
                            user2Id: toId,
                            type: isFriendMatch ? 'FRIEND' : 'DATE'
                        }
                    })
                }
            }
        }

        return NextResponse.json({ success: true, match: isMatch })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
