import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene, { scroll } from './Scene.jsx'
import { CartProvider, CartDrawer, useCart } from './Shop.jsx'
import Programma from './Programma.jsx'
import { ContentPage, NewsList, NewsCard, NewsDetail, TeamsPage, ProgramPage, ShopPage, Membership, ContactPage, SponsorPage, TournamentPage, NotFound } from './Pages.jsx'
import { club, menu, news, photos } from './data.js'

gsap.registerPlugin(ScrollTrigger)

const parse = () => decodeURIComponent(location.hash.replace(/^#\/?/, '').replace(/\/$/, ''))
function useRoute() {
  const [r, setR] = useState(parse)
  useEffect(() => {
    const f = () => { setR(parse()); window.scrollTo(0, 0) }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return r
}

function Bg({ id }) {
  const p = photos[id]
  return p ? <div className="bgphoto" role="img" aria-label={p.alt || ''} style={{ backgroundImage: `url(${p.image})` }} /> : null
}

function Header({ route }) {
  const c = useCart()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [route])
  return (
    <header className="hdr">
      <div className="util">{menu.utility.map((u) => <a key={u.label} href={u.href}>{u.label}</a>)}</div>
      <div className="bar">
        <a href="#/" className="logo" aria-label={club.name + ' – home'}><img src="/logo.png" alt={club.name} /></a>
        <nav className={'mainnav' + (open ? ' open' : '')} aria-label="Hoofdmenu">
          {menu.items.map((m) => m.children?.length ? (
            <div className="item" key={m.label}>
              <button className="top" aria-haspopup="true">{m.label} <span aria-hidden="true">▾</span></button>
              <div className="sub">{m.children.map((ch) => <a key={ch.label} href={ch.href}>{ch.label}</a>)}</div>
            </div>
          ) : <div className="item" key={m.label}><a href={m.href}>{m.label}</a></div>)}
          {menu.cta && <a className="cta" href={menu.cta.href}>{menu.cta.label}</a>}
          <div className="util-m">{menu.utility.map((u) => <a key={u.label} href={u.href}>{u.label}</a>)}</div>
        </nav>
        <button className="cartbtn" onClick={() => c.setOpen(true)}>Winkelmand ({c.count})</button>
        <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>☰</button>
      </div>
    </header>
  )
}

function Home() {
  return (
    <>
      <header className="hero">
        <Bg id="top" />
        <div className="wrap">
          <p className="eyebrow">Sportpark Markgouw · Monnickendam</p>
          <h1>Green-White<br />Lions</h1>
          <p className="lead">{club.intro}</p>
          <p className="muted">Sinds {club.founded} · ±{club.members} leden · {club.teams} teams</p>
          <div className="cta"><a className="btn" href="#/wedstrijden">Programma</a><a className="btn ghost" href="#/shop">Naar de shop</a></div>
        </div>
      </header>

      <section id="wedstrijden" className="section"><div className="wrap">
        <p className="eyebrow">Wedstrijden</p><h2>Eerstvolgende speeldag</h2>
        <Programma />
      </div></section>

      <section id="nieuws" className="section"><Bg id="nieuws" /><div className="wrap">
        <p className="eyebrow">Nieuws</p><h2>Laatste nieuws</h2>
        <div className="grid three">{news.slice(0, 3).map((n) => <NewsCard key={n.slug} n={n} />)}</div>
        <p className="lead"><a href="#/nieuws">Alle nieuws</a></p>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="ctas">
          <a className="card reveal" href="#/lid-worden"><h3>Lid worden</h3><p>Aanmelden, proeftraining en contributie.</p></a>
          <a className="card reveal" href="#/shop"><h3>Webshop</h3><p>Clubkleding voor spelers en supporters.</p></a>
          <a className="card reveal" href="#/sponsoring"><h3>Sponsoring</h3><p>Steun de club en het dorp.</p></a>
          <a className="card reveal" href="#/club/vrijwilligers"><h3>Vrijwilligers</h3><p>Zonder vrijwilligers geen VVM.</p></a>
        </div>
      </div></section>
    </>
  )
}

function Router({ route }) {
  const [a, b] = route.split('/')
  if (route === '' || route === 'home') return <Home />
  if (route === 'nieuws') return <NewsList />
  if (a === 'nieuws' && b) return <NewsDetail slug={b} />
  if (route === 'teams') return <TeamsPage />
  if (['wedstrijden', 'uitslagen', 'afgelastingen'].includes(route)) return <ProgramPage kind={route} />
  if (route === 'shop') return <ShopPage />
  if (route === 'lid-worden' || route === 'club/lidmaatschap') return <Membership />
  if (route === 'contact') return <ContactPage />
  if (route === 'sponsoring') return <SponsorPage />
  if (route === 'toernooien') return <TournamentPage />
  return <ContentPage slug={route.replace(/\//g, '-')} groupLabel={{ club: 'Club', leden: 'Leden' }[a]} />
}

export default function App() {
  const route = useRoute()
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
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); removeEventListener('scroll', update) }
  }, [])
  useEffect(() => { // onthul-animaties per pagina
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }))
    })
    return () => ctx.revert()
  }, [route])

  return (
    <CartProvider>
      <Scene />
      <Header route={route} />
      <CartDrawer />
      <main id="top"><Router route={route} /></main>
      <footer className="foot">
        <div className="cols"><a href="#/contact">Contact</a><a href="#/club/avg">Privacy (AVG)</a><a href="#/club/statuten">Statuten</a><a href={club.social.Facebook} target="_blank" rel="noreferrer">Facebook</a><a href={club.social.Instagram} target="_blank" rel="noreferrer">Instagram</a><a href={club.social.X} target="_blank" rel="noreferrer">X</a></div>
        © {new Date().getFullYear()} {club.name} · {club.nick} · {club.address}
      </footer>
    </CartProvider>
  )
}
