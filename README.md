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
