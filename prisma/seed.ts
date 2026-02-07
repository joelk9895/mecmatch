
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password', 10)

    // Create Users
    const users = [
        {
            email: 'alex@example.com',
            name: 'Alex Johnson',
            age: 21,
            gender: 'MALE',
            interestedIn: 'FEMALE',
            bio: 'Computer Science major. Love hiking and coffee.',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60',
        },
        {
            email: 'sarah@example.com',
            name: 'Sarah Smith',
            age: 20,
            gender: 'FEMALE',
            interestedIn: 'MALE',
            bio: 'Art student. Always looking for the best sushi spot.',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60',
        },
        {
            email: 'mike@example.com',
            name: 'Mike Brown',
            age: 22,
            gender: 'MALE',
            interestedIn: 'FEMALE',
            bio: 'Basketball player and foodie.',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60',
        },
        {
            email: 'emily@example.com',
            name: 'Emily Davis',
            age: 19,
            gender: 'FEMALE',
            interestedIn: 'MALE',
            bio: 'Psychology major. Love reading and traveling.',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
        },
        {
            email: 'jess@example.com',
            name: 'Jessica Lee',
            age: 21,
            gender: 'FEMALE',
            interestedIn: 'MALE',
            bio: 'Music lover. Play guitar and piano.',
            image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60',
        },
        {
            email: 'chris@example.com',
            name: 'Chris Wilson',
            age: 23,
            gender: 'MALE',
            interestedIn: 'FEMALE',
            bio: 'Engineering student. Tech enthusiast.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60',
        }
    ]

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                ...user,
                passwordHash,
            },
        })
    }

    console.log('Seed data created.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
