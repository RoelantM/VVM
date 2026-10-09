// Haalt het wedstrijdprogramma op van de clubsite (Sportlink Clubsites, gevoed door KNVB-data) en zet het om naar JSON.
// Let op: dit leest de publieke HTML van de clubsite; als Sportlink de opmaak wijzigt moet parseProgram() mee.
// Officiële route (stabieler): Sportlink Club.Dataservice met een club-clientId (zie README).
const BASE = process.env.CLUBSITE_URL || 'https://www.vvmonnickendam.nl/sites/BBFW684'

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()

const src = (tag) => { const m = /\ssrc="([^"]+)"/.exec(tag); return m ? m[1].replace(/&amp;/g, '&') : '' }
// Logo's komen van de Sportlink-CDN met een tijdelijke link; daarom halen we ze elke keer vers mee.
const logo = (tag) => { const u = src(tag); return /^https:\/\/binaries\.sportlink\.com\//.test(u) ? u : '' }

export function parseProgram(html) {
  const out = []
  // Per datum een <section><h3>zaterdag 10 oktober</h3> ... wedstrijden ... </section>
  const sections = html.split(/<h3[^>]*>/).slice(1)
  for (const sec of sections) {
    const end = sec.indexOf('</h3>')
    const date = text(sec.slice(0, end))
    const body = sec.slice(end)
    const re = /<span[^>]*>([^<]+)<\/span>\s*(<img[^>]*>)\s*<\/div>\s*(<time[\s\S]*?<\/time>|<div[^>]*>\s*<span[^>]*>[^<]*<\/span>\s*<\/div>)\s*<div[^>]*>\s*(<img[^>]*>)\s*<span[^>]*>([^<]+)<\/span>\s*<\/div>\s*<a[^>]*href="\/sites\/[^/]+\/wedstrijd\/(\d+)"/g
    let m
    while ((m = re.exec(body))) {
      const mid = m[3]
      const t = /(\d{1,2}:\d{2})<\/span>\s*<span[^>]*>([^<]*)<\/span>/.exec(mid)
      const note = t ? '' : text(mid) // "2 - 2" (uitslag) of "Afgelast"
      out.push({ id: m[6], date, time: t ? t[1] : '', place: t ? text(t[2]) : '', note, home: text(m[1]), away: text(m[5]), homeLogo: logo(m[2]), awayLogo: logo(m[4]), url: `${BASE}/wedstrijd/${m[6]}` })
    }
  }
  return out
}

// kind: 'programma' (standaard) | 'uitslagen' | 'afgelastingen'
export async function fetchProgram({ team, kind = 'programma' } = {}) {
  const q = team && /^\d+$/.test(team) ? `?teamCode=${team}` : ''
  const url = kind === 'uitslagen' ? (q ? `${BASE}/widgets/match-results${q}` : `${BASE}/uitslagen`)
    : kind === 'afgelastingen' ? `${BASE}/afgelastingen`
    : (q ? `${BASE}/widgets/match-program${q}` : `${BASE}/eerstvolgende-wedstrijden`)
  const res = await fetch(url, { headers: { 'user-agent': 'vvm-website/1.0 (+https://www.vvmonnickendam.nl)' }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('Clubsite gaf status ' + res.status)
  return parseProgram(await res.text())
}
