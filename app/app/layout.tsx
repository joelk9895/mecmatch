
import { Heart, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen pb-24 bg-[#001530]">
            {/* Top Bar - Dark & Bold */}
            <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#001530]/90 backdrop-blur-xl border-b border-white/10">
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                    <span className="w-3 h-3 bg-[#CCFF00] animate-pulse" />
                    MEC Match
                </h1>
                <div className="w-10 h-10 bg-white/10 border-2 border-white/20 flex items-center justify-center">
                    <span className="text-xs font-black text-white">ME</span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-20 px-4 h-full max-w-md mx-auto relative">
                {children}
            </main>

            {/* Bottom Navigation - Brutalist Island */}
            <nav className="fixed bottom-6 w-full z-50 pointer-events-none">
                <div className="max-w-[300px] mx-auto bg-black/80 backdrop-blur-xl border-2 border-white/20 shadow-[4px_4px_0px_rgba(204,255,0,0.3)] px-8 py-4 flex justify-between items-center pointer-events-auto">
                    <Link href="/app" className="p-2 text-white/60 hover:text-[#FF0099] transition-colors group">
                        <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div className="w-[2px] h-6 bg-white/20" />
                    <Link href="/app/matches" className="p-2 text-white/60 hover:text-[#CCFF00] transition-colors relative group">
                        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#CCFF00] border-2 border-black" />
                    </Link>
                    <div className="w-[2px] h-6 bg-white/20" />
                    <Link href="/app/profile" className="p-2 text-white/60 hover:text-[#00F0FF] transition-colors group">
                        <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </Link>
                </div>
            </nav>
        </div>
    )
}
