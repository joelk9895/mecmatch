
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Loader2, ArrowRight, ArrowLeft, Camera } from 'lucide-react'
import { registerSchema } from '@/lib/schemas'
import { upload } from '@vercel/blob/client'
import imageCompression from 'browser-image-compression'

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
        gender: 'MALE',
        interestedIn: 'FEMALE',
        bio: '',
        image: '',
        instagram: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
            }
            const compressedFile = await imageCompression(file, options)

            const filename = `${Date.now()}-${compressedFile.name}`
            const newBlob = await upload(filename, compressedFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            })

            setFormData(prev => ({ ...prev, image: newBlob.url }))
        } catch (err) {
            console.error('Upload failed', err)
            setError('Failed to upload image. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleNext = () => {
        setError('')

        if (step === 1) {
            const step1Schema = registerSchema.pick({ name: true, email: true, password: true })
            const result = step1Schema.safeParse(formData)
            if (!result.success) {
                setError(result.error.issues[0]?.message || "Invalid input")
                return
            }
            setStep(2)
        } else if (step === 2) {
            if (!formData.age || !formData.gender || !formData.interestedIn || !formData.instagram) {
                setError("Please fill out all fields")
                return
            }
            if (Number(formData.age) < 18) {
                setError("You must be at least 18 years old")
                return
            }
            setStep(3)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = registerSchema.safeParse(formData)
        if (!result.success) {
            setError(result.error.issues[0]?.message || "Invalid input")
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            })

            router.push('/app')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#001530] relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#FF0099]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00F0FF]/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Noise Overlay */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0 opacity-100" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] bg-black/40 backdrop-blur-xl border-2 border-white/10 p-10 shadow-[8px_8px_0px_rgba(204,255,0,0.3)] relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="bg-[#CCFF00] p-4 mb-6 shadow-[4px_4px_0px_#fff]"
                        >
                            <Heart className="w-8 h-8 text-black fill-black" strokeWidth={2} />
                        </motion.div>
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                        Create Account
                    </h1>

                    {/* Step Progress */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 transition-all duration-300 ${s <= step
                                    ? 'bg-[#CCFF00] w-10'
                                    : 'bg-white/20 w-6'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-white/50 mt-3 text-sm font-medium tracking-wide">Step {step} of 3</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 text-red-300 text-sm p-4 border-2 border-red-500/50 text-center font-bold">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all font-medium"
                                        placeholder="John Doe"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all font-medium"
                                        placeholder="you@college.edu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Age</label>
                                    <input
                                        name="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all font-medium"
                                        placeholder="21"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Instagram</label>
                                    <input
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all font-medium"
                                        placeholder="@username"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">I am a</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all"
                                        >
                                            <option value="MALE" className="bg-[#001530]">Male</option>
                                            <option value="FEMALE" className="bg-[#001530]">Female</option>
                                            <option value="OTHER" className="bg-[#001530]">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Interested in</label>
                                        <select
                                            name="interestedIn"
                                            value={formData.interestedIn}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all"
                                        >
                                            <option value="FEMALE" className="bg-[#001530]">Women</option>
                                            <option value="MALE" className="bg-[#001530]">Men</option>
                                            <option value="BOTH" className="bg-[#001530]">Everyone</option>
                                            <option value="FRIENDS" className="bg-[#001530]">Friends</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="space-y-6 text-center"
                            >
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest">Profile Photo (Required)</label>
                                    <div
                                        className="w-32 h-32 mx-auto bg-white/5 border-2 border-white/20 relative cursor-pointer group flex items-center justify-center overflow-hidden hover:border-[#CCFF00] transition-colors"
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                    >
                                        {formData.image ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${formData.image})` }} />
                                        ) : (
                                            <Camera className="w-10 h-10 text-white/40 group-hover:text-[#CCFF00] group-hover:scale-110 transition-all" />
                                        )}

                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <p className="text-xs text-white/40">
                                        Tap to upload. We believe in face-to-face connections.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-3 pt-2">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="flex-1 bg-white/10 text-white font-bold py-4 border-2 border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex-[2] w-full bg-[#CCFF00] text-black font-black py-4 uppercase tracking-widest hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform flex items-center justify-center gap-2 shadow-[4px_4px_0px_#fff] hover:shadow-[8px_8px_0px_#fff]"
                            >
                                Next Step
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || uploading || !formData.image}
                                className="flex-[2] w-full bg-[#FF0099] text-white font-black py-4 uppercase tracking-widest hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[4px_4px_0px_#fff] hover:shadow-[8px_8px_0px_#fff]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
                                {!loading && <Heart className="w-5 h-5 fill-white" />}
                            </button>
                        )}
                    </div>

                    <p className="text-center text-white/40 text-sm font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#CCFF00] hover:underline transition-all underline-offset-4 font-bold">
                            Sign in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
