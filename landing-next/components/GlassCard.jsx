'use client'
import { useRef } from 'react'

// Glassmorphism-kaart: backdrop-blur + een glow die de muis volgt.
export default function GlassCard({ icon: Icon, title, children, className = '' }) {
  const ref = useRef(null)
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--x', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
  return (
    <div
      ref={ref}
      onMouseMove={move}
      className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-neon/40 hover:shadow-neon ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(260px circle at var(--x,50%) var(--y,50%), rgba(57,255,136,.18), transparent 70%)' }}
      />
      <div className="relative">
        {Icon && <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-neon/30 bg-neon/10 text-neon"><Icon size={24} aria-hidden /></span>}
        <h3 className="mb-2 font-display text-2xl uppercase tracking-wide text-white">{title}</h3>
        <div className="space-y-1 text-slate-300">{children}</div>
      </div>
    </div>
  )
}
