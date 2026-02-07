'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Check } from 'lucide-react'

export default function OnboardingGuide() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check session storage
        const hasSeen = sessionStorage.getItem('hasSeenGuide')
        if (!hasSeen) {
            // Small delay for smooth entrance
            setTimeout(() => setIsVisible(true), 500)
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        sessionStorage.setItem('hasSeenGuide', 'true')
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/50 rounded-full blur-3xl -mr-10 -mt-10" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -ml-10 -mb-10" />

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">How to Match</h2>
                            <p className="text-gray-500 mb-8 font-medium">Find your type of connection.</p>

                            <div className="space-y-6">
                                {/* Like Row */}
                                <div className="flex items-center gap-4 text-left group">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Swipe Right</h3>
                                        <p className="text-sm text-gray-500">To like & date someone ❤️</p>
                                    </div>
                                </div>

                                {/* Friend Row */}
                                <div className="flex items-center gap-4 text-left group">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <span className="text-2xl">🤝</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Tap Friend</h3>
                                        <p className="text-sm text-gray-500">To make a new friend</p>
                                    </div>
                                </div>

                                {/* Pass Row */}
                                <div className="flex items-center gap-4 text-left group">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                        <X className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Swipe Left</h3>
                                        <p className="text-sm text-gray-500">To pass for now</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2"
                            >
                                Got it
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
