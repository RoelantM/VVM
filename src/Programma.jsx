import { useEffect, useMemo, useState } from 'react'
import { matches as fallback, matchesUrl, resultsUrl, teamOptions } from './data.js'

// Haalt het programma live op via /.netlify/functions/programma (KNVB/Sportlink-data via de clubsite).
// Lukt dat niet (bv. offline), dan tonen we de handmatige wedstrijden uit het CMS.
export default function Programma() {
  const [team, setTeam] = useState('')
  const [state, setState] = useState({ status: 'loading', matches: [] })
  useEffect(() => {
    const ac = new AbortController()
    setState((s) => ({ ...s, status: 'loading' }))
    fetch('/.netlify/functions/programma' + (team ? '?team=' + team : ''), { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((d) => setState({ status: 'ok', matches: d.matches }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ status: 'fallback', matches: [] }) })
    return () => ac.abort()
  }, [team])

  const shown = useMemo(() => {
    if (state.status === 'fallback') return fallback.map((m, i) => ({ id: 'f' + i, date: '', time: m.when, home: m.home, away: m.away, place: m.place }))
    return state.matches.slice(0, 12)
  }, [state])
  const groups = useMemo(() => shown.reduce((a, m) => ((a[m.date] ||= []).push(m), a), {}), [shown])

  return (
    <>
      <label className="muted">Team{' '}
        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Kies een team">
          <option value="">Alle teams</option>
          {teamOptions.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
        </select>
      </label>
      {state.status === 'loading' && <p className="muted" aria-live="polite">Programma laden…</p>}
      {state.status === 'ok' && shown.length === 0 && <p className="muted">Geen wedstrijden gepland.</p>}
      {Object.entries(groups).map(([date, list]) => (
        <div key={date}>
          {date && <h3 className="day">{date}</h3>}
          <ul className="matches">{list.map((m) => (
            <li key={m.id} className="card">
              <span className="when">{m.time}</span>
              <span className="vs">{m.home} <em>–</em> {m.away}</span>
              <span className="muted">{m.place}</span>
            </li>))}
          </ul>
        </div>
      ))}
      {state.status === 'fallback' && <p className="muted">Live programma nu niet beschikbaar.</p>}
      <p className="lead"><a href={matchesUrl} target="_blank" rel="noreferrer">Volledig programma</a> · <a href={resultsUrl} target="_blank" rel="noreferrer">Uitslagen</a></p>
    </>
  )
}
