
'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion'
import { X, Heart, Loader2, Instagram } from 'lucide-react'

// Types
type User = {
    id: string
    name: string
    age: number
    bio: string
    image: string
    instagram?: string
    hasFriendedMe?: boolean
}

export default function SwipeDeck() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch users
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.users) setUsers(data.users)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const removeUser = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id))
    }

    const handleSwipe = async (direction: 'left' | 'right' | 'friend', userId: string) => {
        removeUser(userId)

        try {
            await fetch('/api/swipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toId: userId, direction: direction.toUpperCase() })
            })
        } catch (e) {
            console.error('Swipe failed', e)
        }
    }

    if (loading) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8">
                <div className="bg-rose-50 p-6 rounded-full mb-4 animate-bounce-slow">
                    <Heart className="w-12 h-12 text-rose-500/30 fill-rose-500/20" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">No more matches</h2>
                <p className="text-gray-500 mt-2">Check back later for more people!</p>
            </div>
        )
    }

    return (
        <div className="relative h-[75vh] w-full mt-4 perspecitve-1000">
            {users.slice().reverse().map((user, index) => {
                const isTop = index === users.length - 1
                return (
                    <Card
                        key={user.id}
                        user={user}
                        isTop={isTop}
                        onSwipe={(dir) => handleSwipe(dir, user.id)}
                    />
                )
            })}

            {/* Control Buttons */}
            <div className="absolute bottom-[-80px] left-0 w-full flex justify-center items-center gap-6 z-50">
                <button
                    onClick={() => handleSwipe('left', users[users.length - 1].id)}
                    className="w-14 h-14 bg-white rounded-full shadow-lg text-red-500 flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <X className="w-6 h-6" />
                </button>

                <button
                    onClick={() => handleSwipe('friend', users[users.length - 1].id)}
                    className="w-12 h-12 bg-white rounded-full shadow-lg text-blue-500 flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <span className="text-2xl">🤝</span>
                </button>

                <button
                    onClick={() => handleSwipe('right', users[users.length - 1].id)}
                    disabled={users[users.length - 1].hasFriendedMe}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform ${users[users.length - 1].hasFriendedMe ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-green-500 hover:scale-110'}`}
                >
                    <Heart className="w-6 h-6 fill-current" />
                </button>
            </div>
        </div>
    )
}

function Card({ user, isTop, onSwipe }: { user: User, isTop: boolean, onSwipe: (dir: 'left' | 'right' | 'friend') => void }) {
    const x = useMotionValue(0)
    const controls = useAnimation()

    const rotate = useTransform(x, [-200, 200], [-15, 15])
    const opacity = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8])
    const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95])

    // Lift effect on drag
    const shadow = useTransform(
        x,
        [-150, 0, 150],
        ["0 20px 50px rgba(0,0,0,0.1)", "0 10px 30px rgba(0,0,0,0.05)", "0 20px 50px rgba(0,0,0,0.1)"]
    )

    const likeOpacity = useTransform(x, [50, 150], [0, 1])
    const nopeOpacity = useTransform(x, [-150, -50], [1, 0])

    // If they friended me, disable Right Swipe (Like)
    const canLike = !user.hasFriendedMe

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const threshold = 100
        if (info.offset.x > threshold) {
            if (canLike) {
                await controls.start({ x: 500, rotate: 20, transition: { duration: 0.2 } }) // Fly off right
                onSwipe('right')
            } else {
                // Bounce back if swipe disabled
                controls.start({ x: 0, opacity: 1, rotate: 0, scale: 1 })
            }
        } else if (info.offset.x < -threshold) {
            await controls.start({ x: -500, rotate: -20, transition: { duration: 0.2 } }) // Fly off left
            onSwipe('left')
        } else {
            controls.start({ x: 0, opacity: 1, rotate: 0, scale: 1 })
        }
    }

    return (
        <motion.div
            style={{
                x,
                rotate: isTop ? rotate : 0,
                opacity,
                scale,
                boxShadow: shadow,
                zIndex: isTop ? 50 : 10
            }}
            drag={isTop ? 'x' : false} // Only top card is draggable
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            whileTap={{ cursor: 'grabbing', scale: 1.02 }}
            className={`absolute top-0 left-0 w-full h-full rounded-[32px] overflow-hidden bg-white ${isTop ? 'cursor-grab' : 'pointer-events-none'}`}
        >
            {/* Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${user.image || '/placeholder.jpg'})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />

            {/* Friend Request Indicator */}
            {user.hasFriendedMe && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg z-20 border border-white/20">
                    <p className="text-white text-sm font-bold flex items-center gap-2">
                        <span>🤝</span> Wants to be friends
                    </p>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-bold tracking-tight">{user.name}, {user.age}</h2>
                    <button
                        onClick={() => onSwipe('friend')}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        className="bg-blue-500/20 hover:bg-blue-500/40 backdrop-blur-md p-2 rounded-full transition-colors border border-blue-400/30"
                        title="Add as Friend"
                    >
                        <span className="text-2xl">🤝</span>
                    </button>
                </div>
                <p className="text-white/90 text-lg font-medium line-clamp-2 leading-relaxed opacity-90">{user.bio}</p>
                {user.instagram && (
                    <a
                        href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/30 transition-colors pointer-events-auto"
                        onPointerDownCapture={(e) => e.stopPropagation()} // Prevent drag when clicking
                    >
                        <Instagram className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold text-sm">@{user.instagram.replace('@', '')}</span>
                    </a>
                )}
            </div>

            {/* Swipe Indicators (Overlay) */}
            {isTop && (
                <>
                    {canLike && (
                        <motion.div
                            style={{ opacity: likeOpacity }}
                            className="absolute top-8 left-8 bg-green-500/20 backdrop-blur-md border border-green-400 rounded-xl px-4 py-2 transform -rotate-12 shadow-lg"
                        >
                            <span className="text-green-400 text-2xl font-bold uppercase tracking-widest text-shadow-sm">LIKE</span>
                        </motion.div>
                    )}
                    <motion.div
                        style={{ opacity: nopeOpacity }}
                        className="absolute top-8 right-8 bg-red-500/20 backdrop-blur-md border border-red-400 rounded-xl px-4 py-2 transform rotate-12 shadow-lg"
                    >
                        <span className="text-red-400 text-2xl font-bold uppercase tracking-widest text-shadow-sm">NOPE</span>
                    </motion.div>
                </>
            )}
        </motion.div>
    )
}
