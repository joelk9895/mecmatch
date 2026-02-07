
import { z } from 'zod'

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    age: z.coerce.number().min(18, 'You must be at least 18 years old'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    interestedIn: z.enum(['MALE', 'FEMALE', 'BOTH', 'FRIENDS']),
    image: z.string().min(1, 'Profile photo is required'),
    instagram: z.string().min(1, 'Instagram handle is required'),
})
