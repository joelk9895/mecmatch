
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Camera, Save, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { upload } from '@vercel/blob/client'
import imageCompression from 'browser-image-compression'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Edit State
    const [bio, setBio] = useState('')
    const [image, setImage] = useState('')
    const [instagram, setInstagram] = useState('')
    const [interestedIn, setInterestedIn] = useState('FEMALE')

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user)
                    setBio(data.user.bio || '')
                    setImage(data.user.image || '')
                    setInstagram(data.user.instagram || '')
                    setInterestedIn(data.user.interestedIn)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
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

            const newBlob = await upload(compressedFile.name, compressedFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            })

            setImage(newBlob.url)
        } catch (err) {
            console.error('Upload failed', err)
            alert('Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio, image, interestedIn, instagram })
            })
            const data = await res.json()
            if (data.user) setUser(data.user)
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex h-full items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
        </div>
    )

    if (!user) return null

    return (
        <div className="pb-8">
            <div className="flex justify-between items-center py-6 px-2">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Profile</h1>
                <button
                    onClick={handleLogout}
                    className="p-3 text-white/60 hover:text-red-400 hover:bg-red-500/20 border-2 border-white/20 hover:border-red-500/50 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border-2 border-white/10 p-6 shadow-[8px_8px_0px_rgba(204,255,0,0.3)] relative overflow-hidden">
                {/* Header/Photo Section */}
                <div className="flex flex-col items-center relative z-10">
                    <div
                        className="relative group cursor-pointer mb-4"
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        <div
                            className="w-28 h-28 bg-cover bg-center border-4 border-[#CCFF00] shadow-[4px_4px_0px_#fff] relative"
                            style={{ backgroundImage: `url(${image || '/placeholder.jpg'})` }}
                        >
                            {uploading && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-[#CCFF00] animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-[#CCFF00]" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />

                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{user.name}, {user.age}</h2>
                    <div className="inline-block bg-white/10 border-2 border-white/20 px-4 py-1 text-xs font-bold text-white/70 mt-2 uppercase tracking-widest">
                        {user.gender}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="mt-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all h-24 resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Instagram</label>
                        <input
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all"
                            placeholder="@username"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Interested In</label>
                        <div className="relative">
                            <select
                                value={interestedIn}
                                onChange={(e) => setInterestedIn(e.target.value)}
                                className="w-full bg-white/5 border-2 border-white/20 px-4 py-4 text-white focus:outline-none focus:border-[#CCFF00] focus:bg-white/10 transition-all appearance-none"
                            >
                                <option value="MALE" className="bg-[#001530]">Men</option>
                                <option value="FEMALE" className="bg-[#001530]">Women</option>
                                <option value="BOTH" className="bg-[#001530]">Everyone</option>
                                <option value="FRIENDS" className="bg-[#001530]">Friends</option>
                            </select>
                            <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <p className="text-xs text-center text-white/40 mb-4 tracking-wide">
                            Photos are compressed before upload to save bandwidth.
                        </p>
                        <button
                            onClick={handleSave}
                            disabled={saving || uploading}
                            className="w-full bg-[#CCFF00] text-black font-black py-4 uppercase tracking-widest hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform shadow-[4px_4px_0px_#fff] hover:shadow-[8px_8px_0px_#fff] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
