'use client'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, CalendarClock, Heart, MapPin, Phone, Shirt, Trophy, Users, Volleyball } from 'lucide-react'
import { Stagger, Item } from '../components/Reveal'
import GlassCard from '../components/GlassCard'

// Three.js alleen in de browser laden
const Hero3D = dynamic(() => import('../components/Hero3D'), { ssr: false })

const facts = [
  { icon: Trophy, value: '1930', label: 'opgericht' },
  { icon: Users, value: '±500', label: 'leden' },
  { icon: Volleyball, value: '27', label: 'teams' },
]

export default function Page() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <main className="relative overflow-x-clip">
      {/* achtergrond: vloeiende gradients */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full bg-neon/20 blur-[140px]" />
        <div className="absolute -right-48 top-1/3 h-[560px] w-[560px] rounded-full bg-emerald-500/15 blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full bg-teal-400/10 blur-[140px]" />
      </div>

      {/* HERO */}
      <section className="relative grid min-h-screen place-items-center px-6">
        <div className="absolute inset-0 -z-0 opacity-90 md:left-1/4"><Hero3D /></div>
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 mx-auto w-full max-w-6xl pointer-events-none">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-neon">
            V.V. Monnickendam · Sportpark Markgouw
          </motion.p>
          <h1 className="font-display text-[clamp(4.5rem,17vw,15rem)] uppercase leading-[0.82] tracking-tight">
            {['Green-White', 'Lions'].map((w, i) => (
              <span key={w} className="block overflow-hidden">
                <motion.span className={`block ${i ? 'bg-gradient-to-r from-neon to-emerald-300 bg-clip-text text-transparent' : ''}`}
                  initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
            className="mt-8 max-w-md text-lg text-slate-300">
            De enige veldvoetbalvereniging van Monnickendam. Plezier, respect en sportiviteit.
          </motion.p>
        </motion.div>
        <a href="#over" aria-label="Scroll naar beneden" className="absolute bottom-8 z-10 animate-bounce text-neon"><ArrowDown /></a>
      </section>

      {/* OVER ONS */}
      <section id="over" className="mx-auto max-w-6xl px-6 py-32">
        <Stagger className="grid gap-16 md:grid-cols-2">
          <div>
            <Item><p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-neon">Over ons</p></Item>
            <Item><h2 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">Een club<br />van het dorp</h2></Item>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-slate-300">
            <Item><p>Opgericht op 18 september 1930 en sinds die dag de enige veldvoetbalvereniging van Monnickendam. Van één veld aan de Overlekergouw groeide VVM uit tot een vereniging met een sterke binding aan het dorp.</p></Item>
            <Item><p>Iedereen is welkom: van jeugdspelers die hun eerste stappen zetten tot senioren die nog wekelijks spelen. Presteren mag, leren staat altijd voorop.</p></Item>
            <Item>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {facts.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <Icon className="mb-2 text-neon" size={20} aria-hidden />
                    <div className="font-display text-4xl text-white">{value}</div>
                    <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </Item>
          </div>
        </Stagger>
      </section>

      {/* PRAKTISCHE INFO */}
      <section id="info" className="mx-auto max-w-6xl px-6 pb-32">
        <Stagger>
          <Item><p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-neon">Praktisch</p></Item>
          <Item><h2 className="mb-12 font-display text-6xl uppercase leading-[0.9] md:text-7xl">Kom langs</h2></Item>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Item><GlassCard icon={MapPin} title="Locatie">
              <p>Sportpark Markgouw</p><p>Cornelis Dirkszoonlaan 342</p><p>1141 XS Monnickendam</p>
            </GlassCard></Item>
            <Item><GlassCard icon={Phone} title="Contact">
              <p><a className="text-neon hover:underline" href="tel:0299651291">0299-651291</a></p>
              <p className="text-sm text-slate-400">Vragen over lidmaatschap, jeugd of vrijwilligerswerk? Bel of mail ons.</p>
            </GlassCard></Item>
            <Item><GlassCard icon={CalendarClock} title="Trainingen">
              <p>Trainingstijden verschillen per team.</p>
              <p className="text-sm text-slate-400">Het schema voor 2026/27 vind je bij de club.</p>
            </GlassCard></Item>
            <Item><GlassCard icon={Heart} title="Proeftraining">
              <p>Eerst kijken of voetbal bij je past? Volg gratis een proeftraining en leer club, team en trainers kennen.</p>
            </GlassCard></Item>
            <Item><GlassCard icon={Shirt} title="Clubkleding">
              <p>Spelers krijgen shirt, broekje en sokken van de club. Overige kleding via de webshop.</p>
            </GlassCard></Item>
            <Item><GlassCard icon={Users} title="Lid worden">
              <p><a className="font-semibold text-neon hover:underline" href="https://www.knvb.nl/ontdek-voetbal/inschrijven/BBFW684">Inschrijven via de KNVB →</a></p>
            </GlassCard></Item>
          </div>
        </Stagger>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} V.V. Monnickendam · Green-White Lions
      </footer>
    </main>
  )
}
