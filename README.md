# VV Monnickendam – nieuwe website

React + Vite + Three.js (react-three-fiber) + GSAP/Lenis. 3D-voetbal en decor (doel, pion, hoekvlag) reageren op scrollen. Inclusief webshop met winkelmand.

```
npm install
npm run dev     # ontwikkelen
npm run build   # productiebuild in dist/
```

## Status
- `src/data.js` bevat de echte inhoud van www.vvmonnickendam.nl (nieuws, teams, contributie, contacten, toernooien). Nog placeholder: sponsorlogo's/-namen, productprijzen en -foto's webshop, trainingsschema (staat als afbeelding op de site), echt logo.
- Webshop: winkelmand en Stripe-afrekenen zijn gebouwd; getest met een gemockte Stripe-API, nog niet met een echte testsleutel.
- Kleuren/logo zijn aannames (groen-wit); echt logo toevoegen.

## Inhoud beheren (CMS)
Alle inhoud staat in `content/*.json` en is bewerkbaar via Decap CMS op `/admin` (nieuws, menu, clubgegevens, teams, contributie, contacten, sponsors, toernooien, webshopproducten).

**Lokaal proberen:** `npm run cms` (terminal 1) en `npm run dev` (terminal 2), open daarna http://localhost:5173/admin/index.html.

**Live (Netlify):**
1. Koppel de repo aan een Netlify-site (build `npm run build`, publish `dist`; staat in `netlify.toml`).
2. Site settings → Identity → Enable; Registration: *Invite only*; daarna Services → Git Gateway → Enable.
3. Identity → Invite users: redacteuren ontvangen een mail en loggen in op `/admin`.
4. Zet in `public/admin/config.yml` de juiste `branch` (nu `main`).

## Betalen (Stripe)
`netlify/functions/checkout.mjs` maakt een Stripe Checkout-sessie (iDEAL/kaart). Prijzen komen alleen uit `content/products.json`; producten zonder prijs zijn niet te bestellen.
Zet in Netlify (Site settings → Environment variables) `STRIPE_SECRET_KEY` (eerst een `sk_test_...` sleutel). iDEAL activeer je in het Stripe-dashboard onder betaalmethoden.

## Wedstrijdprogramma (KNVB/Sportlink)
`netlify/functions/programma.mjs` haalt het programma, de uitslagen en afgelastingen live op (pagina's `#/wedstrijden`, `#/uitslagen`, `#/afgelastingen` en per team `#/teams/<teamcode>`) en cachet het 10 minuten (`?team=<Sportlink-teamcode>` voor één team; codes staan in het CMS bij Teams). Lokaal draait dezelfde code via de Vite dev-server. Bij een storing toont de site de handmatige wedstrijden uit het CMS.

Let op: de bron is de publieke HTML van de huidige clubsite (`netlify/lib/programma.mjs`). Verandert Sportlink die opmaak, of verdwijnt de oude clubsite, dan moet de parser mee. De stabiele route is de officiële Sportlink Club.Dataservice (clientId aanvragen bij Sportlink/KNVB); alleen `fetchProgram()` hoeft dan vervangen te worden.

## Achtergrondfoto's
Via het CMS (Pagina-instellingen → Achtergrondfoto's) kun je per sectie een foto instellen. Die wordt grijs, vervaagd en heel transparant getoond. Zonder foto's verandert er niets. Gebruik alleen foto's waarvoor toestemming is (AVG).

## Pagina's en menu
De site heeft aparte pagina's (hash-routes, geen server-instellingen nodig): `#/shop`, `#/teams`, `#/wedstrijden`, `#/uitslagen`, `#/afgelastingen`, `#/lid-worden`, `#/sponsoring`, `#/toernooien`, `#/nieuws`, `#/contact` en inhoudspagina's `#/club/...` en `#/leden/...`.
Alles is bewerkbaar in `/admin`:
- **Menu** (Pagina-instellingen → Menu): items, uitklapmenu's, bovenbalk, knop, volgorde en zichtbaarheid.
- **Pagina's** (collectie "Pagina's"): tekst met koppen, lijsten, tabellen, links en afbeeldingen (Markdown-editor). De bestandsnaam bepaalt de route: `club-jeugd` → `#/club/jeugd`, `leden-kleding` → `#/leden/kleding`. Een nieuwe pagina? Maak hem aan met een naam als `club-nieuwe-pagina` en zet een menu-item met doel `#/club/nieuwe-pagina`.
- **Nieuws**: titel, datum, afbeelding, korte tekst en volledig bericht.
- **Lid worden en contributie**, **Teams**, **Contacten**, **Sponsors**, **Webshopproducten**: eigen formulieren.
Het logo staat in `public/logo.png` (vervang het bestand om het te wijzigen).

## Next.js-landingpage (demo)
`landing-next/` bevat een losstaande, cinematic landingpage in Next.js + Tailwind + Framer Motion + React Three Fiber (donker thema, neon-groen). Los van de hoofdsite: `cd landing-next && npm install && npm run dev` → http://localhost:3000.
