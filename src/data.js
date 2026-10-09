// Inhoud overgenomen van www.vvmonnickendam.nl (okt 2026). Items met "PLACEHOLDER" zijn nog niet gevonden op de huidige site.

export const club = {
  name: 'V.V. Monnickendam',
  nick: 'Green-White Lions',
  address: 'Sportpark Markgouw, Cornelis Dirkszoonlaan 342, 1141 XS Monnickendam',
  phone: '0299-651291',
  sponsorMail: 'sponsoring@vvmonnickendam.nl',
  founded: 1930,
  members: 500,
  teams: 30,
  intro: 'De enige veldvoetbalvereniging van Monnickendam, opgericht op 18 september 1930. Plezier, respect en sportiviteit staan centraal.',
  social: {
    Facebook: 'https://www.facebook.com/vvmonnickendam/',
    Instagram: 'https://www.instagram.com/v.v.monnickendam/',
    X: 'https://x.com/VVMonnickendam',
  },
  joinUrl: 'https://www.knvb.nl/ontdek-voetbal/inschrijven/BBFW684',
  oldShopUrl: 'https://vvmkleding.netlify.app/',
  siteUrl: 'https://www.vvmonnickendam.nl/sites/BBFW684',
}

const nieuwsUrl = (id) => `${club.siteUrl}/nieuws/${id}`

export const news = [
  { date: '2026-09-16', title: 'Grote Clubactie 2026', text: 'Van 19 september t/m dinsdag 27 oktober verkopen de kinderen loten. Speler en team met de meeste loten winnen prijzen; winnaars worden 14 november bekendgemaakt tijdens Super Saturday in de kantine.', url: nieuwsUrl('01a0aa08-1f12-734c-98b1-9fbd4e83832b') },
  { date: '2026-08-21', title: 'Vrijwilligersochtend', text: 'Zondag 30 augustus van 09:00 tot 12:00 maken we de club klaar voor het nieuwe seizoen. Aanmelden via secretaris@vvmonnickendam.nl.', url: nieuwsUrl('01a02383-708f-7e84-ad2f-0cdf5a20650b') },
  { date: '2026-04-26', title: 'Sponsor in de spotlight: Bernice Perk Uitvaartbegeleiding', text: 'Bernice Perk begeleidt sinds 2017 vanuit Marken families bij het afscheid en steunt de club als sponsor.', url: nieuwsUrl('019dc8e5-af22-7b11-afd0-e619a5ec2961') },
  { date: '2026-04-17', title: 'Selectie V.V. Monnickendam krijgt verder vorm', text: 'Technische staf blijft, drie oud-spelers keren terug en de kern blijft bij elkaar. Gezamenlijk doel: terugkeer van het eerste naar de 2e klasse.', url: nieuwsUrl('019d9cb0-5154-7651-93ac-4b365a62e25e') },
  { date: '2026-03-01', title: 'Algemene Ledenvergadering 2026', text: 'ALV op 18 maart om 20:00 uur in de kantine, met terugblik op seizoen 2024-2025.', url: nieuwsUrl('019ca9b2-9f55-7c4c-be9a-c82c5d3d99a5') },
]

// Eerstvolgende wedstrijd zoals op de site; volledig programma staat bij Sportlink.
export const matches = [
  { when: 'za 10 okt 15:30', home: 'Real Sranang sv. 1', away: 'Monnickendam 1', place: 'Uit' },
]
export const matchesUrl = `${club.siteUrl}/eerstvolgende-wedstrijden`
export const resultsUrl = `${club.siteUrl}/uitslagen`

export const teamGroups = [
  { title: 'Senioren heren', items: ['Zaterdag 1', 'Zaterdag 2', 'Zaterdag 3', 'Zondag 2', 'Zondag 45+1', 'Zondag 45+2', 'Zondag 45+3'] },
  { title: 'Vrouwen', items: ['Zondag VR1'] },
  { title: 'Junioren', items: ['O14-1', 'O15-1', 'O16-1'] },
  { title: 'Pupillen', items: ['O8-1', 'O8-2', 'O8-3JM', 'O9-1', 'O9-2', 'O9-3', 'O10-1', 'O10-2', 'O10-3', 'O11-1', 'O11-2', 'O11-3', 'O11-4', 'O13-1', 'O13-2', 'O13-3'] },
]
export const teamsUrl = `${club.siteUrl}/teams`

export const tournaments = [
  { name: 'Ynze Waterlander Toernooi', for: 'O8 t/m O12' },
  { name: 'Jan Wittensleger Toernooi', for: 'O13 t/m O16' },
  { name: 'Waterland Cup', for: 'Verenigingen uit de Waterlandse regio' },
]

export const membership = {
  note: 'Aanmelden via de KNVB; eerst een proeftraining kan. Gouden lid: geen contributie, ±5 uur vrijwilligerswerk per week. Zilver (standaard): normale contributie + beperkt aantal taken. Brons: normale contributie + €100 vrijwilligersbijdrage.',
  fees: [
    ['Kabouters', '€ 73,50'], ['5-6 jaar', '€ 157,50'], ['7-9 jaar', '€ 168,00'], ['10-11 jaar', '€ 189,00'],
    ['12-14 jaar', '€ 199,50'], ['15-16 jaar', '€ 215,25'], ['17-19 jaar', '€ 236,25'], ['Senioren', '€ 273,00'],
    ['Senioren selectie', '€ 299,25'], ['35+ / 45+', '€ 173,25'], ['Walking voetbal', '€ 57,75'],
  ],
  feeNote: 'Bedragen per jaar.',
}

export const contacts = [
  ['Ledenadministratie', 'Nicolette Combee', 'ledenadministratie@vvmonnickendam.nl'],
  ['Jeugdvoetbal', 'Werner Moison', 'jeugdvoorzitter@vvmonnickendam.nl'],
  ['Wedstrijdsecretariaat', 'Foeke Tichelaar', 'wedstrijdsecretaris@vvmonnickendam.nl'],
  ['Ledendienst / vrijwilligers', 'Michelle Oudhuis', 'ledendienst@vvmonnickendam.nl'],
  ['Toernooicommissie', 'Sebas de Groot', 'toernooicommissie@vvmonnickendam.nl'],
  ['Sponsorcommissie', 'Remco Heeres', 'sponsoring@vvmonnickendam.nl'],
  ['Kledingcommissie', 'Niels Kuijpers', 'kledingcommissie@vvmonnickendam.nl'],
]

// PLACEHOLDER: sponsorlogo's/-namen staan als afbeelding op de huidige site; alleen Bernice Perk is bij naam bekend.
export const sponsors = ['Bernice Perk Uitvaartbegeleiding', 'Sponsor (logo volgt)', 'Sponsor (logo volgt)', 'Sponsor (logo volgt)', 'Sponsor (logo volgt)', 'Sponsor (logo volgt)']

// Echt assortiment (kledingpagina): trainingsbroeken, half-/full-zips, regenjassen, parka, sporttassen, rugzakken,
// scheenbeschermers, extra sokken, shirts; bedrukken mogelijk. PLACEHOLDER: prijzen/foto's staan niet op de site (price: null).
export const products = [
  { id: 'shirt', name: 'Clubshirt', price: null, color: '#0a8f3c', trim: '#ffffff' },
  { id: 'trainingsbroek', name: 'Trainingsbroek', price: null, color: '#10261a', trim: '#0a8f3c' },
  { id: 'halfzip', name: 'Half-zip / full-zip', price: null, color: '#0a8f3c', trim: '#ffffff' },
  { id: 'regenjas', name: 'Regenjas / parka', price: null, color: '#10261a', trim: '#ffffff' },
  { id: 'tas', name: 'Sporttas / rugzak', price: null, color: '#f4f4f0', trim: '#0a8f3c' },
  { id: 'sokken', name: 'Sokken & scheenbeschermers', price: null, color: '#0a8f3c', trim: '#ffffff', scarf: true },
]
