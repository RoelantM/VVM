// Alle inhoud komt uit /content (JSON). Bewerkbaar via het CMS op /admin (Decap CMS).
import settings from '../content/settings.json'
import menuFile from '../content/menu.json'
import matchesFile from '../content/matches.json'
import teamsFile from '../content/teams.json'
import tournamentsFile from '../content/tournaments.json'
import membershipFile from '../content/membership.json'
import contactsFile from '../content/contacts.json'
import sponsorsFile from '../content/sponsors.json'
import photosFile from '../content/photos.json'
import productsFile from '../content/products.json'

const newsFiles = import.meta.glob('../content/news/*.json', { eager: true, import: 'default' })

export const club = {
  ...settings,
  teams: teamsFile.groups.reduce((n, g) => n + g.items.length, 0), // aantal komt uit de teamlijst
  social: { Facebook: settings.facebook, Instagram: settings.instagram, X: settings.x },
}

export const menu = {
  items: menuFile.items.filter((m) => m.visible !== false),
  utility: menuFile.utility || [],
  cta: menuFile.cta,
}
export const news = Object.entries(newsFiles)
  .map(([path, n]) => ({ ...n, slug: path.split('/').pop().replace('.json', '') }))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
export const matches = matchesFile.items
export const teamGroups = teamsFile.groups
const dayLabel = (d) => (d === 'zondag' ? 'zondag' : 'zaterdag')
export const teamLabel = (t) => `${t.name} (${dayLabel(t.day)})`
export const teamOptions = teamsFile.groups.flatMap((g) => g.items.filter((i) => i.code).map((i) => ({ name: teamLabel(i), code: i.code })))
export const teamByCode = (c) => teamsFile.groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title }))).find((i) => i.code === c)
export const tournaments = tournamentsFile.items
export const membership = membershipFile
export const contacts = contactsFile.items.map((c) => [c.role, c.name, c.email])
export const sponsors = sponsorsFile.items
export const products = productsFile.items
  .filter((p) => p.active !== false)
  .map((p) => ({ ...p, sizes: (p.sizes || '').split(',').map((s) => s.trim()).filter(Boolean) }))

// Achtergrondfoto's per sectie (leeg tot de club foto's aanlevert); zie content/photos.json
export const photos = Object.fromEntries((photosFile.items || []).filter((p) => p.image).map((p) => [p.section, p]))

// Inhoudspagina's: content/pages/<groep>-<naam>.json -> route #/<groep>/<naam> (bv. club-jeugd -> #/club/jeugd)
const pageFiles = import.meta.glob('../content/pages/*.json', { eager: true, import: 'default' })
export const pages = Object.fromEntries(Object.entries(pageFiles).map(([path, p]) => [path.split('/').pop().replace('.json', ''), p]))
