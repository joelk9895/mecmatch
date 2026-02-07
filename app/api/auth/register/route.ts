import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Zod Validation
        const result = registerSchema.safeParse(body)
        if (!result.success) {
            const error = result.error.issues[0].message
            return NextResponse.json({ error }, { status: 400 })
        }

        const { email, password, name, age, gender, interestedIn, image, instagram } = result.data

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                age,
                gender,
                interestedIn,
                image,
                instagram,
            },
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
