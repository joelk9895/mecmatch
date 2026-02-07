
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, Instagram } from 'lucide-react'

type Match = {
    id: string
    type: string
    user: {
        id: string
        name: string
        image: string
        instagram?: string
    }
    lastMessage: string
}

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/matches')
            .then(res => res.json())
            .then(data => {
                if (data.matches) setMatches(data.matches)
                setLoading(false)
            })
    }, [])

    const openInstagram = (e: React.MouseEvent, username: string) => {
        e.preventDefault()
        e.stopPropagation()
        // Remove @ if present
        const cleanUsername = username.replace('@', '')
        window.open(`https://instagram.com/${cleanUsername}`, '_blank')
    }

    if (loading) return (
        <div className="flex h-full items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
        </div>
    )

    return (
        <div className="h-full py-4">
            <h1 className="text-2xl font-black mb-6 px-2 text-white tracking-tight uppercase">Matches</h1>

            {matches.length === 0 ? (
                <div className="text-center text-white/40 mt-10 px-4">
                    <p className="font-bold text-white/60 text-lg">No matches yet.</p>
                    <p className="text-sm mt-2">Keep swiping to find new people!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {matches.map((match, i) => (
                        <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-black/40 backdrop-blur-xl border-2 border-white/10 p-4 flex items-center gap-4 hover:border-[#CCFF00]/50 hover:shadow-[4px_4px_0px_rgba(204,255,0,0.3)] transition-all group"
                        >
                            <Link href={`/app/matches/${match.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="relative">
                                    <div
                                        className="w-14 h-14 bg-cover bg-center border-2 border-white/20"
                                        style={{ backgroundImage: `url(${match.user.image || '/placeholder.jpg'})` }}
                                    />
                                    {/* Type Indicator */}
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center border-2 border-black shadow-sm ${match.type === 'FRIEND' ? 'bg-[#00F0FF]' : 'bg-[#FF0099]'}`}>
                                        <span className="text-xs">{match.type === 'FRIEND' ? '🤝' : '❤️'}</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-white group-hover:text-[#CCFF00] transition-colors">{match.user.name}</h3>
                                    <p className="text-white/50 text-sm truncate font-medium">{match.lastMessage}</p>
                                </div>
                            </Link>

                            {/* Instagram Button */}
                            {match.user.instagram && (
                                <button
                                    onClick={(e) => openInstagram(e, match.user.instagram!)}
                                    className="p-3 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:scale-110 transition-transform shadow-[2px_2px_0px_#fff]"
                                    title={`Open ${match.user.instagram} on Instagram`}
                                >
                                    <Instagram className="w-5 h-5" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
