'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Globe, Zap, Heart, CheckCircle2 } from 'lucide-react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion'
import { useRef, MouseEvent, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


const MarqueeText = ({ children, direction = 1, className = "" }: { children: string, direction?: number, className?: string }) => {
  return (
    <div className={`flex overflow-hidden py-4 md:py-6 border-y-2 border-black relative z-20 ${className}`}>
      <div className="absolute inset-0 bg-black/5 z-10" />
      <motion.div
        animate={{ x: direction > 0 ? [-1000, 0] : [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-8 md:gap-12 font-black text-4xl md:text-7xl uppercase tracking-tighter"
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="flex items-center gap-4">
            {children} <span className="text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-tr from-white to-transparent opacity-50">★</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

const StaggeredText = ({ text, className = "", delay = 0 }: { text: string, className?: string, delay?: number }) => {
  const letters = Array.from(text)

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i + delay }
    })
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100
      }
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}

// Breaking Text Effect - Letters scatter on scroll
const BreakingText = ({ text, className = "" }: { text: string, className?: string }) => {
  const letters = Array.from(text)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  // Generate random scatter directions for each letter
  const scatterDirections = letters.map((_, i) => ({
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 400,
    rotate: (Math.random() - 0.5) * 180
  }))

  return (
    <motion.div
      ref={containerRef}
      style={{ overflow: "visible", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={className}
    >
      {letters.map((letter, index) => {
        const x = useTransform(scrollYProgress, [0, 0.15], [0, scatterDirections[index].x])
        const y = useTransform(scrollYProgress, [0, 0.15], [0, scatterDirections[index].y])
        const rotate = useTransform(scrollYProgress, [0, 0.15], [0, scatterDirections[index].rotate])
        const opacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 0.8, 0])
        const blur = useTransform(scrollYProgress, [0, 0.05, 0.15], [0, 2, 8])
        const filter = useMotionTemplate`blur(${blur}px)`

        return (
          <motion.span
            key={index}
            style={{ x, y, rotate, opacity, filter, display: "inline-block" }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        )
      })}
    </motion.div>
  )
}

const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const ySpring = useSpring(y, { stiffness: 150, damping: 15 })

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = (e.clientX - rect.left) * 32.5
    const mouseY = (e.clientY - rect.top) * 32.5
    const rX = (mouseY / height - 32.5 / 2) * -1
    const rY = (mouseX / width - 32.5 / 2)
    x.set(rX)
    y.set(rY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d", transform }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      <div style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  )
}

// --- PAGE ---

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const datingSectionRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const introTextRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: containerRef })

  // Background Color Steps (No interpolation)
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.08, 0.09, 0.15, 0.16, 0.55, 0.56, 0.85, 0.98, 1],
    [
      "#001530", "#001530", // Section 1: Admiral Blue
      "#CCFF00", "#CCFF00", // Section 2: Acid Green
      "#FF0099", "#FF0099", // Section 3: Hot Pink (Pinned longer)
      "#00F0FF", "#00F0FF", // Section 4: Electric Blue (Extended)
      "#050505", "#050505"  // Section 5: Black
    ]
  )

  // Text Color Steps (Matching background steps)
  const textColor = useTransform(
    scrollYProgress,
    [0, 0.08, 0.09, 0.15, 0.16, 0.55, 0.56, 0.85, 0.86, 1],
    [
      "#FFFFFF", "#FFFFFF",
      "#000000", "#000000",
      "#000000", "#000000",
      "#000000", "#000000",
      "#FFFFFF", "#FFFFFF"
    ]
  )

  // GSAP ScrollTrigger for pinned Dating Section
  useLayoutEffect(() => {
    if (!datingSectionRef.current || !heartRef.current || !contentRef.current) return

    const datingBg = document.getElementById('dating-bg')

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: datingSectionRef.current,
          start: "top top",
          end: "+=2500",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      })

      // Intro text fades out first
      tl.to(introTextRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        ease: "power2.in"
      })

      // Heart zooms massively (acts as portal opening)
      tl.to(heartRef.current, {
        scale: 80,
        duration: 2,
        ease: "power2.inOut"
      })

      // Background fades in as heart opens
      tl.to(datingBg, {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      }, "<+=0.5")

      // Content scales up and fades in (revealed from inside the heart)
      tl.to(contentRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power2.out"
      }, "-=1")

      // Hold for a moment to read
      tl.to({}, { duration: 1 })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <motion.div
      ref={containerRef}
      style={{ backgroundColor, color: textColor }}
      className="min-h-[500vh] font-sans overflow-x-hidden transition-colors duration-500 will-change-[background-color]"
    >
      {/* NOISE OVERLAY */}
      <div className="bg-noise z-50 pointer-events-none fixed inset-0 opacity-10" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[64px_64px] pointer-events-none z-0 opacity-100 mix-blend-overlay" />

      {/* NAV */}
      <nav className="fixed top-0 w-full z-40 px-6 md:px-12 lg:px-16 py-5 md:py-6 flex justify-between items-center text-white mix-blend-difference">
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="font-black text-lg md:text-xl lg:text-2xl tracking-tight group-hover:scale-105 transition-transform">MEC MATCH</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/login" className="text-xs md:text-sm font-bold uppercase tracking-widest hover:tracking-[0.2em] transition-all duration-300">
            Log In
          </Link>
          <Link href="/register" className="bg-white text-black px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm font-black uppercase tracking-wider hover:bg-[#CCFF00] hover:scale-105 transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_rgba(255,255,255,0.4)]">
            Join Now
          </Link>
        </div>
      </nav>

      {/* SECTION 1: THE HOOK (Admiral Blue) */}
      <section className="h-screen sticky top-0 flex flex-col items-center justify-center p-6 text-center perspective-[1000px] overflow-hidden">
        {/* MESH GRADIENT BG */}
        <div className="absolute inset-0 bg-[#001530] z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-6xl relative z-10">
          <StaggeredText
            text="DATING IS"
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter mix-blend-difference mb-2"
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "circOut" }}
            className="h-2 w-1/2 mx-auto bg-white my-4 origin-left"
          />
          <BreakingText
            text="BROKEN."
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter text-amber-200 mt-2"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-lg md:text-xl lg:text-2xl text-blue-200/90 max-w-2xl mx-auto font-medium mt-8 md:mt-12 leading-snug tracking-tight"
          >
            Ghosting. Bots. Randoms that don't even go here. <br className="hidden md:block" />
            We're fixing it for <span className="text-white border-b-2 border-white/50 font-bold hover:border-white transition-colors">MEC</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-10"
          >
            <Link href="/register" className="group relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-[#CCFF00] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-[#CCFF00] text-black text-lg md:text-xl font-black px-8 py-4 md:px-12 md:py-5 uppercase tracking-widest hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform shadow-[4px_4px_0px_#fff] hover:shadow-[8px_8px_0px_#fff]">
                Fix Your Love Life
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 text-white"
        >
          <ArrowRight className="w-8 h-8 rotate-90" />
        </motion.div>
      </section>

      {/* SECTION 2: THE SOLUTION (Acid Green) */}
      <section className="h-screen sticky top-0 flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 py-12 text-center overflow-hidden">
        <MarqueeText className="bg-black text-[#CCFF00] absolute top-8 md:top-12 rotate-2 shadow-xl z-20 w-[120%]">VERIFIED • REAL • EXCLUSIVE •</MarqueeText>
        <MarqueeText direction={-1} className="bg-black text-[#CCFF00] absolute bottom-8 md:bottom-12 -rotate-2 shadow-xl z-20 w-[120%]">NO BOTS • NO CATFISH • JUST STUDENTS •</MarqueeText>

        <div className="relative z-30 max-w-5xl mt-8 md:mt-16">
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-black leading-none tracking-tighter mb-8 md:mb-12 relative drop-shadow-xl">
            BUT NOT <br /> HERE.
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: false }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="absolute -top-4 -right-4 md:-top-8 md:-right-8"
            >
              <Zap className="w-16 h-16 md:w-32 md:h-32 text-black fill-black animate-pulse" />
            </motion.div>
          </h2>

          <div className="flex flex-col gap-5 md:gap-7 text-left max-w-lg mx-auto">
            {['Verified MEC Students Only', 'Zero Bots Allowed', 'Safe & Secure'].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-4 md:gap-5 text-black font-bold text-base md:text-xl lg:text-2xl group cursor-default"
              >
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="border-b-2 border-transparent group-hover:border-black/50 transition-colors">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: DATING MODE (Hot Pink) - GSAP PINNED PORTAL */}
      <section ref={datingSectionRef} className="h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden perspective-[2000px] z-10 bg-[#001530]">
        {/* BACKGROUND that transitions to pink */}
        <div className="absolute inset-0 bg-[#FF0099] opacity-0 z-10" id="dating-bg" />

        {/* INTRO TEXT - Fades out before heart zooms */}
        <div
          ref={introTextRef}
          className="absolute top-1/4 left-0 right-0 z-50 text-center px-6"
        >
          <p className="text-xl md:text-3xl lg:text-4xl font-semibold text-white/70 tracking-widest uppercase mb-3">
            Ready to dive into
          </p>
          <p className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            somebody's heart?
          </p>
        </div>

        {/* ZOOMING HEART - Expands outward, fills screen with pink */}
        <div
          ref={heartRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 origin-center"
        >
          <Heart className="h-[15vh] w-auto fill-[#FF0099] stroke-white stroke-2" />
        </div>

        {/* CONTENT - On top of everything, revealed as heart zooms past */}
        <div
          ref={contentRef}
          className="relative z-40 grid md:grid-cols-2 items-center max-w-7xl mx-auto gap-12 w-full opacity-0 scale-90"
        >
          <div className="text-left px-4 md:px-0">
            <StaggeredText text="FIND YOUR" className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-none tracking-tighter justify-center md:justify-start mb-2" />
            <StaggeredText text="CRUSH" className="text-5xl md:text-7xl lg:text-8xl font-black text-white stroke-black text-stroke-2 leading-none tracking-tighter justify-center md:justify-start" />
          </div>

          <TiltCard className="w-full px-4 md:px-0">
            <div className="bg-black text-[#FF0099] p-6 md:p-12 border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_rgba(0,0,0,1)] max-w-md mx-auto aspect-3/4 flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <Heart className="w-10 h-10 md:w-16 md:h-16 fill-[#FF0099]" />
                <span className="text-2xl md:text-4xl font-black opacity-20">01</span>
              </div>

              <div>
                <h3 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 uppercase tracking-tighter">Dating <br /> Mode</h3>
                <p className="text-base md:text-lg font-medium text-white/90 leading-normal">
                  Swipe right on people you actually see around campus.
                  Real connections. Real dates.
                </p>
              </div>

              <div className="flex gap-2 mt-6 md:mt-8">
                <div className="h-2 md:h-4 w-full bg-[#FF0099] rounded-full group-hover:animate-pulse" />
                <div className="h-2 md:h-4 w-1/3 bg-white rounded-full" />
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* SECTION 4: FRIEND MODE (Electric Blue) */}
      <section className="h-screen sticky top-0 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden perspective-[2000px]">
        <div className="relative z-10 grid md:grid-cols-2 items-center max-w-7xl mx-auto gap-8 md:gap-12 w-full">
          <TiltCard className="w-full order-2 md:order-1 px-4 md:px-0">
            <div className="bg-black text-[#00F0FF] p-6 md:p-12 border-4 border-black shadow-[-10px_10px_0px_rgba(0,0,0,1)] md:shadow-[-20px_20px_0px_rgba(0,0,0,1)] max-w-md mx-auto aspect-[3/4] flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <Globe className="w-10 h-10 md:w-16 md:h-16" />
                <span className="text-2xl md:text-4xl font-black opacity-20">02</span>
              </div>

              <div>
                <h3 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 uppercase tracking-tighter">Friend <br /> Mode</h3>
                <div className="inline-flex items-center gap-2 mb-4 md:mb-6 bg-[#00F0FF] text-black px-3 py-1 md:px-4 md:py-1 rounded-full text-xs md:text-sm font-bold uppercase">
                  <CheckCircle2 className="w-3 h-3 md:w-4 h-4" /> Platonic Only
                </div>
                <p className="text-base md:text-lg font-medium text-white/90 leading-normal">
                  Find study partners, gym bros, or a new squad.
                  Zero mixed signals. 100% chill.
                </p>
              </div>

              <div className="w-full h-px bg-white/20 mt-6 md:mt-8 group-hover:bg-[#00F0FF] transition-colors" />
            </div>
          </TiltCard>

          <div className="text-right order-1 md:order-2 px-4 md:px-0">
            <StaggeredText text="FIND YOUR" className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-none tracking-tighter justify-center md:justify-end mb-2" />
            <StaggeredText text="SQUAD" className="text-5xl md:text-7xl lg:text-8xl font-black text-white stroke-black text-stroke-2 leading-none tracking-tighter justify-center md:justify-end" />
          </div>
        </div>
      </section>

      {/* SECTION 5: FINALE (Black) */}
      <section className="h-screen sticky top-0 flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 py-12 text-center bg-[#050505] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#CCFF00_0%,transparent_50%)] opacity-15 pointer-events-none" />

        <div className="relative z-10">
          <StaggeredText
            text="READY?"
            className="text-7xl md:text-9xl font-black leading-[0.9] mb-10 md:mb-14 tracking-tighter"
          />

          <Link href="/register" className="group relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-[#CCFF00] blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative bg-[#CCFF00] text-black text-lg md:text-3xl lg:text-4xl font-black px-8 py-5 md:px-14 md:py-8 uppercase tracking-wider hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform duration-200 shadow-[4px_4px_0px_#fff] hover:shadow-[8px_8px_0px_#fff]">
              Join The Club
            </div>
          </Link>

          <div className="mt-16 md:mt-24 flex flex-col items-center gap-3">
            <p className="text-gray-500 font-mono tracking-[0.25em] text-xs md:text-sm">EST. 2026 • MEC CAMPUS</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-500 tracking-wider">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  )
}
