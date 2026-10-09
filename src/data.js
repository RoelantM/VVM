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
  social: { Facebook: settings.facebook, Instagram: settings.instagram, X: settings.x },
}
export const matchesUrl = settings.matchesUrl
export const resultsUrl = settings.resultsUrl
export const teamsUrl = settings.teamsUrl

export const menu = menuFile.items.filter((m) => m.visible !== false)
export const news = Object.values(newsFiles).sort((a, b) => String(b.date).localeCompare(String(a.date)))
export const matches = matchesFile.items
export const teamGroups = teamsFile.groups.map((g) => ({ title: g.title, items: g.items.map((i) => i.name) }))
export const teamOptions = teamsFile.groups.flatMap((g) => g.items.filter((i) => i.code).map((i) => ({ name: i.name, code: i.code })))
export const tournaments = tournamentsFile.items
export const membership = {
  intro: membershipFile.intro,
  tiers: membershipFile.tiers,
  feeNote: membershipFile.feeNote,
  fees: membershipFile.fees.map((f) => [f.label, f.price]),
}
export const contacts = contactsFile.items.map((c) => [c.role, c.name, c.email])
export const sponsors = sponsorsFile.items
export const products = productsFile.items
  .filter((p) => p.active !== false)
  .map((p) => ({ ...p, sizes: (p.sizes || '').split(',').map((s) => s.trim()).filter(Boolean) }))

// Achtergrondfoto's per sectie (leeg tot de club foto's aanlevert); zie content/photos.json
export const photos = Object.fromEntries((photosFile.items || []).filter((p) => p.image).map((p) => [p.section, p]))
