import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene, { scroll } from './Scene.jsx'
import { CartProvider, CartDrawer, ShopSection, useCart } from './Shop.jsx'
import Programma from './Programma.jsx'
import { club, menu, news, photos, teamGroups, teamsUrl, tournaments, membership, contacts, sponsors } from './data.js'

gsap.registerPlugin(ScrollTrigger)
const fmt = (d) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

function Bg({ id }) {
  const p = photos[id]
  return p ? <div className="bgphoto" role="img" aria-label={p.alt || ''} style={{ backgroundImage: `url(${p.image})` }} /> : null
}

function Nav() {
  const c = useCart()
  return (
    <nav className="nav">
      <a href="#top" className="brand">VVM<span> Lions</span></a>
      <div className="links">
        {menu.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
      </div>
      <button className="cartbtn" onClick={() => c.setOpen(true)}>Winkelmand ({c.count})</button>
    </nav>
  )
}

export default function App() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = reduce ? null : new Lenis()
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      scroll.p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
    }
    lenis?.on('scroll', () => { update(); ScrollTrigger.update() })
    addEventListener('scroll', update)
    const tick = (t) => lenis?.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    if (!reduce) {
      gsap.utils.toArray('.reveal').forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }))
    }
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); removeEventListener('scroll', update); ScrollTrigger.getAll().forEach((s) => s.kill()) }
  }, [])

  return (
    <CartProvider>
      <Scene />
      <Nav />
      <CartDrawer />
      <main id="top">
        <header className="hero"><Bg id="top" />
          <div className="wrap">
            <p className="eyebrow">Sportpark Markgouw · Monnickendam</p>
            <h1>Green-White<br />Lions</h1>
            <p className="lead">{club.intro}</p>
            <p className="muted">Sinds {club.founded} · ±{club.members} leden · {club.teams} teams</p>
            <div className="cta"><a className="btn" href="#wedstrijden">Programma</a><a className="btn ghost" href="#shop">Naar de shop</a></div>
          </div>
        </header>

        <section id="nieuws" className="section"><Bg id="nieuws" /><div className="wrap">
          <p className="eyebrow">Nieuws</p><h2>Laatste nieuws</h2>
          <div className="grid three">{news.map((n) => (
            <article key={n.title} className="card reveal"><time>{fmt(n.date)}</time><h3>{n.title}</h3><p>{n.text}</p><a href={n.url} target="_blank" rel="noreferrer">Lees meer</a></article>))}
          </div>
        </div></section>

        <section id="wedstrijden" className="section"><div className="wrap">
          <p className="eyebrow">Wedstrijden</p><h2>Komend programma</h2>
          <Programma />
        </div></section>

        <section id="teams" className="section"><Bg id="teams" /><div className="wrap">
          <p className="eyebrow">Teams</p><h2>Alle teams</h2>
          <div className="grid three">{teamGroups.map((g) => (
            <div key={g.title} className="card reveal"><h3>{g.title}</h3><div className="chips">{g.items.map((t) => <span key={t}>{t}</span>)}</div></div>))}
          </div>
          <p className="lead"><a href={teamsUrl} target="_blank" rel="noreferrer">Teampagina's met programma en stand</a></p>
          <h3>Toernooien</h3>
          <div className="grid three">{tournaments.map((t) => <div key={t.name} className="card reveal"><h3>{t.name}</h3><p>{t.for}</p></div>)}</div>
        </div></section>

        <ShopSection />

        <section id="lid" className="section"><Bg id="lid" /><div className="wrap">
          <p className="eyebrow">Lid worden</p><h2>Kom voetballen</h2>
          <p className="lead">{membership.intro}</p>
          <p><a className="btn" href={club.joinUrl} target="_blank" rel="noreferrer">Inschrijven via KNVB</a></p>
          <div className="grid three tiers">{membership.tiers.map((t) => (
            <article key={t.name} className={'card tier reveal tier-' + t.name.toLowerCase()}>
              <span className="badge">{t.name}</span><h3>{t.headline}</h3><p>{t.detail}</p>
            </article>))}
          </div>
          <div className="card fees reveal">
            <h3>{membership.feeNote}</h3>
            <dl>{membership.fees.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
        </div></section>

        <section id="sponsors" className="section"><Bg id="sponsors" /><div className="wrap">
          <p className="eyebrow">Sponsors</p><h2>Samen sterk</h2>
          <div className="grid six">{sponsors.map((s, i) => {
            const inner = s.logo ? <img src={s.logo} alt={s.name} /> : s.name
            return s.url ? <a key={i} href={s.url} target="_blank" rel="noreferrer" className="card sponsor reveal">{inner}</a> : <div key={i} className="card sponsor reveal">{inner}</div>
          })}</div>
          <p className="lead">Sponsorlogo's volgen. Ook sponsor worden? Mail naar <a href={'mailto:' + club.sponsorMail}>{club.sponsorMail}</a>.</p>
        </div></section>

        <section id="contact" className="section"><Bg id="contact" /><div className="wrap">
          <p className="eyebrow">Contact</p><h2>Kom langs</h2>
          <p className="lead">{club.name}<br />{club.address}<br />Tel. <a href={'tel:' + club.phone.replace(/-/g, '')}>{club.phone}</a></p>
          <ul className="contacts">{contacts.map(([f, n, m]) => <li key={f}><strong>{f}</strong> {n} · <a href={'mailto:' + m}>{m}</a></li>)}</ul>
          <p>{Object.entries(club.social).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer">{k} </a>)}</p>
        </div></section>
      </main>
      <footer className="foot">© {new Date().getFullYear()} {club.name} · {club.nick}</footer>
    </CartProvider>
  )
}
