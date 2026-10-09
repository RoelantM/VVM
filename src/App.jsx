import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene, { scroll } from './Scene.jsx'
import { CartProvider, CartDrawer, ShopSection, useCart } from './Shop.jsx'
import { club, news, matches, teamGroups, sponsors } from './data.js'

gsap.registerPlugin(ScrollTrigger)
const fmt = (d) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

function Nav() {
  const c = useCart()
  return (
    <nav className="nav">
      <a href="#top" className="brand">VVM<span> Lions</span></a>
      <div className="links">
        {[['nieuws', 'Nieuws'], ['wedstrijden', 'Wedstrijden'], ['teams', 'Teams'], ['shop', 'Shop'], ['sponsors', 'Sponsors'], ['contact', 'Contact']].map(([h, l]) => <a key={h} href={'#' + h}>{l}</a>)}
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
        <header className="hero">
          <div className="wrap">
            <p className="eyebrow">Sportpark Markgouw · Monnickendam</p>
            <h1>Green-White<br />Lions</h1>
            <p className="lead">De voetbalvereniging van Monnickendam. Samen spelen, samen winnen.</p>
            <div className="cta"><a className="btn" href="#wedstrijden">Programma</a><a className="btn ghost" href="#shop">Naar de shop</a></div>
          </div>
        </header>

        <section id="nieuws" className="section"><div className="wrap">
          <p className="eyebrow">Nieuws</p><h2>Laatste nieuws</h2>
          <div className="grid three">{news.map((n) => (
            <article key={n.title} className="card reveal"><time>{fmt(n.date)}</time><h3>{n.title}</h3><p>{n.text}</p></article>))}
          </div>
        </div></section>

        <section id="wedstrijden" className="section"><div className="wrap">
          <p className="eyebrow">Wedstrijden</p><h2>Komend programma</h2>
          <ul className="matches">{matches.map((m, i) => (
            <li key={i} className="card reveal"><span className="when">{m.when}</span><span className="vs">{m.home} <em>–</em> {m.away}</span><span className="muted">{m.place}</span></li>))}
          </ul>
        </div></section>

        <section id="teams" className="section"><div className="wrap">
          <p className="eyebrow">Teams</p><h2>Alle teams</h2>
          <div className="grid three">{teamGroups.map((g) => (
            <div key={g.title} className="card reveal"><h3>{g.title}</h3><div className="chips">{g.items.map((t) => <span key={t}>{t}</span>)}</div></div>))}
          </div>
        </div></section>

        <ShopSection />

        <section id="sponsors" className="section"><div className="wrap">
          <p className="eyebrow">Sponsors</p><h2>Samen sterk</h2>
          <div className="grid six">{sponsors.map((s) => <div key={s} className="card sponsor reveal">{s}</div>)}</div>
          <p className="lead">Ook sponsor worden? Mail naar <a href={'mailto:' + club.sponsorMail}>{club.sponsorMail}</a>.</p>
        </div></section>

        <section id="contact" className="section"><div className="wrap">
          <p className="eyebrow">Contact</p><h2>Kom langs</h2>
          <p className="lead">{club.name}<br />{club.address}<br />Tel. <a href={'tel:' + club.phone.replace(/-/g, '')}>{club.phone}</a></p>
        </div></section>
      </main>
      <footer className="foot">© {new Date().getFullYear()} {club.name} · {club.nick}</footer>
    </CartProvider>
  )
}
