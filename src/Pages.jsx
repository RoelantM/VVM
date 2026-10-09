import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Programma from './Programma.jsx'
import { ShopSection } from './Shop.jsx'
import { club, news, pages, teamGroups, teamLabel, teamByCode, membership, contacts, sponsors, tournaments } from './data.js'

DOMPurify.addHook('afterSanitizeAttributes', (n) => {
  if (n.tagName === 'A' && /^https?:/.test(n.getAttribute('href') || '')) { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer') }
})
export function Md({ text }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(text || '', { breaks: false })), [text])
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
export const fmt = (d) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

function Head({ eyebrow, title, children, crumbs }) {
  return (
    <>
      {crumbs && <p className="crumbs"><a href="#/">Home</a> / {crumbs}</p>}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="ph">{title}</h1>{children}
    </>
  )
}
const Page = ({ id, children }) => <section id={id} className="page"><div className="wrap">{children}</div></section>

export function ContentPage({ slug, groupLabel }) {
  const p = pages[slug]
  if (!p) return <NotFound />
  return <Page id="page"><Head title={p.title} crumbs={groupLabel ? <>{groupLabel} / {p.title}</> : p.title} /><Md text={p.body} /></Page>
}

export function NotFound() {
  return <Page id="page"><Head title="Pagina niet gevonden"><p className="lead">Deze pagina bestaat niet (meer). <a href="#/">Terug naar home</a>.</p></Head></Page>
}

export function NewsList() {
  return (
    <Page id="nieuws"><Head eyebrow="Nieuws" title="Nieuws" />
      <div className="grid three">{news.map((n) => <NewsCard key={n.slug} n={n} />)}</div>
    </Page>
  )
}
export function NewsCard({ n }) {
  return (
    <article className="card reveal">
      {n.image && <img className="newsimg" src={n.image} alt="" loading="lazy" />}
      <time>{fmt(n.date)}</time><h3>{n.title}</h3><p>{n.text}</p><a href={'#/nieuws/' + n.slug}>Lees meer</a>
    </article>
  )
}
export function NewsDetail({ slug }) {
  const n = news.find((x) => x.slug === slug)
  if (!n) return <NotFound />
  return (
    <Page id="page"><Head crumbs={<><a href="#/nieuws">Nieuws</a> / {n.title}</>} title={n.title}><time className="muted">{fmt(n.date)}</time></Head>
      {n.image && <img className="newsimg" src={n.image} alt="" />}
      <Md text={n.body || n.text} />
    </Page>
  )
}

export function TeamsPage() {
  const total = teamGroups.reduce((n, g) => n + g.items.length, 0)
  return (
    <Page id="teams"><Head eyebrow="Teams" title="Alle teams"><p className="lead">{total} teams, van de jongste jeugd tot de senioren. Kies een team voor het programma en de uitslagen.</p></Head>
      {teamGroups.map((g) => (
        <div key={g.title} className="reveal">
          <h3 style={{ marginTop: '2rem' }}>{g.title} <span className="muted">· {g.items.length}</span></h3>
          <div className="teamgrid">{g.items.map((t) => (
            <a key={t.code || t.name + t.day} className="teamtile" href={t.code ? '#/teams/' + t.code : undefined}>
              <strong>{t.name}</strong><span className="muted">{t.day}</span>
            </a>))}
          </div>
        </div>))}
    </Page>
  )
}

export function TeamPage({ code }) {
  const t = teamByCode(code)
  if (!t) return <NotFound />
  return (
    <Page id="page"><Head crumbs={<><a href="#/teams">Teams</a> / {teamLabel(t)}</>} eyebrow={t.group} title={t.name}><p className="muted">{t.day[0].toUpperCase() + t.day.slice(1)}competitie</p></Head>
      <h2 className="sub">Programma</h2><Programma kind="programma" fixedTeam={code} />
      <h2 className="sub">Uitslagen</h2><Programma kind="uitslagen" fixedTeam={code} />
    </Page>
  )
}

const PROG = {
  wedstrijden: ['Wedstrijden', 'Programma'],
  uitslagen: ['Wedstrijden', 'Uitslagen'],
  afgelastingen: ['Wedstrijden', 'Afgelastingen'],
}
export function ProgramPage({ kind }) {
  const [eb, title] = PROG[kind]
  return (
    <Page id={kind === 'wedstrijden' ? 'wedstrijden' : 'page'}><Head eyebrow={eb} title={title} />
      <p className="subnav"><a className={kind === 'wedstrijden' ? 'on' : ''} href="#/wedstrijden">Programma</a><a className={kind === 'uitslagen' ? 'on' : ''} href="#/uitslagen">Uitslagen</a><a className={kind === 'afgelastingen' ? 'on' : ''} href="#/afgelastingen">Afgelastingen</a></p>
      <Programma kind={kind === 'wedstrijden' ? 'programma' : kind} />
    </Page>
  )
}

export function ShopPage() {
  return <div className="shoppage"><ShopSection /></div>
}

export function Membership() {
  const m = membership
  return (
    <Page id="lid"><Head eyebrow="Lid worden" title="Kom voetballen"><p className="lead">{m.intro}</p></Head>
      <p><a className="btn" href={club.joinUrl} target="_blank" rel="noreferrer">Inschrijven via KNVB</a></p>
      <div className="grid three steps">{m.steps.map((t) => <article key={t.title} className="card reveal"><h3>{t.title}</h3><p className="muted">{t.text}</p></article>)}</div>
      <h2 style={{ marginTop: '3rem' }}>{m.tiersTitle}</h2><p className="lead">{m.tiersIntro}</p>
      <div className="grid three tiers">{m.tiers.map((t) => (
        <article key={t.name} className={'card tier reveal tier-' + t.name.toLowerCase()}><span className="badge">{t.name}</span><h3>{t.headline}</h3><p>{t.detail}</p></article>))}
      </div>
      <div className="card fees reveal" style={{ marginTop: 16 }}>
        <h3>{m.feeNote}</h3>
        <table><thead><tr><th>Lidsoort</th><th>Per halfjaar</th><th>Per jaar</th></tr></thead>
          <tbody>{m.fees.map((f) => <tr key={f.label}><td>{f.label}</td><td>{f.half}</td><td>{f.price}</td></tr>)}</tbody></table>
        {m.feeFootnote && <p className="muted">{m.feeFootnote}</p>}
      </div>
    </Page>
  )
}

export function ContactPage() {
  return (
    <Page id="contact"><Head eyebrow="Contact" title="Kom langs">
      <p className="lead">{club.name}<br />{club.address}<br />Tel. <a href={'tel:' + club.phone.replace(/-/g, '')}>{club.phone}</a></p></Head>
      <div className="grid three">{contacts.map(([f, n, m]) => <div key={f} className="card reveal"><h3>{f}</h3><p>{n}<br /><a href={'mailto:' + m}>{m}</a></p></div>)}</div>
      <p className="lead">{Object.entries(club.social).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer">{k}{' '}</a>)}</p>
    </Page>
  )
}

export function SponsorPage() {
  const p = pages.sponsoring
  return (
    <Page id="sponsors"><Head eyebrow="Sponsoring" title={p?.title || 'Sponsoring'} />
      {p && <Md text={p.body} />}
      <div className="grid six">{sponsors.map((s, i) => {
        const inner = s.logo ? <img src={s.logo} alt={s.name} /> : s.name
        return s.url ? <a key={i} href={s.url} target="_blank" rel="noreferrer" className="card sponsor reveal">{inner}</a> : <div key={i} className="card sponsor reveal">{inner}</div>
      })}</div>
      <p className="lead">Sponsor worden? Mail naar <a href={'mailto:' + club.sponsorMail}>{club.sponsorMail}</a>.</p>
    </Page>
  )
}

export function TournamentPage() {
  const p = pages.toernooien
  return <Page id="page"><Head eyebrow="Toernooien" title={p?.title || 'Toernooien'} />{p && <Md text={p.body} />}
    <div className="grid three">{tournaments.map((t) => <div key={t.name} className="card reveal"><h3>{t.name}</h3><p>{t.for}</p></div>)}</div></Page>
}
