import { useEffect, useMemo, useState } from 'react'
import { matches as fallback, teamOptions } from './data.js'

const Shield = () => <svg className="crest" viewBox="0 0 24 28" aria-hidden="true"><path d="M12 1 3 4v9c0 6 4 11 9 14 5-3 9-8 9-14V4z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".5" /></svg>
// Teamlogo (Sportlink-CDN); bij ontbreken of fout een neutraal wapen
function Crest({ src, name }) {
  const [bad, setBad] = useState(false)
  if (!src || bad) return <Shield />
  return <img className="crest" src={src} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />
}

const EMPTY = { programma: 'Geen wedstrijden gepland.', uitslagen: 'Geen uitslagen.', afgelastingen: 'Geen afgelastingen.' }

// Live programma/uitslagen/afgelastingen via /.netlify/functions/programma (KNVB/Sportlink-data).
// firstDayOnly: alleen de eerstvolgende speeldag (voor de homepage). fixedTeam: vaste teamcode (teampagina).
// Lukt ophalen niet, dan tonen we de handmatige wedstrijden uit het CMS.
export default function Programma({ kind = 'programma', firstDayOnly = false, fixedTeam = '', hideFilter = false }) {
  const [team, setTeam] = useState(fixedTeam)
  const [state, setState] = useState({ status: 'loading', matches: [] })
  const [all, setAll] = useState(false)
  useEffect(() => setTeam(fixedTeam), [fixedTeam])
  useEffect(() => {
    const ac = new AbortController()
    setState((s) => ({ ...s, status: 'loading' }))
    fetch('/.netlify/functions/programma?kind=' + kind + (team ? '&team=' + team : ''), { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((d) => setState({ status: 'ok', matches: d.matches }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ status: 'fallback', matches: [] }) })
    return () => ac.abort()
  }, [team, kind])

  const shown = useMemo(() => {
    if (state.status === 'fallback') return fallback.map((m, i) => ({ id: 'f' + i, date: '', time: m.when, home: m.home, away: m.away, place: m.place }))
    if (!firstDayOnly) return state.matches
    const first = state.matches[0]?.date
    return state.matches.filter((m) => m.date === first)
  }, [state, firstDayOnly])
  const LIMIT = firstDayOnly ? 8 : 30
  const visible = all ? shown : shown.slice(0, LIMIT)
  const groups = useMemo(() => visible.reduce((a, m) => ((a[m.date] ||= []).push(m), a), {}), [visible])

  return (
    <>
      {kind !== 'afgelastingen' && !hideFilter && !fixedTeam && (
        <label className="muted">Team{' '}
          <select value={team} onChange={(e) => { setTeam(e.target.value); setAll(false) }} aria-label="Kies een team">
            <option value="">Alle teams</option>
            {teamOptions.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
        </label>
      )}
      {state.status === 'loading' && <p className="muted" aria-live="polite">Laden…</p>}
      {state.status === 'ok' && shown.length === 0 && <p className="muted">{EMPTY[kind]}</p>}
      {Object.entries(groups).map(([date, list]) => (
        <div key={date}>
          {date && <h3 className="day">{date}</h3>}
          <ul className="matches">{list.map((m) => (
            <li key={m.id} className="card">
              <span className="when">{m.time || (kind === 'uitslagen' ? <span className="score">{m.note}</span> : <span className="note-cancel">{m.note}</span>)}</span>
              <span className="vs"><span className="side"><Crest src={m.homeLogo} name={m.home} />{m.home}</span> <em>–</em> <span className="side"><Crest src={m.awayLogo} name={m.away} />{m.away}</span></span>
              <span className="muted">{m.place}</span>
            </li>))}
          </ul>
        </div>
      ))}
      {shown.length > LIMIT && <p><button className="btn ghost small" onClick={() => setAll(!all)}>{all ? 'Minder tonen' : `Toon alle ${shown.length} wedstrijden`}</button></p>}
      {state.status === 'fallback' && <p className="muted">Live programma nu niet beschikbaar.</p>}
    </>
  )
}
