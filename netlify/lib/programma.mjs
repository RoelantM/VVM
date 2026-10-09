// Haalt het wedstrijdprogramma op van de clubsite (Sportlink Clubsites, gevoed door KNVB-data) en zet het om naar JSON.
// Let op: dit leest de publieke HTML van de clubsite; als Sportlink de opmaak wijzigt moet parseProgram() mee.
// Officiële route (stabieler): Sportlink Club.Dataservice met een club-clientId (zie README).
const BASE = process.env.CLUBSITE_URL || 'https://www.vvmonnickendam.nl/sites/BBFW684'

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()

export function parseProgram(html) {
  const out = []
  // Per datum een <section><h3>zaterdag 10 oktober</h3> ... wedstrijden ... </section>
  const sections = html.split(/<h3[^>]*>/).slice(1)
  for (const sec of sections) {
    const end = sec.indexOf('</h3>')
    const date = text(sec.slice(0, end))
    const body = sec.slice(end)
    const re = /<span[^>]*>([^<]+)<\/span>\s*<img[^>]*>\s*<\/div>\s*<time[^>]*>\s*<span[^>]*>(\d{1,2}:\d{2})<\/span>\s*<span[^>]*>([^<]*)<\/span>\s*<\/time>\s*<div[^>]*>\s*<img[^>]*>\s*<span[^>]*>([^<]+)<\/span>\s*<\/div>\s*<a[^>]*href="\/sites\/[^/]+\/wedstrijd\/(\d+)"/g
    let m
    while ((m = re.exec(body))) {
      out.push({ id: m[5], date, time: m[2], home: text(m[1]), away: text(m[4]), place: text(m[3]), url: `${BASE}/wedstrijd/${m[5]}` })
    }
  }
  return out
}

export async function fetchProgram({ team } = {}) {
  const url = team && /^\d+$/.test(team) ? `${BASE}/widgets/match-program?teamCode=${team}` : `${BASE}/eerstvolgende-wedstrijden`
  const res = await fetch(url, { headers: { 'user-agent': 'vvm-website/1.0 (+https://www.vvmonnickendam.nl)' }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('Clubsite gaf status ' + res.status)
  return parseProgram(await res.text())
}
