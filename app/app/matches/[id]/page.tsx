
'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

type Message = {
    id: string
    senderId: string
    content: string
    createdAt: string
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: matchId } = use(params)
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [otherUser, setOtherUser] = useState<{ name: string, image: string } | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }
        setCurrentUserId(getCookie('user_id') || null)
    }, [])

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages?matchId=${matchId}`)
            const data = await res.json()
            if (data.messages) setMessages(data.messages)
            if (data.otherUser) setOtherUser(data.otherUser)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [matchId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const tempMessage = {
            id: 'temp-' + Date.now(),
            senderId: currentUserId || '',
            content: newMessage,
            createdAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, tempMessage])
        setNewMessage('')

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, content: tempMessage.content })
            })
            fetchMessages()
        } catch (e) {
            console.error('Send failed')
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center gap-4 py-4 px-2 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <Link href="/app/matches" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                    {otherUser && (
                        <div
                            className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200"
                            style={{ backgroundImage: `url(${otherUser.image || '/placeholder.jpg'})` }}
                        />
                    )}
                    <h2 className="font-bold text-lg text-gray-900 tracking-tight">
                        {otherUser ? otherUser.name : 'Loading...'}
                    </h2>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4 px-2 scrollbar-none">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 mt-10">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Send className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Say hi to {otherUser?.name || 'your friend'}!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-5 py-3 text-[15px] shadow-sm ${isMe
                                        ? 'bg-rose-600 text-white rounded-br-none'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    <p className="leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="py-4 flex gap-3 items-center">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 text-gray-900 placeholder-gray-400 font-medium shadow-sm transition-all"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3.5 bg-rose-600 rounded-full hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-600/20 transform hover:-translate-y-0.5"
                >
                    <Send className="w-5 h-5 text-white" />
                </button>
            </form>
        </div>
    )
}
