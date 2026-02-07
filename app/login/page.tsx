
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Login failed')
            }

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
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Noise Overlay */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0 opacity-100" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                        Welcome Back
                    </h1>
                    <p className="text-white/60 mt-2 text-sm font-medium tracking-wide">Log in to continue matching</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 text-red-300 text-sm p-4 border-2 border-red-500/50 text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all font-medium"
                                placeholder="you@college.edu"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#CCFF00] text-black font-black py-4 uppercase tracking-widest hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[4px_4px_0px_#fff] hover:shadow-[8px_8px_0px_#fff]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <p className="text-center text-white/40 text-sm font-medium">
                        New here?{' '}
                        <Link href="/register" className="text-[#CCFF00] hover:underline transition-all underline-offset-4 font-bold">
                            Create an account
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
