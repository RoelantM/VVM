# VV Monnickendam – nieuwe website: overdracht van context

Doel van dit document: een andere Claude-chat (bv. werk-account) kan hiermee zonder voorkennis verder. Plak dit bestand of laat de chat de repo lezen (`docs/CONTEXT.md` + `CLAUDE.md`).

- Repo: `roelantm/vvm` · werkbranch: `claude/vvm-website-redesign-kb4gx2` (alles staat hier gepusht; er is bewust **geen pull request** gemaakt)
- Laatst bijgewerkt: 2026-10-19

## 1. Opdracht en achtergrond
De gebruiker is bij voetbalvereniging **V.V. Monnickendam** (bijnaam *Green-White Lions*, Sportpark Markgouw, Cornelis Dirkszoonlaan 342, 1141 XS Monnickendam, tel. 0299-651291). Gewenst: een vernieuwde, "state-of-the-art" website met 3D-animaties van voetbal en attributen door de hele site, een webshop, en een CMS waarmee vrijwilligers zonder code content én menu kunnen aanpassen. Huidige site: `www.vvmonnickendam.nl/sites/BBFW684` (Sportlink Clubsites). Club: opgericht 18 sep 1930, ±500 leden, 27 teams in de lijst (de oude tekst zegt "30").

## 2. Genomen beslissingen
| Onderwerp | Besluit |
|---|---|
| Stack hoofdsite | React 19 + Vite 8, react-three-fiber/drei/three, GSAP + Lenis, marked + DOMPurify |
| CMS | **Decap CMS** op `/admin`, login via **Netlify Identity** + Git Gateway (gebruiker koos dit) |
| Betalen | **Stripe Checkout** (iDEAL/kaart) via Netlify Function (gebruiker koos Stripe, niet Shopify) |
| Hosting | Netlify (de club gebruikt Netlify al voor de oude webshop) |
| Thema | **Licht**: wit/lichtgroen, logo-groen `#009040`, knoptekst/links `#007a35`, steunkleur `#80c040`. (Eerst donker; gebruiker vroeg expliciet "lichter, wit en groen zoals het logo") |
| Routing | Hash-routes (`#/...`), geen server-instellingen nodig |
| Logo | `public/logo.png` (115×160, transparant; uit de oude pagina gehaald) |

## 3. Werkregels van de gebruiker (blijvend)
1. Communiceer in het **Nederlands**.
2. **Verzin niets.** Wat niet gevonden is blijft duidelijk placeholder (nu: productprijzen/maten, sponsorlogo's, trainingstijden, achtergrondfoto's).
3. **Geen verwijzingen naar de oude site** in de nieuwe site (links, afbeeldingen, PDF's). Assets zijn naar `public/uploads` gekopieerd. Enige bewuste uitzondering: de *databron* van programma/uitslagen/teamlogo's (zie §6).
4. **Alles moet bewerkbaar blijven via het CMS** ("op de één of andere manier editable"): pagina's, nieuws, menu, teams, contacten, sponsors, contributie, producten.
5. Commit + push naar de werkbranch; **geen PR** tenzij de gebruiker erom vraagt.
6. Test vóór opleveren (`npm run build` + headless browser/Playwright), en laat zien met screenshots.
7. Wees eerlijk over beperkingen (bv. cloudsessie kan geen browser/terminal op de laptop van de gebruiker openen).
8. **Privacy/AVG:** geen spelersfoto's/-namen van de oude teampagina's overnemen (individuele pasfoto's, ook van jeugd). Teamfoto's alleen via de club met toestemming.
9. Datum/tijd: Nederlands formaat; teksten in je/jij-vorm zoals de club.

## 4. Architectuur
```
content/            alle inhoud als JSON (CMS bewerkt dit)
  menu.json         hoofdmenu + uitklap + bovenbalk + CTA
  settings.json     clubgegevens, socials, KNVB-inschrijflink
  teams.json        groepen -> teams {name, day, code (Sportlink-teamcode)}
  news/*.json       nieuws {date,title,text,image,body(markdown)}
  pages/<groep>-<naam>.json   inhoudspagina's (markdown); route #/<groep>/<naam>
  membership.json, contacts.json, sponsors.json, tournaments.json, matches.json (fallback), photos.json, products.json
public/admin/       Decap (index.html + config.yml; local_backend aan)
public/uploads/     afbeeldingen/PDF's uit de oude site + CMS-uploads
src/                App.jsx (router, header, home), Pages.jsx, Programma.jsx, Shop.jsx, Scene.jsx (3D), data.js (laadt content), styles.css
netlify/functions/  checkout.mjs (Stripe), programma.mjs (programma/uitslagen/afgelastingen)
netlify/lib/programma.mjs   parser + fetch van clubsite-HTML
vite.config.js      dev-plugin die de programma-functie lokaal bedient
landing-next/       LOSSE Next.js-demo (Tailwind, Framer Motion, R3F); niet gekoppeld aan hoofdsite
.claude/launch.json startconfiguraties (dev-server, CMS)
```
Routes: `#/` (home), `shop`, `teams`, `teams/<code>`, `wedstrijden` (volledig programma), `uitslagen`, `afgelastingen`, `lid-worden`, `contact`, `sponsoring`, `toernooien`, `nieuws`, `nieuws/<slug>`, `club/<naam>`, `leden/<naam>`. Pagina `club-club-van-100` → `#/club/club-van-100`. Een nieuwe pagina = nieuw bestand `club-xyz.json` + menu-item met doel `#/club/xyz`.

## 5. 3D-scène (`src/Scene.jsx`)
Eén vaste `<Canvas>` achter de pagina. Objecten worden aan DOM-elementen gehangen via `Pinned anchor="<id>"` (secties hebben ids: `top`, `nieuws`, `wedstrijden`, `teams`, `shop`, `lid`, `sponsors`, `contact`, `page`). Hoofdbal: shader-voetbalpatroon, stuitert (sneller bij scrollen), wisselt per sectie van kant (`SPEC`), lichtvlek op de grond. Decor: pionnen (nieuws), doel met golvend net (wedstrijden), 3D-hoekvlag met wapperend doek (teams/contact), 3D-clubshirt (shop), orbit-ballen (sponsors), `Sparkles`. Let op: `getEl` valideert `id` (React hergebruikt DOM-nodes tussen routes); decor zonder anker wordt verborgen. `prefers-reduced-motion` schakelt animatie vrijwel uit. Bekende beperking: op mobiel kan de bal in de hero tekst overlappen.

## 6. Programma / "KNVB-integratie"
- Er is **geen officiële KNVB/Sportlink-API-koppeling**. `netlify/lib/programma.mjs` leest de publieke HTML van de oude clubsite (`/eerstvolgende-wedstrijden`, `/uitslagen`, `/afgelastingen`, `/widgets/match-program?teamCode=`, `/widgets/match-results?teamCode=`) en geeft JSON terug (datum, tijd, plaats, thuis/uit, score/afgelast, teamlogo's van `binaries.sportlink.com`). Cache 10 min. Bij storing toont de site `content/matches.json`.
- **Risico:** als Sportlink de opmaak wijzigt of de oude clubsite verdwijnt, breekt dit. Stabiele route: officiële **Sportlink Club.Dataservice** met clubspecifieke clientId (aan te vragen door de club); dan alleen `fetchProgram()` vervangen.
- Homepage toont alleen de eerstvolgende speeldag + knoppen naar `#/wedstrijden` en `#/uitslagen`.
- Teamcodes (Sportlink): zie `content/teams.json`. Zaterdag 2 én Zondag 2 heten beide "Monnickendam 2" → altijd speeldag erbij tonen. O8–O10 hebben geen wedstrijddata (lege staat).

## 7. Webshop & Stripe
- `Shop.jsx` (winkelmand, maatkeuze) → `POST /.netlify/functions/checkout` → Stripe Checkout Session. Prijzen/maten komen **alleen** uit `content/products.json` (server-side validatie); product zonder prijs = "Binnenkort", niet bestelbaar.
- Env var in Netlify: `STRIPE_SECRET_KEY` (begin met `sk_test_…`). iDEAL activeren in het Stripe-dashboard. Afhalen in de kantine; extra veld "bedrukking" (naam/initialen).
- Getest alleen met een gemockte Stripe-API; **nog niet met een echte testsleutel**. Lokaal werkt afrekenen niet (functie draait alleen op Netlify).
- Echt assortiment (kledingpagina): trainingsbroeken, half-/full-zips, regenjassen, parka, sporttassen, rugzakken, scheenbeschermers, extra sokken, shirts; leden krijgen shirt, broekje en sokken gratis van de club; bedrukken mogelijk; leden korting. Prijzen/maten/foto's ontbreken.

## 8. CMS (Decap) opzetten op Netlify
1. Netlify-site koppelen aan de repo (build `npm run build`, publish `dist`; staat in `netlify.toml`).
2. Identity aanzetten (registratie: *invite only*), Git Gateway aanzetten, redacteuren uitnodigen.
3. `public/admin/config.yml` → `backend.branch` staat op `main`; aanpassen als de hoofdbranch anders heet.
4. Lokaal: `npm run cms` + `npm run dev` → `http://localhost:5173/admin/index.html`.

## 9. Lokaal draaien
Node 20+ nodig. `git clone https://github.com/roelantm/vvm.git && cd vvm && git checkout claude/vvm-website-redesign-kb4gx2 && npm install && npm run dev` → http://localhost:5173. Windows-fout "npm is not recognized" = Node.js niet geïnstalleerd/terminal niet herstart. `landing-next/`: `cd landing-next && npm install && npm run dev` (poort 3000).

## 10. Teststrategie die we gebruikten
Playwright (staat in `/opt/node-tools` in de cloudcontainer) met `--use-gl=swiftshader` voor WebGL; screenshots per route; controle op console-errors; scan van alle `href/src` op verwijzingen naar de oude site (`vvmonnickendam.nl/sites`, `sportlink-clubsites`, `vvmkleding`); functietests voor checkout (503 zonder sleutel, 400 bij onbekend/zonder prijs/foute maat, correcte bedragen in centen met mock).

## 11. Open punten / vragen aan de club
- Productprijzen, maten, productfoto's; Stripe-account + testsleutel.
- Sponsorlogo's en -namen (alleen Bernice Perk Uitvaartbegeleiding bekend; hoofd-/clubsponsorlogo's stonden als plaatje op de oude site). Sponsormail inconsistent op oude site: `sponsoring@…` (contactpagina, nu gebruikt) vs `sponsorcommissie@…` (sponsorpagina).
- Statuten-PDF bestaat niet meer; pagina verwijst naar het bestuur. Actuele PDF uploaden.
- Club-van-100-mailadres inconsistent op oude site (`club-van-100@vvmonnickendam.nl` tekst vs `clubvan100@ziggo.nl` link).
- Contactpagina/Medewerkers bevatten een privé-Gmail-adres van de wedstrijdsecretaris (zo overgenomen van de oude site); overwegen te vervangen door clubadres.
- Trainingsschema staat als afbeelding (`public/uploads/club-trainingen-1.png`, `leden-trainingen-1.png`); tijden niet als tekst beschikbaar.
- Teamfoto's als subtiele achtergrond: mechanisme klaar (CMS → Achtergrondfoto's), maar nog geen foto's met toestemming.
- Eventueel officiële Sportlink Club.Dataservice aanvragen.
- Mobiel: hero-bal overlapt tekst; hero-logo-tekst klein (SVG-logo gewenst).
- Netlify/Identity/Stripe daadwerkelijk koppelen en end-to-end testen.

## 12. Bekende valkuilen
- De cloudsessie kan geen browser/terminal op de laptop van de gebruiker openen; geef commando's i.p.v. te beloven dat je "het opent".
- `pkill -f` met een patroon dat in het eigen commando voorkomt beëindigt de shell (exit 144); gebruik specifieke PID's.
- Vite dev: `/admin/` zonder `index.html` toont de SPA; gebruik `/admin/index.html`.
- WebFetch parafraseert; voor letterlijke tekst: `curl` + eigen HTML→Markdown (zo gedaan voor de pagina's).
- Signed `binaries.sportlink.com`-logo-URL's verlopen; daarom worden ze bij elke functie-aanroep vers meegegeven (niet opslaan in content).

## 13. Bronnenoverzicht oude site (voor controle/herimport)
Menu: Teams · Club (Vereniging, Jeugd, Vrijwilligers, Medewerkers, Statuten, AVG Privacyreglement, Club van 100, Lidmaatschap, Trainingen) · Wedstrijden (Eerstvolgende, Uitslagen, Afgelastingen) · Leden (Kleding, Trainingen) · Sponsoring · Lid worden (KNVB) · bovenbalk: Toernooien, Webshop (`vvmkleding.netlify.app`, oude losse bestelapp), Nieuws, Contact. Inschrijven: `https://www.knvb.nl/ontdek-voetbal/inschrijven/BBFW684`. Socials: facebook.com/vvmonnickendam, instagram.com/v.v.monnickendam, x.com/VVMonnickendam.
