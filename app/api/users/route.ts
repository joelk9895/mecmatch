
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

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

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                swipesSent: true,
            }
        })

        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const swipedUserIds = currentUser.swipesSent.map(s => s.toId)

        // Fetch users that match criteria and haven't been swiped yet
        // Prisma 5 doesn't fully support complex filtering on relation existence in one go easily without exact same types, 
        // but basic exclusion works.
        const whereClause: any = {
            id: { notIn: [...swipedUserIds, currentUser.id] }, // Exclude self and swiped
        }

        if (currentUser.interestedIn === 'FRIENDS') {
            // Friends Mode: Show anyone else looking for friends
            whereClause.interestedIn = 'FRIENDS'
        } else {
            // Dating Mode
            // 1. Filter by their gender (if not BOTH)
            if (currentUser.interestedIn !== 'BOTH') {
                whereClause.gender = currentUser.interestedIn
            }
            // 2. Ensure they are interested in my gender (or BOTH)
            // Exclude 'FRIENDS' from dating pool
            whereClause.interestedIn = { in: [currentUser.gender, 'BOTH'] }
        }

        const potentialMatches = await prisma.user.findMany({
            where: whereClause,
            take: 20, // Limit batch size
        })

        // Check for incoming friend requests from these users
        const friendSwipes = await prisma.swipe.findMany({
            where: {
                toId: userId,
                fromId: { in: potentialMatches.map(u => u.id) },
                direction: 'FRIEND'
            },
            select: { fromId: true }
        })

        const friendRequestIds = new Set(friendSwipes.map(s => s.fromId))

        const usersWithFlags = potentialMatches.map(user => ({
            ...user,
            hasFriendedMe: friendRequestIds.has(user.id)
        }))

        return NextResponse.json({ users: usersWithFlags })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
