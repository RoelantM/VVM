import { fetchProgram } from '../lib/programma.mjs'

// GET /.netlify/functions/programma?team=<teamcode>  -> { matches: [...], source, fetchedAt }
export default async (req) => {
  const sp = new URL(req.url).searchParams
  const team = sp.get('team') || undefined
  const kind = ['uitslagen', 'afgelastingen'].includes(sp.get('kind')) ? sp.get('kind') : 'programma'
  try {
    const matches = await fetchProgram({ team, kind })
    return new Response(JSON.stringify({ matches, source: 'clubsite', fetchedAt: new Date().toISOString() }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Programma tijdelijk niet beschikbaar' }), { status: 502, headers: { 'content-type': 'application/json' } })
  }
}
